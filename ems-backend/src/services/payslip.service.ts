import Payslip from '../models/Payslip.model';
import User from '../models/User.model';
import { IPayslip } from '../interfaces';
import path from 'path';
import fs from 'fs';

export class PayslipService {
  /**
   * Admin uploads a payslip for a specific employee.
   * Maps employeeCode to a userId, then renames and stores the file.
   */
  async uploadPayslip(
    employeeCode: string,
    month: number,
    year: number,
    tempPath: string,
    adminId: string
  ): Promise<IPayslip> {
    // 1. Find user by employeeCode
    const user = await User.findOne({ employeeCode });
    if (!user) {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      throw new Error(`Employee with code "${employeeCode}" not found`);
    }

    // 2. Check if a payslip already exists for this period — delete the old file if it does
    const existing = await Payslip.findOne({ userId: user._id, month, year });
    if (existing) {
      const oldPath = path.join(process.cwd(), existing.fileUrl);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      await Payslip.deleteOne({ _id: existing._id });
    }

    // 3. Define the final path and filename
    const filename = `payslip_${user._id}_${month}_${year}.pdf`;
    const finalRelativePath = path.join('uploads', 'payslips', filename);
    const finalFullPath = path.join(process.cwd(), finalRelativePath);

    // 4. Move (rename) the file from tempPath to finalPath
    fs.renameSync(tempPath, finalFullPath);

    // 5. Save the record in the database
    const payslip = await Payslip.create({
      userId: user._id,
      month,
      year,
      fileUrl: finalRelativePath.replace(/\\/g, '/'), // Force forward slashes for URLs
      filename,
      uploadedBy: adminId,
    });

    return payslip;
  }

  /**
   * Retrieves a payslip for a specific employee.
   */
  async getPayslip(
    userId: string,
    month: number,
    year: number
  ): Promise<IPayslip | null> {
    return Payslip.findOne({ userId, month, year });
  }

  /**
   * Optional: Returns all payslips for a user (not requested but useful).
   */
  async getAllForUser(userId: string): Promise<IPayslip[]> {
    return Payslip.find({ userId }).sort({ year: -1, month: -1 });
  }
}
