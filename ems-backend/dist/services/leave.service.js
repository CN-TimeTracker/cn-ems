"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveService = void 0;
const Leave_model_1 = __importDefault(require("../models/Leave.model"));
const interfaces_1 = require("../interfaces");
// ─────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────
const toMidnight = (date) => {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
};
// ─────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────
class LeaveService {
    /**
     * Employee applies for leave.
     * Validates no overlapping pending/approved leave exists for the same period.
     */
    async applyLeave(userId, input) {
        const start = toMidnight(new Date(input.startDate));
        const end = toMidnight(new Date(input.endDate));
        if (end < start) {
            throw new Error('End date cannot be before start date');
        }
        // Block overlapping approved/pending leave
        const overlap = await Leave_model_1.default.findOne({
            userId,
            status: { $in: [interfaces_1.LeaveStatus.Pending, interfaces_1.LeaveStatus.Approved] },
            $or: [
                { startDate: { $lte: end }, endDate: { $gte: start } },
            ],
        });
        if (overlap) {
            throw new Error('You already have a pending or approved leave overlapping these dates');
        }
        const leave = await Leave_model_1.default.create({
            userId,
            startDate: start,
            endDate: end,
            reason: input.reason,
        });
        return leave.populate('userId', 'name email role');
    }
    /**
     * Returns all leave requests — Admin sees all, employees see only theirs.
     */
    async getLeaves(userId) {
        const query = {};
        if (userId)
            query.userId = userId;
        return Leave_model_1.default.find(query)
            .populate('userId', 'name email role')
            .populate('reviewedBy', 'name')
            .sort({ createdAt: -1 });
    }
    /**
     * Returns pending leave requests — Admin dashboard uses this.
     */
    async getPendingLeaves() {
        return Leave_model_1.default.find({ status: interfaces_1.LeaveStatus.Pending })
            .populate('userId', 'name email role')
            .sort({ startDate: 1 });
    }
    /**
     * Admin approves or rejects a leave request.
     * Records who reviewed it and when.
     */
    async reviewLeave(leaveId, adminId, input) {
        const leave = await Leave_model_1.default.findById(leaveId);
        if (!leave)
            throw new Error('Leave request not found');
        if (leave.status !== interfaces_1.LeaveStatus.Pending) {
            throw new Error('This leave has already been reviewed');
        }
        leave.status = input.status;
        leave.reviewedBy = adminId;
        leave.reviewedAt = new Date();
        await leave.save();
        return leave.populate([
            { path: 'userId', select: 'name email role' },
            { path: 'reviewedBy', select: 'name' },
        ]);
    }
    /**
     * Employee can cancel a PENDING leave (cannot cancel already-approved).
     */
    async cancelLeave(leaveId, userId) {
        const leave = await Leave_model_1.default.findById(leaveId);
        if (!leave)
            throw new Error('Leave request not found');
        if (leave.userId.toString() !== userId) {
            throw new Error('You can only cancel your own leave requests');
        }
        if (leave.status === interfaces_1.LeaveStatus.Approved) {
            throw new Error('Approved leave cannot be cancelled — contact Admin');
        }
        await Leave_model_1.default.findByIdAndDelete(leaveId);
    }
    /**
     * Returns whether a user is on approved leave on a given date.
     * Used by the accountability engine to determine absent vs not-logged status.
     */
    async isOnLeave(userId, date) {
        const d = toMidnight(date);
        const leave = await Leave_model_1.default.findOne({
            userId,
            status: interfaces_1.LeaveStatus.Approved,
            startDate: { $lte: d },
            endDate: { $gte: d },
        });
        return !!leave;
    }
}
exports.LeaveService = LeaveService;
//# sourceMappingURL=leave.service.js.map