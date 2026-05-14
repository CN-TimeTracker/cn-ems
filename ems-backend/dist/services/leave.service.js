"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveService = void 0;
const Leave_model_1 = __importDefault(require("../models/Leave.model"));
const Holiday_model_1 = __importDefault(require("../models/Holiday.model"));
const interfaces_1 = require("../interfaces");
const time_service_1 = require("./time.service");
// ─────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────
/**
 * Normalizes a date to YYYY-MM-DD string for comparison
 */
const toDateString = (date) => {
    return date.toISOString().split('T')[0];
};
/**
 * Parses a date safely. Handles ISO strings or standard date strings.
 */
const parseSafe = (val) => {
    const d = new Date(val);
    if (isNaN(d.getTime())) {
        throw new Error(`Invalid date provided: ${val}`);
    }
    return d;
};
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
     * Blocks public holidays and enforces 5-day advance notice for Casual leave.
     */
    async applyLeave(userId, input) {
        const start = toMidnight(parseSafe(input.startDate));
        const end = toMidnight(parseSafe(input.endDate));
        if (end < start) {
            throw new Error('End date cannot be before start date');
        }
        // 1. Public Holiday Check
        const overlappingHolidays = await Holiday_model_1.default.find({
            date: { $gte: start, $lte: end }
        });
        if (overlappingHolidays.length > 0) {
            const holidayNames = overlappingHolidays.map(h => h.name).join(', ');
            throw new Error(`Your leave request includes public holiday(s): ${holidayNames}. Please adjust your dates.`);
        }
        // 2. Advance notice check for Casual Leave (5 Days)
        // POLICY: Casual leave must be applied at least 5 days in advance.
        if (String(input.leaveType).trim() === interfaces_1.LeaveType.Casual) {
            const today = time_service_1.TimeService.now();
            const minDate = new Date(today);
            minDate.setDate(today.getDate() + 5);
            const startStr = toDateString(start);
            const minStr = toDateString(minDate);
            if (startStr < minStr) {
                throw new Error('Casual leave requires at least 5 days of advance notice');
            }
        }
        // 3. Monthly Casual Leave restriction: Max 1 day per month
        if (String(input.leaveType).trim() === interfaces_1.LeaveType.Casual) {
            const monthStart = new Date(start.getFullYear(), start.getMonth(), 1);
            const monthEnd = new Date(start.getFullYear(), start.getMonth() + 1, 0);
            const existingCasualLeaves = await Leave_model_1.default.find({
                userId,
                leaveType: interfaces_1.LeaveType.Casual,
                status: { $in: [interfaces_1.LeaveStatus.Pending, interfaces_1.LeaveStatus.Approved] },
                startDate: { $gte: monthStart, $lte: monthEnd },
            });
            let totalDays = 0;
            existingCasualLeaves.forEach(l => {
                if (l.duration === interfaces_1.LeaveDuration.HalfDay) {
                    totalDays += 0.5;
                }
                else {
                    const diff = Math.round((l.endDate.getTime() - l.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    totalDays += diff;
                }
            });
            const currentRequestDays = input.duration === interfaces_1.LeaveDuration.HalfDay
                ? 0.5
                : (Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
            if (totalDays + currentRequestDays > 1) {
                throw new Error('Total Casual Leave cannot exceed 1 day per month');
            }
        }
        // 4. Block overlapping approved/pending leave
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