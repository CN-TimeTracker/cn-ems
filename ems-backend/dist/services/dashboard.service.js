"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const User_model_1 = __importDefault(require("../models/User.model"));
const Task_model_1 = __importDefault(require("../models/Task.model"));
const WorkLog_model_1 = __importDefault(require("../models/WorkLog.model"));
const Leave_model_1 = __importDefault(require("../models/Leave.model"));
const interfaces_1 = require("../interfaces");
// ─────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────
const toMidnightUTC = (date) => {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
};
const toPublic = (user) => ({
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
});
// ─────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────
class DashboardService {
    /**
     * ADMIN DASHBOARD
     * Runs 6 parallel queries and assembles the accountability snapshot.
     */
    async getAdminDashboard() {
        const today = toMidnightUTC(new Date());
        const tomorrow = new Date(today);
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
        // Fetch all active non-admin users
        const allUsers = await User_model_1.default.find({ isActive: true });
        const allUserIds = allUsers.map((u) => u._id);
        // ── 1. Who logged today ────────────────────────────────────────────────
        const loggedUserIds = await WorkLog_model_1.default.distinct('userId', {
            date: { $gte: today, $lt: tomorrow },
        });
        const loggedSet = new Set(loggedUserIds.map((id) => id.toString()));
        // ── 2. Who has approved leave today ───────────────────────────────────
        const onLeaveToday = await Leave_model_1.default.distinct('userId', {
            status: interfaces_1.LeaveStatus.Approved,
            startDate: { $lte: today },
            endDate: { $gte: today },
        });
        const leaveSet = new Set(onLeaveToday.map((id) => id.toString()));
        // ── 3. Users NOT logged and NOT on leave → truly absent ───────────────
        const usersNotLoggedToday = allUsers
            .filter((u) => {
            const id = u._id.toString();
            return !loggedSet.has(id) && !leaveSet.has(id);
        })
            .map(toPublic);
        // ── 4. Users who logged but less than 4 hours ─────────────────────────
        const hoursByUser = await WorkLog_model_1.default.aggregate([
            { $match: { date: { $gte: today, $lt: tomorrow } } },
            { $group: { _id: '$userId', totalHours: { $sum: '$hours' } } },
        ]);
        const usersUnder4Hours = [];
        for (const entry of hoursByUser) {
            if (entry.totalHours < 4) {
                const u = allUsers.find((user) => user._id.toString() === entry._id.toString());
                if (u) {
                    usersUnder4Hours.push({ user: toPublic(u), totalHours: entry.totalHours });
                }
            }
        }
        // ── 5. Total hours logged today (all users combined) ──────────────────
        const totalHoursTodayAgg = await WorkLog_model_1.default.aggregate([
            { $match: { date: { $gte: today, $lt: tomorrow } } },
            { $group: { _id: null, total: { $sum: '$hours' } } },
        ]);
        const totalHoursToday = totalHoursTodayAgg[0]?.total ?? 0;
        // ── 6. Overdue tasks (past deadline, not Done) ─────────────────────────
        const overdueTasks = await Task_model_1.default.find({
            deadline: { $lt: new Date() },
            status: { $ne: interfaces_1.TaskStatus.Done },
        })
            .populate('projectId', 'name clientName')
            .populate('assignedTo', 'name email')
            .sort({ deadline: 1 });
        // ── 7. Users with NO assigned tasks ────────────────────────────────────
        const usersWithTaskIds = await Task_model_1.default.distinct('assignedTo', {
            status: { $ne: interfaces_1.TaskStatus.Done },
        });
        const withTaskSet = new Set(usersWithTaskIds.map((id) => id.toString()));
        const usersWithNoTasks = allUsers
            .filter((u) => !withTaskSet.has(u._id.toString()))
            .map(toPublic);
        // ── 8. Per-project total hours ─────────────────────────────────────────
        const projectHoursAgg = await WorkLog_model_1.default.aggregate([
            { $group: { _id: '$projectId', totalHours: { $sum: '$hours' } } },
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
                    _id: 0,
                    project: '$project.name',
                    totalHours: 1,
                },
            },
            { $sort: { totalHours: -1 } },
        ]);
        return {
            totalUsersLogged: loggedSet.size,
            usersNotLoggedToday,
            usersUnder4Hours,
            overdueTasks: overdueTasks,
            projectHours: projectHoursAgg,
            totalHoursToday,
            usersWithNoTasks,
        };
    }
    /**
     * EMPLOYEE DASHBOARD
     * Returns today's tasks, hours logged today, pending tasks, and recent 5 logs.
     */
    async getEmployeeDashboard(userId) {
        const today = toMidnightUTC(new Date());
        const tomorrow = new Date(today);
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
        const userObjectId = mongoose_1.default.Types.ObjectId.createFromHexString(userId);
        // All 4 queries run in parallel for speed
        const [todaysTasks, todaysLogsAgg, pendingTasks, recentLogs] = await Promise.all([
            // Tasks due today or ongoing
            Task_model_1.default.find({
                assignedTo: userObjectId,
                status: { $in: [interfaces_1.TaskStatus.ToDo, interfaces_1.TaskStatus.InProgress] },
            })
                .populate('projectId', 'name clientName')
                .sort({ deadline: 1 })
                .limit(10),
            // Sum of hours logged today
            WorkLog_model_1.default.aggregate([
                {
                    $match: {
                        userId: userObjectId,
                        date: { $gte: today, $lt: tomorrow },
                    },
                },
                { $group: { _id: null, total: { $sum: '$hours' } } },
            ]),
            // All tasks not yet done
            Task_model_1.default.find({
                assignedTo: userObjectId,
                status: { $ne: interfaces_1.TaskStatus.Done },
            })
                .populate('projectId', 'name')
                .sort({ deadline: 1 }),
            // 5 most recent log entries
            WorkLog_model_1.default.find({ userId: userObjectId })
                .populate('projectId', 'name')
                .populate('taskId', 'title')
                .sort({ date: -1 })
                .limit(5),
        ]);
        return {
            todaysTasks: todaysTasks,
            todaysLoggedHours: todaysLogsAgg[0]?.total ?? 0,
            pendingTasks: pendingTasks,
            recentLogs: recentLogs,
        };
    }
}
exports.DashboardService = DashboardService;
//# sourceMappingURL=dashboard.service.js.map