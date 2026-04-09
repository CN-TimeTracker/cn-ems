"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.getMe = exports.login = void 0;
const services_1 = require("../services");
const asyncHandler_1 = require("../utils/asyncHandler");
const attendance_service_1 = require("../services/attendance.service");
const authService = new services_1.AuthService();
const attendanceService = new attendance_service_1.AttendanceService();
// ─────────────────────────────────────────────
// POST /api/v1/auth/login
// ─────────────────────────────────────────────
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
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
            }
            else {
                // Already punched in today, just resume shift (end break)
                await attendanceService.endBreak(result.user._id);
            }
        }
        catch (err) {
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
exports.getMe = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await authService.getMe(req.user.id);
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
exports.logout = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // Auto-pause shift (start a break) upon logout for non-admins
    if (req.user && req.user.role !== 'Admin') {
        try {
            await attendanceService.startBreak(req.user.id);
        }
        catch (err) {
            // Swallow (e.g. already paused or not punched in)
        }
    }
    res.status(200).json({
        success: true,
        message: 'Logged out successfully',
    });
});
//# sourceMappingURL=auth.controller.js.map