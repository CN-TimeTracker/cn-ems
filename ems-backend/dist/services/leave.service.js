"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
        const { LeaveType, LeaveDuration, LeaveStatus } = await Promise.resolve().then(() => __importStar(require('../interfaces')));
        const start = toMidnight(new Date(input.startDate));
        const end = toMidnight(new Date(input.endDate));
        if (end < start) {
            throw new Error('End date cannot be before start date');
        }
        // Monthly Casual Leave restriction: Max 1 day per month
        if (input.leaveType === LeaveType.Casual) {
            const monthStart = new Date(start.getFullYear(), start.getMonth(), 1);
            const monthEnd = new Date(start.getFullYear(), start.getMonth() + 1, 0);
            const existingCasualLeaves = await Leave_model_1.default.find({
                userId,
                leaveType: LeaveType.Casual,
                status: { $in: [LeaveStatus.Pending, LeaveStatus.Approved] },
                startDate: { $gte: monthStart, $lte: monthEnd },
            });
            let totalDays = 0;
            existingCasualLeaves.forEach(l => {
                if (l.duration === LeaveDuration.HalfDay) {
                    totalDays += 0.5;
                }
                else {
                    const diff = Math.round((l.endDate.getTime() - l.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    totalDays += diff;
                }
            });
            const currentRequestDays = input.duration === LeaveDuration.HalfDay
                ? 0.5
                : (Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
            if (totalDays + currentRequestDays > 1) {
                throw new Error('Total Casual Leave cannot exceed 1 day per month');
            }
        }
        // Block overlapping approved/pending leave
        const overlap = await Leave_model_1.default.findOne({
            userId,
            status: { $in: [LeaveStatus.Pending, LeaveStatus.Approved] },
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
            leaveType: input.leaveType,
            duration: input.duration,
            halfDayType: input.halfDayType,
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