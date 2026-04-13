import { Response } from 'express';
import { AttendanceService } from '../services/attendance.service';
import { IAuthRequest } from '../interfaces';
import { asyncHandler } from '../utils/asyncHandler';

const attendanceService = new AttendanceService();

// ─────────────────────────────────────────────
// POST /api/v1/attendance/punch-in  [Employee]
// ─────────────────────────────────────────────

export const punchIn = asyncHandler(async (req: IAuthRequest, res: Response) => {
  try {
    const record = await attendanceService.punchIn(req.user!.id, req.body);
    res.status(201).json({
      success: true,
      message: record.isLate ? 'Punched in (late).' : 'Punched in successfully.',
      data:    record,
    });
  } catch (err: any) {
    const status = err.statusCode || 400;
    res.status(status).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/v1/attendance/punch-out  [Employee]
// ─────────────────────────────────────────────

export const punchOut = asyncHandler(async (req: IAuthRequest, res: Response) => {
  try {
    const record = await attendanceService.punchOut(req.user!.id);
    res.status(200).json({
      success: true,
      message: 'Punched out successfully.',
      data: record,
    });
  } catch (err: any) {
    const status = err.statusCode || 400;
    res.status(status).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/v1/attendance/break/start  [Employee]
// ─────────────────────────────────────────────

export const startBreak = asyncHandler(async (req: IAuthRequest, res: Response) => {
  try {
    const record = await attendanceService.startBreak(req.user!.id);
    res.status(200).json({
      success: true,
      message: 'Break started.',
      data: record,
    });
  } catch (err: any) {
    const status = err.statusCode || 400;
    res.status(status).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/v1/attendance/break/end  [Employee]
// ─────────────────────────────────────────────

export const endBreak = asyncHandler(async (req: IAuthRequest, res: Response) => {
  try {
    const record = await attendanceService.endBreak(req.user!.id);
    res.status(200).json({
      success: true,
      message: 'Break ended.',
      data: record,
    });
  } catch (err: any) {
    const status = err.statusCode || 400;
    res.status(status).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/v1/attendance/today  [Employee]
// Today's record for the calling user
// ─────────────────────────────────────────────

export const getMyToday = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const record = await attendanceService.getTodayForUser(req.user!.id);
  res.status(200).json({
    success: true,
    data:    record ?? null,
  });
});

// ─────────────────────────────────────────────
// PATCH /api/v1/attendance/today/reason  [Employee]
// ─────────────────────────────────────────────

export const updateLateReason = asyncHandler(async (req: IAuthRequest, res: Response) => {
  try {
    const record = await attendanceService.updateTodayLateReason(req.user!.id, req.body.lateReason);
    res.status(200).json({
      success: true,
      message: 'Late reason updated successfully.',
      data: record,
    });
  } catch (err: any) {
    const status = err.statusCode || 400;
    res.status(status).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/v1/attendance/admin/today  [Admin]
// All employees + their punch-in status for today
// ─────────────────────────────────────────────

export const getAdminTodayView = asyncHandler(async (_req: IAuthRequest, res: Response) => {
  const data = await attendanceService.getAdminTodayView();
  res.status(200).json({
    success: true,
    count:   data.length,
    data,
  });
});

// ─────────────────────────────────────────────
// GET /api/v1/attendance/admin/all  [Admin]
// All attendance history with optional filters
// ─────────────────────────────────────────────

export const getAdminAllAttendanceHistory = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { userId, startDate, endDate } = req.query;

  const filters = {
    userId: userId as string | undefined,
    startDate: startDate as string | undefined,
    endDate: endDate as string | undefined,
  };

  const data = await attendanceService.getAdminAllAttendanceHistory(filters);
  res.status(200).json({
    success: true,
    count:   data.length,
    data,
  });
});
