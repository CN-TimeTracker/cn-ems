import { Response } from 'express';
import { Types } from 'mongoose';
import { PayslipService } from '../services/payslip.service';
import { IAuthRequest, UserRole } from '../interfaces';
import { asyncHandler } from '../utils/asyncHandler';
import User from '../models/User.model';
import Attendance from '../models/Attendance.model';
import Leave from '../models/Leave.model';
import Holiday from '../models/Holiday.model';
import SalaryRecord from '../models/SalaryRecord.model';
import { LeaveStatus } from '../interfaces';
import path from 'path';
import fs from 'fs';

const payslipService = new PayslipService();

// Helper to check if a payout month has completed
const isPayoutMonthCompleted = (month: number, year: number) => {
  const now = new Date();
  const currentMonth = now.getUTCMonth() + 1;
  const currentYear = now.getUTCFullYear();

  if (year < currentYear) return true;
  if (year === currentYear && month < currentMonth) return true;
  return false;
};

/**
 * GET /api/v1/payslips/generate
 * [Protected]
 * Generates dynamic payslip data based on salary
 */
export const generateDynamicPayslip = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { month, year, userId } = req.query;
  
  const requestedMonth = parseInt(month as string);
  const requestedYear = parseInt(year as string);
  
  // Date restriction
  if (!isPayoutMonthCompleted(requestedMonth, requestedYear)) {
    return res.status(400).json({
      success: false,
      message: 'Payslips can only be generated for months that have already completed.'
    });
  }
  
  // If no userId provided, use current user. If provided and not current user, check admin.
  let targetUserId = req.user!.id;
  if (userId && userId !== req.user!.id) {
    if (req.user!.role !== UserRole.Admin) {
      throw new Error('Access denied. Admin only.');
    }
    targetUserId = userId as string;
  }

  const user = await User.findById(targetUserId);
  if (!user) {
    throw new Error('User not found');
  }

  // Check for SalaryRecord (approval and override)
  const salaryRecord = await SalaryRecord.findOne({ 
    userId: targetUserId, 
    month: requestedMonth, 
    year: requestedYear 
  });

  // If common user is requesting, check if it's approved
  if (req.user!.role !== UserRole.Admin && (!salaryRecord || !salaryRecord.isApproved)) {
    return res.status(403).json({
      success: false,
      message: 'Your payslip for this month is not yet approved by Admin.'
    });
  }

  // 1. Calculate LOP (Loss of Pay)
  // 1. Calculate days in month (Correctly handling month index)
  // new Date(year, monthIndex, 0) returns last day of monthIndex. 
  // If requestedMonth is 4 (April), new Date(y, 4, 0) is April 30.
  const daysInMonth = new Date(requestedYear, requestedMonth, 0).getDate();
  const startDate = new Date(Date.UTC(requestedYear, requestedMonth - 1, 1));
  const endDate = new Date(Date.UTC(requestedYear, requestedMonth - 1, daysInMonth, 23, 59, 59));

  // Fetch all necessary records for the month
  const [attendanceRecords, approvedLeaves, holidays] = await Promise.all([
    Attendance.find({ userId: targetUserId, date: { $gte: startDate, $lte: endDate } }),
    Leave.find({ 
      userId: targetUserId, 
      status: LeaveStatus.Approved,
      $or: [
        { startDate: { $gte: startDate, $lte: endDate } },
        { endDate: { $gte: startDate, $lte: endDate } },
        { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
      ]
    }),
    Holiday.find({ date: { $gte: startDate, $lte: endDate } })
  ]);

  const now = new Date();
  const currentMonth = now.getUTCMonth() + 1;
  const currentYear = now.getUTCFullYear();

  let lopDays = 0;
  const isCurrentMonth = (requestedYear === currentYear && requestedMonth === currentMonth);
  const upToDay = isCurrentMonth ? now.getUTCDate() : daysInMonth;

  for (let d = 1; d <= upToDay; d++) {
    const dayDate = new Date(Date.UTC(requestedYear, requestedMonth - 1, d));
    const dayOfWeek = dayDate.getUTCDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (isWeekend) continue;

    // Check if it's a public holiday
    const isHoliday = holidays.some(h => h.date.toISOString().split('T')[0] === dayDate.toISOString().split('T')[0]);
    if (isHoliday) continue;

    // Fetch attendance and approved leave for this specific day
    const dayString = dayDate.toISOString().split('T')[0];
    const attendance = attendanceRecords.find(a => a.date.toISOString().split('T')[0] === dayString);
    const approvedLeave = approvedLeaves.find(l => {
      const start = new Date(l.startDate);
      const end = new Date(l.endDate);
      // Strip time for multi-day compare
      const sStr = start.toISOString().split('T')[0];
      const eStr = end.toISOString().split('T')[0];
      return dayString >= sStr && dayString <= eStr;
    });

    if (attendance) {
      const hours = (attendance.totalWorkMs || 0) / (1000 * 60 * 60);
      
      if (hours >= 6) {
        // FULL DAY WORKED: No LOP
        continue;
      } else if (hours >= 3) {
        // HALF DAY WORKED: LOP is 0.5 unless leave exists
        if (approvedLeave) {
          // Any approved leave (Half or Full) covers the missing half
          continue;
        }
        lopDays += 0.5;
        continue;
      } else {
        // ABSENT ( < 3 hours ): LOP is 1 unless leave exists
        if (approvedLeave) {
          if (approvedLeave.duration === 'Full Day') {
            continue; // Fully covered
          } else {
            lopDays += 0.5; // Only half covered by leave
            continue;
          }
        }
        lopDays += 1;
        continue;
      }
    }

    // No attendance at all
    if (approvedLeave) {
      if (approvedLeave.duration === 'Full Day') {
        continue; // Fully covered
      } else {
        lopDays += 0.5; // Only half covered
        continue;
      }
    }

    // Default: Weekday, No Attendance, No Leave -> LOP
    lopDays++;
  }

  // IF OVERRIDE EXISTS, USE IT
  if (salaryRecord && typeof salaryRecord.lopOverride === 'number') {
    lopDays = salaryRecord.lopOverride;
  }

  // 1-Day EXEMPTION Logic (Casual Leave)
  const rawLop = lopDays; // Total leaves unexempted
  const exemptedLopDays = Math.max(0, lopDays - 1); // Only charge for lop-1 days

  const baseGrossSalary = user.salary || 0;
  const dailyRate = baseGrossSalary / daysInMonth;
  const lopDeduction = Math.round(exemptedLopDays * dailyRate);
  const grossSalary = baseGrossSalary - lopDeduction;

  // Formulas as per requirements (based on adjusted gross)
  const basicAndDA = Math.round(grossSalary * 0.7); // 70%
  const hra = Math.round(grossSalary * 0.3); // 30%
  const epfDeduction = Math.round(grossSalary * 0.075); // 7.5% contribution
  const employerContribution = Math.round(grossSalary * 0.075); // 7.5% contribution
  
  const professionalTax = 208; // Fixed as per reference image
  const totalDeduction = epfDeduction + professionalTax;
  const takeHome = grossSalary - totalDeduction;
  const ctc = grossSalary + employerContribution;

  // Month name helper
  const date = new Date(requestedYear, requestedMonth - 1, 1);
  const monthName = date.toLocaleString('en-US', { month: 'long' });

  const payslipData = {
    employee: {
      name: user.name,
      code: user.employeeCode || '--',
      bankName: user.bankName || '--',
      accountNo: user.accountNo || '--',
      designation: user.role || '--',
      doj: user.dateOfJoining ? user.dateOfJoining.toISOString().split('T')[0] : '--',
      epfUan: user.aadharNo || '--', // Assuming Aadhar or similar for UAN if empty
      esic: '--',
    },
    period: {
      month: monthName,
      year: year,
    },
    earnings: {
      basic: basicAndDA,
      hra: hra,
      conveyance: 0,
      leave: 0,
      grossSalary: grossSalary,
      employerContribution: employerContribution,
      ctc: ctc,
    },
    deductions: {
      epf: epfDeduction,
      esi: 0,
      pt: professionalTax,
      leave: 0,
      insurance: 0,
      tds: 0,
      totalDeduction: totalDeduction,
      takeHome: takeHome,
    },
    meta: {
      salaryForDays: daysInMonth,
      lop: exemptedLopDays,
      rawLop: rawLop,
      lopDeduction: lopDeduction,
      baseGross: baseGrossSalary,
    }
  };

  res.status(200).json({
    success: true,
    data: payslipData,
    config: salaryRecord // Return the config metadata (isApproved, lopOverride)
  });
});

