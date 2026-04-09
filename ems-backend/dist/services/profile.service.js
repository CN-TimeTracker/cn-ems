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
            .populate('userId', 'name email employeeCode profilePicture')
            .sort({ createdAt: -1 })
            .lean();
    }
    // ─────────────────────────────────────────────
    // ADMIN: Get all reviewed requests (History)
    // ─────────────────────────────────────────────
    async getReviewHistory() {
        return ProfileUpdateRequest_model_1.default.find({
            status: { $in: [interfaces_1.ProfileUpdateRequestStatus.Approved, interfaces_1.ProfileUpdateRequestStatus.Rejected, interfaces_1.ProfileUpdateRequestStatus.Revoked] }
        })
            .populate('userId', 'name email employeeCode profilePicture')
            .populate('reviewedBy', 'name')
            .sort({ reviewedAt: -1 })
            .limit(50)
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
        // Capture previous values before applying changes
        const previousValues = {};
        const changes = request.requestedChanges;
        Object.keys(changes).forEach(key => {
            if (changes[key] !== undefined) {
                previousValues[key] = user[key];
            }
        });
        // Apply approved changes
        Object.assign(user, request.requestedChanges);
        await user.save();
        // Mark request as Approved and store history
        request.status = interfaces_1.ProfileUpdateRequestStatus.Approved;
        request.previousValues = previousValues;
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
    // ─────────────────────────────────────────────
    // ADMIN: Revoke request
    // ─────────────────────────────────────────────
    async revokeRequest(requestId, adminId) {
        const request = await ProfileUpdateRequest_model_1.default.findById(requestId);
        if (!request) {
            throw Object.assign(new Error('Request not found'), { statusCode: 404 });
        }
        if (request.status !== interfaces_1.ProfileUpdateRequestStatus.Approved) {
            throw Object.assign(new Error('Only approved requests can be revoked'), { statusCode: 400 });
        }
        if (!request.previousValues) {
            throw Object.assign(new Error('No previous values found to restore'), { statusCode: 400 });
        }
        const user = await User_model_1.default.findById(request.userId);
        if (!user) {
            throw Object.assign(new Error('User not found'), { statusCode: 404 });
        }
        // Restore previous values
        Object.assign(user, request.previousValues);
        await user.save();
        // Mark as Revoked
        request.status = interfaces_1.ProfileUpdateRequestStatus.Revoked;
        request.reviewedBy = adminId;
        request.reviewedAt = new Date(); // Update review time to revocation time
        await request.save();
        return request;
    }
}
exports.ProfileUpdateService = ProfileUpdateService;
//# sourceMappingURL=profile.service.js.map