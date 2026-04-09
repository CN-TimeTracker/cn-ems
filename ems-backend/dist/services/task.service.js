"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const Task_model_1 = __importDefault(require("../models/Task.model"));
const Project_model_1 = __importDefault(require("../models/Project.model"));
const WorkLog_model_1 = __importDefault(require("../models/WorkLog.model"));
const interfaces_1 = require("../interfaces");
// ─────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────
class TaskService {
    /**
     * Creates and assigns a task.
     * Validates that the referenced project and user both exist before creating.
     */
    async createTask(input, createdBy) {
        // Guard: project must exist
        const project = await Project_model_1.default.findById(input.projectId);
        if (!project)
            throw new Error('Project not found');
        // Removed assignedTo check because it is handled by the controller using req.user.id
        const task = await Task_model_1.default.create({ ...input, createdBy });
        // Auto-start the timer upon creation for the assigned user
        // (createdBy and assignedTo are the same in this flow)
        return this.startTimer(task._id.toString(), createdBy);
    }
    /**
     * Filtered task list — supports combinations of projectId, assignedTo, status.
     */
    async getTasks(filters) {
        const query = {};
        if (filters.projectId)
            query.projectId = filters.projectId;
        if (filters.assignedTo)
            query.assignedTo = filters.assignedTo;
        if (filters.status)
            query.status = filters.status;
        if (filters.startDate || filters.endDate) {
            query.date = {};
            if (filters.startDate) {
                query.date.$gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                const end = new Date(filters.endDate);
                end.setHours(23, 59, 59, 999);
                query.date.$lte = end;
            }
        }
        return Task_model_1.default.find(query)
            .populate('projectId', 'name clientName status')
            .populate('assignedTo', 'name email role')
            .populate('createdBy', 'name')
            .sort({ date: -1 });
    }
    /**
     * Returns tasks assigned to a specific user — used on the employee dashboard.
     */
    async getTasksForUser(userId) {
        return Task_model_1.default.find({ assignedTo: userId })
            .populate('projectId', 'name clientName status')
            .populate('createdBy', 'name')
            .sort({ date: -1 });
    }
    /**
     * Returns today's pending/in-progress tasks for a user.
     */
    async getTodaysTasksForUser(userId) {
        return Task_model_1.default.find({
            assignedTo: userId,
            status: { $ne: interfaces_1.TaskStatus.ProjectCompleted },
        })
            .populate('projectId', 'name')
            .sort({ date: -1 });
    }
    /**
     * Returns a single task with full population.
     */
    async getTaskById(id) {
        return this._populate(id);
    }
    /**
     * Updates task fields. Employees can only update status; Admins can update anything.
     * The role enforcement happens in the controller/middleware layer.
     */
    async updateTask(id, input) {
        // Removed reassignment logic because tasks are tied to the creator in the new model.
        const task = await Task_model_1.default.findByIdAndUpdate(id, { $set: input }, { new: true, runValidators: true });
        if (!task)
            throw new Error('Task not found');
        return this._populate(task._id.toString());
    }
    /**
     * Deletes a task — Admin only. Controller enforces the role.
     */
    async deleteTask(id) {
        const task = await Task_model_1.default.findByIdAndDelete(id);
        if (!task)
            throw new Error('Task not found');
    }
    // Removed overdue tasks logic because tasks are now daily logs
    /**
     * Returns user IDs that have NO tasks assigned (accountability engine).
     */
    async getUsersWithNoTasks(allUserIds) {
        const usersWithTasks = await Task_model_1.default.distinct('assignedTo', {
            status: { $ne: interfaces_1.TaskStatus.ProjectCompleted },
        });
        const assigned = usersWithTasks.map((id) => id.toString());
        return allUserIds.filter((id) => !assigned.includes(id));
    }
    /**
     * Starts the timer for a task.
     * Auto-pauses any other running tasks for the same user.
     */
    async startTimer(taskId, userId) {
        const task = await Task_model_1.default.findById(taskId);
        if (!task)
            throw new Error('Task not found');
        if (task.assignedTo.toString() !== userId) {
            throw new Error('You can only track time for tasks assigned to you');
        }
        if (task.isRunning)
            return task; // Already running
        // ── Auto-pause other running tasks for this user ─────────────────
        const runningTasks = await Task_model_1.default.find({
            assignedTo: userId,
            isRunning: true,
            _id: { $ne: taskId }
        });
        for (const otherTask of runningTasks) {
            await this.pauseTimer(otherTask._id.toString(), userId);
        }
        // ── Start target task ─────────────────────────────────────────────
        task.isRunning = true;
        task.lastStartedAt = new Date();
        task.status = interfaces_1.TaskStatus.CurrentlyWorking;
        await task.save();
        return this._populate(task._id.toString());
    }
    /**
     * Pauses the timer and accumulates elapsed minutes.
     */
    async pauseTimer(taskId, userId) {
        const task = await Task_model_1.default.findById(taskId);
        if (!task)
            throw new Error('Task not found');
        if (task.assignedTo.toString() !== userId) {
            throw new Error('Permission denied');
        }
        if (task.isRunning && task.lastStartedAt) {
            const now = new Date();
            const startTime = new Date(task.lastStartedAt);
            const elapsedMs = now.getTime() - startTime.getTime();
            const elapsedMins = elapsedMs / (1000 * 60);
            task.totalMinutesSpent = (task.totalMinutesSpent || 0) + elapsedMins;
            task.isRunning = false;
            task.lastStartedAt = null;
            await task.save();
            // Auto-log the session as worked hours on the project
            const hours = elapsedMins / 60;
            if (hours > 0) {
                const logDate = new Date(now);
                logDate.setUTCHours(0, 0, 0, 0);
                await WorkLog_model_1.default.create({
                    userId,
                    projectId: task.projectId,
                    taskId: task._id,
                    hours: Number(hours.toFixed(4)),
                    notes: `Auto-logged from timer (${task.workType || 'Session'})`,
                    startTime,
                    endTime: now,
                    date: logDate
                });
            }
        }
        return this._populate(task._id.toString());
    }
    /**
     * Stops the timer, accumulates time, and marks task as Done.
     */
    async stopTimer(taskId, userId) {
        const task = await this.pauseTimer(taskId, userId);
        task.status = interfaces_1.TaskStatus.ProjectCompleted;
        await task.save();
        return this._populate(task._id.toString());
    }
    // ─── PRIVATE HELPERS ──────────────────────────────────────────────────────
    /** Centralized population to keep it DRY across all task queries */
    async _populate(id) {
        const task = await Task_model_1.default.findById(id)
            .populate('projectId', 'name clientName status deadline')
            .populate('assignedTo', 'name email role')
            .populate('createdBy', 'name');
        if (!task)
            throw new Error('Task not found');
        return task;
    }
}
exports.TaskService = TaskService;
//# sourceMappingURL=task.service.js.map