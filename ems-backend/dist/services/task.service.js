"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const Task_model_1 = __importDefault(require("../models/Task.model"));
const User_model_1 = __importDefault(require("../models/User.model"));
const Project_model_1 = __importDefault(require("../models/Project.model"));
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
        // Guard: assigned user must exist and be active
        const assignee = await User_model_1.default.findById(input.assignedTo);
        if (!assignee)
            throw new Error('Assigned user not found');
        if (!assignee.isActive)
            throw new Error('Cannot assign task to an inactive user');
        const task = await Task_model_1.default.create({ ...input, createdBy });
        // Return populated so the caller has full context immediately
        return this._populate(task._id.toString());
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
        return Task_model_1.default.find(query)
            .populate('projectId', 'name clientName status')
            .populate('assignedTo', 'name email role')
            .populate('createdBy', 'name')
            .sort({ deadline: 1 });
    }
    /**
     * Returns tasks assigned to a specific user — used on the employee dashboard.
     */
    async getTasksForUser(userId) {
        return Task_model_1.default.find({ assignedTo: userId })
            .populate('projectId', 'name clientName status')
            .populate('createdBy', 'name')
            .sort({ deadline: 1 });
    }
    /**
     * Returns today's pending/in-progress tasks for a user.
     */
    async getTodaysTasksForUser(userId) {
        return Task_model_1.default.find({
            assignedTo: userId,
            status: { $in: [interfaces_1.TaskStatus.ToDo, interfaces_1.TaskStatus.InProgress] },
        })
            .populate('projectId', 'name')
            .sort({ deadline: 1 });
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
        // If reassigning, validate the new assignee exists
        if (input.assignedTo) {
            const assignee = await User_model_1.default.findById(input.assignedTo);
            if (!assignee)
                throw new Error('New assignee not found');
            if (!assignee.isActive)
                throw new Error('Cannot assign task to an inactive user');
        }
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
    /**
     * Returns all overdue tasks (past deadline, not Done).
     * Used by the accountability engine on the Admin dashboard.
     */
    async getOverdueTasks() {
        const now = new Date();
        return Task_model_1.default.find({
            deadline: { $lt: now },
            status: { $ne: interfaces_1.TaskStatus.Done },
        })
            .populate('projectId', 'name')
            .populate('assignedTo', 'name email')
            .sort({ deadline: 1 });
    }
    /**
     * Returns user IDs that have NO tasks assigned (accountability engine).
     */
    async getUsersWithNoTasks(allUserIds) {
        const usersWithTasks = await Task_model_1.default.distinct('assignedTo', {
            status: { $ne: interfaces_1.TaskStatus.Done },
        });
        const assigned = usersWithTasks.map((id) => id.toString());
        return allUserIds.filter((id) => !assigned.includes(id));
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