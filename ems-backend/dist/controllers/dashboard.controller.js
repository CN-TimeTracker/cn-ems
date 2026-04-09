"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCelebrations = exports.getEmployeeDashboard = exports.getAdminDashboard = void 0;
const services_1 = require("../services");
const asyncHandler_1 = require("../utils/asyncHandler");
const dashboardService = new services_1.DashboardService();
// ─────────────────────────────────────────────
// GET /api/v1/dashboard/admin     [Admin]
// Full accountability snapshot
// ─────────────────────────────────────────────
exports.getAdminDashboard = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const data = await dashboardService.getAdminDashboard();
    res.status(200).json({
        success: true,
        data,
    });
});
// ─────────────────────────────────────────────
// GET /api/v1/dashboard/employee  [Protected]
// Personal dashboard for the calling employee
// ─────────────────────────────────────────────
exports.getEmployeeDashboard = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await dashboardService.getEmployeeDashboard(req.user.id);
    res.status(200).json({
        success: true,
        data,
    });
});
// ─────────────────────────────────────────────
// GET /api/v1/dashboard/celebrations  [Protected]
// Today's birthdays and work anniversaries
// ─────────────────────────────────────────────
exports.getCelebrations = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const data = await dashboardService.getCelebrations();
    res.status(200).json({
        success: true,
        count: data.length,
        data,
    });
});
//# sourceMappingURL=dashboard.controller.js.map