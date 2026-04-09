"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminProjectBreakdown = exports.getMyProjectTodayHours = exports.getProjectHoursSummary = exports.getTodayHours = exports.getAllLogs = exports.getMyLogs = exports.createLog = void 0;
const services_1 = require("../services");
const asyncHandler_1 = require("../utils/asyncHandler");
const workLogService = new services_1.WorkLogService();
// ─────────────────────────────────────────────
// POST /api/v1/logs           [Protected]
// Logs hours for the authenticated user
// ─────────────────────────────────────────────
exports.createLog = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const log = await workLogService.createLog(req.user.id, req.body);
    res.status(201).json({
        success: true,
        message: 'Work logged successfully',
        data: log,
    });
});
// ─────────────────────────────────────────────
// GET /api/v1/logs/my         [Protected]
// Employee's own logs with optional filters
// Query: projectId, startDate, endDate
// ─────────────────────────────────────────────
exports.getMyLogs = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { projectId, startDate, endDate } = req.query;
    const logs = await workLogService.getMyLogs(req.user.id, {
        projectId: projectId,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
    });
    res.status(200).json({
        success: true,
        count: logs.length,
        data: logs,
    });
});
// ─────────────────────────────────────────────
// GET /api/v1/logs            [Admin]
// All logs across all users
// Query: userId, projectId, startDate, endDate
// ─────────────────────────────────────────────
exports.getAllLogs = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId, projectId, startDate, endDate } = req.query;
    const logs = await workLogService.getAllLogs({
        userId: userId,
        projectId: projectId,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
    });
    res.status(200).json({
        success: true,
        count: logs.length,
        data: logs,
    });
});
// ─────────────────────────────────────────────
// GET /api/v1/logs/today      [Protected]
// Hours logged today for the calling user
// ─────────────────────────────────────────────
exports.getTodayHours = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const hours = await workLogService.getTodayHoursForUser(req.user.id);
    res.status(200).json({
        success: true,
        data: { hours, remaining: Math.max(0, 10 - hours) },
    });
});
// ─────────────────────────────────────────────
// GET /api/v1/logs/projects/summary  [Admin]
// Total hours per project
// ─────────────────────────────────────────────
exports.getProjectHoursSummary = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const summary = await workLogService.getProjectHoursSummary();
    res.status(200).json({
        success: true,
        data: summary,
    });
});
// ─────────────────────────────────────────────
// GET /api/v1/logs/my/project/:projectId/today [Protected]
// ─────────────────────────────────────────────
exports.getMyProjectTodayHours = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { projectId } = req.params;
    const hours = await workLogService.getProjectHoursForUserToday(req.user.id, projectId);
    res.status(200).json({
        success: true,
        data: hours,
    });
});
// ─────────────────────────────────────────────
// GET /api/v1/logs/admin/breakdown     [Admin]
// ─────────────────────────────────────────────
exports.getAdminProjectBreakdown = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const breakdown = await workLogService.getAdminProjectUserBreakdown();
    res.status(200).json({
        success: true,
        data: breakdown,
    });
});
//# sourceMappingURL=worklog.controller.js.map