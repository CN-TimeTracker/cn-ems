"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminTodayView = exports.updateLateReason = exports.getMyToday = exports.endBreak = exports.startBreak = exports.punchOut = exports.punchIn = void 0;
const attendance_service_1 = require("../services/attendance.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const attendanceService = new attendance_service_1.AttendanceService();
// ─────────────────────────────────────────────
// POST /api/v1/attendance/punch-in  [Employee]
// ─────────────────────────────────────────────
exports.punchIn = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const record = await attendanceService.punchIn(req.user.id, req.body);
        res.status(201).json({
            success: true,
            message: record.isLate ? 'Punched in (late).' : 'Punched in successfully.',
            data: record,
        });
    }
    catch (err) {
        const status = err.statusCode || 400;
        res.status(status).json({ success: false, message: err.message });
    }
});
// ─────────────────────────────────────────────
// POST /api/v1/attendance/punch-out  [Employee]
// ─────────────────────────────────────────────
exports.punchOut = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const record = await attendanceService.punchOut(req.user.id);
        res.status(200).json({
            success: true,
            message: 'Punched out successfully.',
            data: record,
        });
    }
    catch (err) {
        const status = err.statusCode || 400;
        res.status(status).json({ success: false, message: err.message });
    }
});
// ─────────────────────────────────────────────
// POST /api/v1/attendance/break/start  [Employee]
// ─────────────────────────────────────────────
exports.startBreak = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const record = await attendanceService.startBreak(req.user.id);
        res.status(200).json({
            success: true,
            message: 'Break started.',
            data: record,
        });
    }
    catch (err) {
        const status = err.statusCode || 400;
        res.status(status).json({ success: false, message: err.message });
    }
});
// ─────────────────────────────────────────────
// POST /api/v1/attendance/break/end  [Employee]
// ─────────────────────────────────────────────
exports.endBreak = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const record = await attendanceService.endBreak(req.user.id);
        res.status(200).json({
            success: true,
            message: 'Break ended.',
            data: record,
        });
    }
    catch (err) {
        const status = err.statusCode || 400;
        res.status(status).json({ success: false, message: err.message });
    }
});
// ─────────────────────────────────────────────
// GET /api/v1/attendance/today  [Employee]
// Today's record for the calling user
// ─────────────────────────────────────────────
exports.getMyToday = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const record = await attendanceService.getTodayForUser(req.user.id);
    res.status(200).json({
        success: true,
        data: record ?? null,
    });
});
// ─────────────────────────────────────────────
// PATCH /api/v1/attendance/today/reason  [Employee]
// ─────────────────────────────────────────────
exports.updateLateReason = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const record = await attendanceService.updateTodayLateReason(req.user.id, req.body.lateReason);
        res.status(200).json({
            success: true,
            message: 'Late reason updated successfully.',
            data: record,
        });
    }
    catch (err) {
        const status = err.statusCode || 400;
        res.status(status).json({ success: false, message: err.message });
    }
});
// ─────────────────────────────────────────────
// GET /api/v1/attendance/admin/today  [Admin]
// All employees + their punch-in status for today
// ─────────────────────────────────────────────
exports.getAdminTodayView = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const data = await attendanceService.getAdminTodayView();
    res.status(200).json({
        success: true,
        count: data.length,
        data,
    });
});
//# sourceMappingURL=attendance.controller.js.map