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
const Attendance_model_1 = __importDefault(require("../models/Attendance.model"));
const Project_model_1 = __importDefault(require("../models/Project.model"));
const interfaces_1 = require("../interfaces");
const dateUtils_1 = require("../utils/dateUtils");
// ─────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────
const toPublic = (user) => ({
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    employeeCode: user.employeeCode,
    username: user.username,
    phoneNumber: user.phoneNumber,
    dateOfJoining: user.dateOfJoining,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    fatherName: user.fatherName,
    currentAddress: user.currentAddress,
    permanentAddress: user.permanentAddress,
    description: user.description,
    salary: user.salary,
    bankName: user.bankName,
    accountNo: user.accountNo,
    branchName: user.branchName,
    ifscCode: user.ifscCode,
    aadharNo: user.aadharNo,
    panNo: user.panNo,
    createdAt: user.createdAt,
    profilePicture: user.profilePicture,
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
        const today = (0, dateUtils_1.getISTMidnight)();
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        // Fetch all active non-admin users
        const allUsers = await User_model_1.default.find({ isActive: true });
        const allUserIds = allUsers.map((u) => u._id);
        // ── 1. Who punched in today ──────────────────────────────────────────
        const todayRecords = await Attendance_model_1.default.find({ date: today }).lean();
        const loggedSet = new Set(todayRecords.map(r => r.userId.toString()));
        // ── 2. Who has approved leave today ───────────────────────────────────
        const onLeaveToday = await Leave_model_1.default.distinct('userId', {
            status: interfaces_1.LeaveStatus.Approved,
            startDate: { $lte: today },
            endDate: { $gte: today },
        });
        const leaveSet = new Set(onLeaveToday.map((id) => id.toString()));
        // ── 3. Users NOT punched in and NOT on leave → absent ───────────
        const usersNotLoggedToday = allUsers
            .filter((u) => {
            const id = u._id.toString();
            // Admins aren't expected to punch in for this stat
            if (u.role === interfaces_1.UserRole.Admin)
                return false;
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
        // ── 7. Users with NO assigned tasks ────────────────────────────────────
        const usersWithTaskIds = await Task_model_1.default.distinct('assignedTo', {
            status: { $ne: interfaces_1.TaskStatus.ProjectCompleted },
        });
        const withTaskSet = new Set(usersWithTaskIds.map((id) => id.toString()));
        const usersWithNoTasks = allUsers
            .filter((u) => !withTaskSet.has(u._id.toString()))
            .map(toPublic);
        // ── 8. Per-project total hours (Today Only) ───────────────────────────
        const projectHoursAgg = await WorkLog_model_1.default.aggregate([
            { $match: { date: { $gte: today, $lt: tomorrow } } },
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
        const today = (0, dateUtils_1.getISTMidnight)();
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        const userObjectId = mongoose_1.default.Types.ObjectId.createFromHexString(userId);
        const [todaysTasks, todaysLogsAgg, pendingTasks, recentLogs, todayAttendance, totalProjects, totalLeaves, projectWorkLogs] = await Promise.all([
            Task_model_1.default.find({
                assignedTo: userObjectId,
                status: { $ne: interfaces_1.TaskStatus.ProjectCompleted },
            }).populate('projectId', 'name clientName').sort({ deadline: 1 }).limit(10),
            WorkLog_model_1.default.aggregate([
                { $match: { userId: userObjectId, date: { $gte: today, $lt: tomorrow } } },
                { $group: { _id: null, total: { $sum: '$hours' } } },
            ]),
            Task_model_1.default.find({ assignedTo: userObjectId, status: { $ne: interfaces_1.TaskStatus.ProjectCompleted } })
                .populate('projectId', 'name').sort({ deadline: 1 }),
            WorkLog_model_1.default.find({ userId: userObjectId })
                .populate('projectId', 'name').populate('taskId', 'title')
                .sort({ date: -1 }).limit(5),
            Attendance_model_1.default.findOne({ userId: userObjectId, date: today }).lean(),
            Project_model_1.default.countDocuments({ assignedTo: userObjectId, status: interfaces_1.ProjectStatus.Active }),
            Leave_model_1.default.countDocuments({ userId: userObjectId, status: interfaces_1.LeaveStatus.Approved }),
            // Detailed project breakdown logic
            WorkLog_model_1.default.aggregate([
                { $match: { userId: userObjectId } },
                { $group: { _id: '$projectId', workedHours: { $sum: '$hours' } } },
                { $lookup: { from: 'projects', localField: '_id', foreignField: '_id', as: 'p' } },
                { $unwind: '$p' }
            ])
        ]);
        const projectBreakdown = projectWorkLogs.map((pw) => ({
            projectId: pw._id.toString(),
            name: pw.p.name,
            clientName: pw.p.clientName,
            category: pw.p.category || 'Product',
            allocatedHours: pw.p.allocatedHours || 0,
            workedHours: pw.workedHours,
            deadline: pw.p.deadline
        }));
        return {
            todaysTasks: todaysTasks,
            todaysLoggedHours: todaysLogsAgg[0]?.total ?? 0,
            pendingTasks: pendingTasks,
            recentLogs: recentLogs,
            todayAttendance: todayAttendance,
            totalProjects,
            totalLeaves,
            projectBreakdown
        };
    }
    /**
     * CELEBRATIONS
     * Returns users having birthday or work anniversary today.
     */
    async getCelebrations() {
        const now = new Date();
        // Shift to IST to get the correct current Month and Day
        const nowIST = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
        const m = nowIST.getUTCMonth() + 1;
        const d = nowIST.getUTCDate();
        const users = await User_model_1.default.find({
            isActive: true,
            $or: [
                {
                    $expr: {
                        $and: [
                            { $eq: [{ $month: '$dateOfBirth' }, m] },
                            { $eq: [{ $dayOfMonth: '$dateOfBirth' }, d] }
                        ]
                    }
                },
                {
                    $expr: {
                        $and: [
                            { $eq: [{ $month: '$dateOfJoining' }, m] },
                            { $eq: [{ $dayOfMonth: '$dateOfJoining' }, d] }
                        ]
                    }
                }
            ]
        }).select('name profilePicture dateOfBirth dateOfJoining employeeCode role').lean();
        return users.map(u => {
            // Determine celebration type
            let type = 'Birthday';
            if (u.dateOfJoining) {
                const joinDate = new Date(u.dateOfJoining);
                if (joinDate.getUTCMonth() + 1 === m && joinDate.getUTCDate() === d) {
                    type = 'Anniversary';
                }
            }
            if (u.dateOfBirth) {
                const birthDate = new Date(u.dateOfBirth);
                if (birthDate.getUTCMonth() + 1 === m && birthDate.getUTCDate() === d) {
                    type = 'Birthday';
                }
            }
            return {
                _id: u._id.toString(),
                name: u.name,
                profilePicture: u.profilePicture,
                employeeCode: u.employeeCode,
                role: u.role,
                type
            };
        });
    }
}
exports.DashboardService = DashboardService;
//# sourceMappingURL=dashboard.service.js.map