/**
 * GET /api/v1/payslips/config/all
 * [Admin Only]
 */
export const getAllSalaryConfigs = asyncHandler(async (req: IAuthRequest, res: Response) => {
  if (req.user!.role !== UserRole.Admin) {
    throw new Error('Access denied. Admin only.');
  }

  const { month, year, userId } = req.query;

  const query: any = {};
  if (month && month !== 'all') query.month = parseInt(month as string);
  if (year && year !== 'all') query.year = parseInt(year as string);
  if (userId && userId !== 'all') query.userId = userId;

  // Restriction: If specific date is queried, it must be past. 
  // If 'all' is queried, we only return past months anyway for safety? 
  // No, let's just filter the results or trust the query.
  
  const configs = await SalaryRecord.find(query)
    .populate('userId', 'name employeeCode profilePicture email')
    .sort({ year: -1, month: -1 });

  res.status(200).json({
    success: true,
    data: configs
  });
});

/**
 * GET /api/v1/payslips/config/me
 * [Protected]
 * Get all configs for the logged-in user (to show history)
 */
export const getUserSalaryConfigs = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const configs = await SalaryRecord.find({ 
    userId: req.user!.id
  }).sort({ year: -1, month: -1 });

  res.status(200).json({
    success: true,
    data: configs
  });
});

