"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectRequest = exports.approveRequest = exports.getPendingRequests = exports.getMyPendingRequest = exports.requestUpdate = void 0;
const profile_service_1 = require("../services/profile.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const profileUpdateService = new profile_service_1.ProfileUpdateService();
// ─────────────────────────────────────────────
// POST /api/v1/profile/request-update
// Employee requests profile update
// ─────────────────────────────────────────────
exports.requestUpdate = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const request = await profileUpdateService.requestUpdate(req.user.id, req.body);
    res.status(200).json({
        success: true,
        message: 'Profile update requested successfully. Pending admin approval.',
        data: request,
    });
});
// ─────────────────────────────────────────────
// GET /api/v1/profile/my-pending
// Check if user has an active pending request
// ─────────────────────────────────────────────
exports.getMyPendingRequest = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const request = await profileUpdateService.getPendingRequestForUser(req.user.id);
    res.status(200).json({
        success: true,
        data: request ?? null,
    });
});
// ─────────────────────────────────────────────
// GET /api/v1/profile/requests
// Admin list all pending requests
// ─────────────────────────────────────────────
exports.getPendingRequests = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const requests = await profileUpdateService.getAllPendingRequests();
    res.status(200).json({
        success: true,
        count: requests.length,
        data: requests,
    });
});
// ─────────────────────────────────────────────
// POST /api/v1/profile/requests/:id/approve
// Admin approves request
// ─────────────────────────────────────────────
exports.approveRequest = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const request = await profileUpdateService.approveRequest(req.params.id, req.user.id);
    res.status(200).json({
        success: true,
        message: 'Profile update request approved.',
        data: request,
    });
});
// ─────────────────────────────────────────────
// POST /api/v1/profile/requests/:id/reject
// Admin rejects request
// ─────────────────────────────────────────────
exports.rejectRequest = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const request = await profileUpdateService.rejectRequest(req.params.id, req.user.id);
    res.status(200).json({
        success: true,
        message: 'Profile update request rejected.',
        data: request,
    });
});
//# sourceMappingURL=profile.controller.js.map