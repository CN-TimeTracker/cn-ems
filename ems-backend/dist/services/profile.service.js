"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileUpdateService = void 0;
const ProfileUpdateRequest_model_1 = __importDefault(require("../models/ProfileUpdateRequest.model"));
const User_model_1 = __importDefault(require("../models/User.model"));
const interfaces_1 = require("../interfaces");
class ProfileUpdateService {
    // ─────────────────────────────────────────────
    // EMPLOYEE: Request a profile update
    // ─────────────────────────────────────────────
    async requestUpdate(userId, changes) {
        // Check if the user exists
        const user = await User_model_1.default.findById(userId);
        if (!user)
            throw Object.assign(new Error('User not found'), { statusCode: 404 });
        // Upsert a pending request for this user
        // If they already have a pending request, we overwrite it with the latest changes
        const request = await ProfileUpdateRequest_model_1.default.findOneAndUpdate({ userId, status: interfaces_1.ProfileUpdateRequestStatus.Pending }, { requestedChanges: changes }, { new: true, upsert: true });
        return request;
    }
    // ─────────────────────────────────────────────
    // EMPLOYEE/ADMIN: Get current pending request for user
    // ─────────────────────────────────────────────
    async getPendingRequestForUser(userId) {
        return ProfileUpdateRequest_model_1.default.findOne({
            userId,
            status: interfaces_1.ProfileUpdateRequestStatus.Pending
        }).lean();
    }
    // ─────────────────────────────────────────────
    // ADMIN: Get all pending requests
    // ─────────────────────────────────────────────
    async getAllPendingRequests() {
        return ProfileUpdateRequest_model_1.default.find({ status: interfaces_1.ProfileUpdateRequestStatus.Pending })
            .populate('userId', 'name email employeeCode')
            .sort({ createdAt: -1 })
            .lean();
    }
    // ─────────────────────────────────────────────
    // ADMIN: Approve request
    // ─────────────────────────────────────────────
    async approveRequest(requestId, adminId) {
        const request = await ProfileUpdateRequest_model_1.default.findById(requestId);
        if (!request) {
            throw Object.assign(new Error('Request not found'), { statusCode: 404 });
        }
        if (request.status !== interfaces_1.ProfileUpdateRequestStatus.Pending) {
            throw Object.assign(new Error(`Request is already ${request.status}`), { statusCode: 400 });
        }
        const user = await User_model_1.default.findById(request.userId);
        if (!user) {
            throw Object.assign(new Error('User associated with this request not found'), { statusCode: 404 });
        }
        // Apply approved changes
        Object.assign(user, request.requestedChanges);
        await user.save();
        // Mark request as Approved
        request.status = interfaces_1.ProfileUpdateRequestStatus.Approved;
        request.reviewedBy = adminId;
        request.reviewedAt = new Date();
        await request.save();
        return request;
    }
    // ─────────────────────────────────────────────
    // ADMIN: Reject request
    // ─────────────────────────────────────────────
    async rejectRequest(requestId, adminId) {
        const request = await ProfileUpdateRequest_model_1.default.findById(requestId);
        if (!request) {
            throw Object.assign(new Error('Request not found'), { statusCode: 404 });
        }
        if (request.status !== interfaces_1.ProfileUpdateRequestStatus.Pending) {
            throw Object.assign(new Error(`Request is already ${request.status}`), { statusCode: 400 });
        }
        // Mark as Rejected
        request.status = interfaces_1.ProfileUpdateRequestStatus.Rejected;
        request.reviewedBy = adminId;
        request.reviewedAt = new Date();
        await request.save();
        return request;
    }
}
exports.ProfileUpdateService = ProfileUpdateService;
//# sourceMappingURL=profile.service.js.map