/**
 * GET /api/v1/payslips/config
 * [Protected]
 */
export const getSalaryConfig = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { month, year, userId } = req.query;
  const targetUserId = userId || req.user!.id;
  
  // Date restriction
  if (!isPayoutMonthCompleted(parseInt(month as string), parseInt(year as string))) {
    return res.status(400).json({
      success: false,
      message: 'Payouts can only be generated for months that have already completed.'
    });
  }

  const config = await SalaryRecord.findOne({ 
    userId: targetUserId, 
    month: parseInt(month as string), 
    year: parseInt(year as string) 
  });

  res.status(200).json({
    success: true,
    data: config
  });
});

/**
 * POST /api/v1/payslips/config
 * [Admin Only]
 * Update LOP override and approval status
 */
export const updateSalaryConfig = asyncHandler(async (req: IAuthRequest, res: Response) => {
  if (req.user!.role !== UserRole.Admin) {
    throw new Error('Access denied. Admin only.');
  }

  const { userId, month, year, lopOverride, isApproved } = req.body;

  let config = await SalaryRecord.findOne({ userId, month, year });

  if (config) {
    if (typeof lopOverride !== 'undefined') config.lopOverride = lopOverride;
    if (typeof isApproved !== 'undefined') {
      config.isApproved = isApproved;
      if (isApproved) config.approvedBy = new Types.ObjectId(req.user!.id);
    }
    await config.save();
  } else {
    config = await SalaryRecord.create({
      userId,
      month,
      year,
      lopOverride,
      isApproved,
      approvedBy: isApproved ? req.user!.id : undefined
    });
  }

  res.status(200).json({
    success: true,
    message: 'Salary configuration updated',
    data: config
  });
});

/**
 * POST /api/v1/payslips/upload
 * [Admin Only]
 * Upload a payslip for an employee by code
 */
export const uploadPayslip = asyncHandler(async (req: IAuthRequest, res: Response) => {
  if (!req.file) {
    throw new Error('Please upload a PDF file');
  }

  const { employeeCode, month, year } = req.body;
  if (!employeeCode || !month || !year) {
    // Cleanup the uploaded temp file if validation fails
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    throw new Error('Please provide employeeCode, month, and year');
  }

  const payslip = await payslipService.uploadPayslip(
    employeeCode,
    parseInt(month),
    parseInt(year),
    req.file.path,
    req.user!.id
  );

  res.status(201).json({
    success: true,
    message: 'Payslip uploaded successfully',
    data: payslip,
  });
});

/**
 * GET /api/v1/payslips/download
 * [Protected]
 * Employee fetches their own payslip
 */
export const getPayslip = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { month, year } = req.query;
  if (!month || !year) {
    throw new Error('Please provide month and year');
  }

  const payslip = await payslipService.getPayslip(
    req.user!.id,
    parseInt(month as string),
    parseInt(year as string)
  );

  if (!payslip) {
    return res.status(404).json({
      success: false,
      message: 'no payslip available',
    });
  }

  res.status(200).json({
    success: true,
    data: payslip,
  });
});

/**
 * GET /api/v1/payslips/history
 * [Protected]
 */
export const getPayslipHistory = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const history = await payslipService.getAllForUser(req.user!.id);
  res.status(200).json({
    success: true,
    count: history.length,
    data: history,
  });
});
