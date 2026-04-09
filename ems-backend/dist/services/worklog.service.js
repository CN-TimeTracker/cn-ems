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
exports.WorkLogService = void 0;
const WorkLog_model_1 = __importDefault(require("../models/WorkLog.model"));
const Task_model_1 = __importDefault(require("../models/Task.model"));
const Leave_model_1 = __importDefault(require("../models/Leave.model"));
const interfaces_1 = require("../interfaces");
// ─────────────────────────────────────────────
// HELPER — normalize date to midnight UTC
// ─────────────────────────────────────────────
const toMidnightUTC = (date) => {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
};
// ─────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────
class WorkLogService {
    /**
     * Creates a work log entry.
     *
     * Rules enforced here:
     *   1. User can only log against tasks assigned to them.
     *   2. Total hours logged per day (across all entries) cannot exceed 10.
     *   3. Cannot log if an approved leave exists for that day.
     */
    async createLog(userId, input) {
        const logDate = toMidnightUTC(input.date ? new Date(input.date) : new Date());
        // ── Rule 1: task must be assigned to this user (if taskId is provided) ─────
        if (input.taskId) {
            const task = await Task_model_1.default.findById(input.taskId);
            if (!task)
                throw new Error('Task not found');
            if (task.assignedTo.toString() !== userId) {
                throw new Error('You can only log hours against tasks assigned to you');
            }
        }
        // ── Rule 3: no approved leave on this date ────────────────────────────
        const approvedLeave = await Leave_model_1.default.findOne({
            userId,
            status: interfaces_1.LeaveStatus.Approved,
            startDate: { $lte: logDate },
            endDate: { $gte: logDate },
        });
        if (approvedLeave) {
            throw new Error('You have an approved leave on this date — no log required');
        }
        // ── Rule 2: daily hours cap = 10 ─────────────────────────────────────
        const nextDay = new Date(logDate);
        nextDay.setUTCDate(nextDay.getUTCDate() + 1);
        const hoursAlreadyLogged = await WorkLog_model_1.default.aggregate([
            {
                $match: {
                    userId: new (await Promise.resolve().then(() => __importStar(require('mongoose')))).default.Types.ObjectId(userId),
                    date: { $gte: logDate, $lt: nextDay },
                },
            },
            { $group: { _id: null, total: { $sum: '$hours' } } },
        ]);
        const currentTotal = hoursAlreadyLogged[0]?.total ?? 0;
        if (currentTotal + input.hours > 10) {
            throw new Error(`Adding ${input.hours}h would exceed the 10-hour daily limit. You have ${10 - currentTotal}h remaining today.`);
        }
        const log = await WorkLog_model_1.default.create({
            userId,
            projectId: input.projectId,
            taskId: input.taskId,
            hours: input.hours,
            notes: input.notes,
            startTime: input.startTime,
            endTime: input.endTime,
            date: logDate,
        });
        return this._populate(log._id.toString());
    }
    /**
     * Returns logs for the calling user with optional date-range filter.
     */
    async getMyLogs(userId, filters) {
        const query = { userId };
        if (filters.projectId)
            query.projectId = filters.projectId;
        if (filters.startDate || filters.endDate) {
            query.date = {};
            if (filters.startDate)
                query.date.$gte = toMidnightUTC(filters.startDate);
            if (filters.endDate)
                query.date.$lte = toMidnightUTC(filters.endDate);
        }
        return WorkLog_model_1.default.find(query)
            .populate('projectId', 'name clientName')
            .populate('taskId', 'title status')
            .sort({ date: -1 });
    }
    /**
     * Admin: returns all logs across all users with optional filters.
     */
    async getAllLogs(filters) {
        const query = {};
        if (filters.userId)
            query.userId = filters.userId;
        if (filters.projectId)
            query.projectId = filters.projectId;
        if (filters.startDate || filters.endDate) {
            query.date = {};
            if (filters.startDate)
                query.date.$gte = toMidnightUTC(filters.startDate);
            if (filters.endDate)
                query.date.$lte = toMidnightUTC(filters.endDate);
        }
        return WorkLog_model_1.default.find(query)
            .populate('userId', 'name email role')
            .populate('projectId', 'name clientName')
            .populate('taskId', 'title status')
            .sort({ date: -1 });
    }
    /**
     * Returns total hours logged by a user on a specific date.
     * Used for dashboard stats and daily cap validation.
     */
    async getTodayHoursForUser(userId, date) {
        const logDate = toMidnightUTC(date ?? new Date());
        const nextDay = new Date(logDate);
        nextDay.setUTCDate(nextDay.getUTCDate() + 1);
        const result = await WorkLog_model_1.default.aggregate([
            {
                $match: {
                    userId: (await Promise.resolve().then(() => __importStar(require('mongoose')))).default.Types.ObjectId.createFromHexString(userId),
                    date: { $gte: logDate, $lt: nextDay },
                },
            },
            { $group: { _id: null, total: { $sum: '$hours' } } },
        ]);
        return result[0]?.total ?? 0;
    }
    /**
     * Returns every user who has logged at least one entry today.
     * Used by the accountability engine.
     */
    async getUsersWhoLoggedToday() {
        const today = toMidnightUTC(new Date());
        const nextDay = new Date(today);
        nextDay.setUTCDate(nextDay.getUTCDate() + 1);
        const logs = await WorkLog_model_1.default.distinct('userId', {
            date: { $gte: today, $lt: nextDay },
        });
        return logs.map((id) => id.toString());
    }
    /**
     * Per-project total hours — used in admin dashboard project-hours widget.
     */
    async getProjectHoursSummary() {
        const result = await WorkLog_model_1.default.aggregate([
            {
                $group: {
                    _id: '$projectId',
                    totalHours: { $sum: '$hours' },
                },
            },
            {
                $lookup: {
                    from: 'projects',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'project',
                },
            },
            { $unwind: '$project' },
            {
                $project: {
                    projectId: '$_id',
                    projectName: '$project.name',
                    totalHours: 1,
                    _id: 0,
                },
            },
            { $sort: { totalHours: -1 } },
        ]);
        return result;
    }
    /**
     * Returns total hours logged by a specific user on a specific project today.
     * Used to resume the project timer from where it left off.
     */
    async getProjectHoursForUserToday(userId, projectId) {
        const today = toMidnightUTC(new Date());
        const tomorrow = new Date(today);
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
        const result = await WorkLog_model_1.default.aggregate([
            {
                $match: {
                    userId: new (await Promise.resolve().then(() => __importStar(require('mongoose')))).default.Types.ObjectId(userId),
                    projectId: new (await Promise.resolve().then(() => __importStar(require('mongoose')))).default.Types.ObjectId(projectId),
                    date: { $gte: today, $lt: tomorrow },
                },
            },
            { $group: { _id: null, total: { $sum: '$hours' } } },
        ]);
        return result[0]?.total ?? 0;
    }
    /**
     * Admin: Detailed breakdown of project hours by user for today.
     */
    async getAdminProjectUserBreakdown() {
        const today = toMidnightUTC(new Date());
        const tomorrow = new Date(today);
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
        return WorkLog_model_1.default.aggregate([
            { $match: { date: { $gte: today, $lt: tomorrow } } },
            {
                $group: {
                    _id: { projectId: '$projectId', userId: '$userId' },
                    totalHours: { $sum: '$hours' },
                },
            },
            {
                $lookup: {
                    from: 'projects',
                    localField: '_id.projectId',
                    foreignField: '_id',
                    as: 'project',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id.userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$project' },
            { $unwind: '$user' },
            {
                $project: {
                    _id: 0,
                    projectName: '$project.name',
                    userName: '$user.name',
                    totalHours: 1,
                },
            },
            { $sort: { projectName: 1, totalHours: -1 } },
        ]);
    }
    // ─── PRIVATE HELPERS ──────────────────────────────────────────────────────
    async _populate(id) {
        const log = await WorkLog_model_1.default.findById(id)
            .populate('userId', 'name email')
            .populate('projectId', 'name clientName')
            .populate('taskId', 'title status deadline');
        if (!log)
            throw new Error('Work log not found');
        return log;
    }
}
exports.WorkLogService = WorkLogService;
//# sourceMappingURL=worklog.service.js.map