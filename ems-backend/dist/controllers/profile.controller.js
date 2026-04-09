"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeRequest = exports.getReviewHistory = exports.rejectRequest = exports.approveRequest = exports.getPendingRequests = exports.getMyPendingRequest = exports.requestUpdate = exports.deleteProfilePicture = exports.updateProfilePicture = void 0;
const profile_service_1 = require("../services/profile.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const User_model_1 = __importDefault(require("../models/User.model"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_1 = __importDefault(require("../config/s3"));
const error_middleware_1 = require("../middleware/error.middleware");
const profileUpdateService = new profile_service_1.ProfileUpdateService();
// ─────────────────────────────────────────────
// PATCH /api/v1/profile/picture
// Update profile picture
// ─────────────────────────────────────────────
exports.updateProfilePicture = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    if (!req.file) {
        return next(new error_middleware_1.AppError('No image uploaded', 400));
    }
    const user = await User_model_1.default.findById(req.user.id);
    if (!user) {
        return next(new error_middleware_1.AppError('User not found', 404));
    }
    // Delete old picture from S3 if it exists
    if (user.profilePicture) {
        try {
            const oldKey = user.profilePicture.split('.com/').pop();
            if (oldKey) {
                await s3_1.default.send(new client_s3_1.DeleteObjectCommand({
                    Bucket: process.env.AWS_S3_BUCKET_NAME,
                    Key: oldKey,
                }));
            }
        }
        catch (err) {
            console.error('Error deleting old profile picture:', err);
            // Continue even if deletion fails (maybe the file was already gone)
        }
    }
    // Update with new URL (location is added by multer-s3)
    const newUrl = req.file.location;
    user.profilePicture = newUrl;
    await user.save();
    res.status(200).json({
        success: true,
        message: 'Profile picture updated successfully',
        data: { profilePicture: newUrl },
    });
});
// ─────────────────────────────────────────────
// DELETE /api/v1/profile/picture
// Delete profile picture
// ─────────────────────────────────────────────
exports.deleteProfilePicture = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const user = await User_model_1.default.findById(req.user.id);
    if (!user) {
        return next(new error_middleware_1.AppError('User not found', 404));
    }
    if (!user.profilePicture) {
        return res.status(200).json({ success: true, message: 'No profile picture to delete' });
    }
    // Delete from S3
    try {
        const key = user.profilePicture.split('.com/').pop();
        if (key) {
            await s3_1.default.send(new client_s3_1.DeleteObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: key,
            }));
        }
    }
    catch (err) {
        console.error('Error deleting profile picture from S3:', err);
    }
    user.profilePicture = undefined;
    await user.save();
    res.status(200).json({
        success: true,
        message: 'Profile picture removed successfully',
    });
});
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
// ─────────────────────────────────────────────
// GET /api/v1/profile/review-history [Admin]
// ─────────────────────────────────────────────
exports.getReviewHistory = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const history = await profileUpdateService.getReviewHistory();
    res.status(200).json({
        success: true,
        count: history.length,
        data: history,
    });
});
// ─────────────────────────────────────────────
// POST /api/v1/profile/requests/:id/revoke [Admin]
// ─────────────────────────────────────────────
exports.revokeRequest = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const request = await profileUpdateService.revokeRequest(req.params.id, req.user.id);
    res.status(200).json({
        success: true,
        message: 'Profile update approval revoked successfully.',
        data: request,
    });
});
//# sourceMappingURL=profile.controller.js.map