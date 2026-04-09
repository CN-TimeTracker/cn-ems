"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelLeave = exports.reviewLeave = exports.getPendingLeaves = exports.getLeaves = exports.applyLeave = void 0;
const services_1 = require("../services");
const interfaces_1 = require("../interfaces");
const asyncHandler_1 = require("../utils/asyncHandler");
const leaveService = new services_1.LeaveService();
// ─────────────────────────────────────────────
// POST /api/v1/leaves         [Protected]
// Employee applies for leave
// ─────────────────────────────────────────────
exports.applyLeave = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const leave = await leaveService.applyLeave(req.user.id, req.body);
    res.status(201).json({
        success: true,
        message: 'Leave application submitted',
        data: leave,
    });
});
// ─────────────────────────────────────────────
// GET /api/v1/leaves          [Protected]
// Admin → all leaves
// Employee → only their own
// ─────────────────────────────────────────────
exports.getLeaves = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const isAdmin = req.user.role === interfaces_1.UserRole.Admin;
    // Admins can optionally filter by userId via query param
    const filterUserId = isAdmin
        ? req.query.userId
        : req.user.id;
    const leaves = await leaveService.getLeaves(filterUserId);
    res.status(200).json({
        success: true,
        count: leaves.length,
        data: leaves,
    });
});
// ─────────────────────────────────────────────
// GET /api/v1/leaves/pending  [Admin]
// All pending leave requests — for admin approval queue
// ─────────────────────────────────────────────
exports.getPendingLeaves = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const leaves = await leaveService.getPendingLeaves();
    res.status(200).json({
        success: true,
        count: leaves.length,
        data: leaves,
    });
});
// ─────────────────────────────────────────────
// PATCH /api/v1/leaves/:id/review  [Admin]
// Approve or reject a leave request
// ─────────────────────────────────────────────
exports.reviewLeave = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const leave = await leaveService.reviewLeave(req.params.id, req.user.id, req.body);
    res.status(200).json({
        success: true,
        message: `Leave ${req.body.status.toLowerCase()} successfully`,
        data: leave,
    });
});
// ─────────────────────────────────────────────
// DELETE /api/v1/leaves/:id   [Protected]
// Employee cancels their own pending leave
// ─────────────────────────────────────────────
exports.cancelLeave = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await leaveService.cancelLeave(req.params.id, req.user.id);
    res.status(200).json({
        success: true,
        message: 'Leave request cancelled',
    });
});
//# sourceMappingURL=leave.controller.js.map