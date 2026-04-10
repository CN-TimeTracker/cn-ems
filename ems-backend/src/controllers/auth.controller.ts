import { Response } from 'express';
import { AuthService } from '../services';
import { IAuthRequest } from '../interfaces';
import { asyncHandler } from '../utils/asyncHandler';

import { AttendanceService } from '../services/attendance.service';

const authService = new AuthService();
const attendanceService = new AttendanceService();

// ─────────────────────────────────────────────
// POST /api/v1/auth/login
// ─────────────────────────────────────────────

export const login = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { email, password, lateReason } = req.body;

  const result = await authService.login({ email, password });

  // Auto-punch in or resume shift upon successful login (Only for non-Admins)
  if (result.user.role !== 'Admin') {
    try {
      const today = await attendanceService.getTodayForUser(result.user._id);
      
      if (!today) {
        // First login of the day: check if late reason is needed
        const now = new Date();
        const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
        const ist = new Date(now.getTime() + IST_OFFSET_MS);
        const hour = ist.getUTCHours();
        const minute = ist.getUTCMinutes();
        const isLateValue = hour > 9 || (hour === 9 && minute > 15);

        // First login of the day: punch in automatically
        // Late reason will be asked in the dashboard modal
        await attendanceService.punchIn(result.user._id, { lateReason });
      } else {
        // Already punched in today, just resume shift (end break)
        await attendanceService.endBreak(result.user._id);
      }
    } catch (err) {
      // Swallow errors (e.g. already resumed/punched in)
    }
  }

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result,
  });
});

// ─────────────────────────────────────────────
// GET /api/v1/auth/me        [protected]
// ─────────────────────────────────────────────

export const getMe = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const user = await authService.getMe(req.user!.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// ─────────────────────────────────────────────
// POST /api/v1/auth/logout
// JWT is stateless — client drops the token.
// We also auto-pause their shift.
// ─────────────────────────────────────────────

export const logout = asyncHandler(async (req: IAuthRequest, res: Response) => {
  // Auto-pause shift (start a break) upon logout for non-admins
  if (req.user && req.user.role !== 'Admin') {
    try {
      await attendanceService.startBreak(req.user.id);
    } catch (err) {
      // Swallow (e.g. already paused or not punched in)
    }
  }

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// ─────────────────────────────────────────────
// PATCH /api/v1/auth/password  [protected]
// ─────────────────────────────────────────────

export const updatePassword = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide both current and new password');
  }

  await authService.updatePassword(req.user!.id, currentPassword, newPassword);

  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
  });
});
