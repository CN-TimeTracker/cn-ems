"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.getTaskById = exports.getOverdueTasks = exports.getMyTasks = exports.getTasks = exports.createTask = void 0;
const services_1 = require("../services");
const interfaces_1 = require("../interfaces");
const asyncHandler_1 = require("../utils/asyncHandler");
const taskService = new services_1.TaskService();
// ─────────────────────────────────────────────
// POST /api/v1/tasks          [Admin]
// ─────────────────────────────────────────────
exports.createTask = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const task = await taskService.createTask(req.body, req.user.id);
    res.status(201).json({
        success: true,
        message: 'Task created and assigned successfully',
        data: task,
    });
});
// ─────────────────────────────────────────────
// GET /api/v1/tasks           [Protected]
// Query params: projectId, assignedTo, status
// Admin sees all; employee sees only their own
// ─────────────────────────────────────────────
exports.getTasks = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { projectId, assignedTo, status } = req.query;
    const isAdmin = req.user.role === interfaces_1.UserRole.Admin;
    const filters = {
        projectId: projectId,
        // Non-admins can only see their own tasks
        assignedTo: isAdmin ? assignedTo : req.user.id,
        status: status,
    };
    const tasks = await taskService.getTasks(filters);
    res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks,
    });
});
// ─────────────────────────────────────────────
// GET /api/v1/tasks/my        [Protected]
// Employee's own tasks — used on dashboard
// ─────────────────────────────────────────────
exports.getMyTasks = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const tasks = await taskService.getTasksForUser(req.user.id);
    res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks,
    });
});
// ─────────────────────────────────────────────
// GET /api/v1/tasks/overdue   [Admin]
// ─────────────────────────────────────────────
exports.getOverdueTasks = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const tasks = await taskService.getOverdueTasks();
    res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks,
    });
});
// ─────────────────────────────────────────────
// GET /api/v1/tasks/:id       [Protected]
// ─────────────────────────────────────────────
exports.getTaskById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const task = await taskService.getTaskById(req.params.id);
    // Employees can only view tasks assigned to them
    if (req.user.role !== interfaces_1.UserRole.Admin &&
        task.assignedTo._id?.toString() !== req.user.id) {
        res.status(403).json({ success: false, message: 'Access denied' });
        return;
    }
    res.status(200).json({
        success: true,
        data: task,
    });
});
// ─────────────────────────────────────────────
// PATCH /api/v1/tasks/:id     [Protected]
// Admin → can update all fields
// Employee → can only update status
// ─────────────────────────────────────────────
exports.updateTask = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const isAdmin = req.user.role === interfaces_1.UserRole.Admin;
    // Employees can only update status
    if (!isAdmin) {
        const allowedKeys = ['status'];
        const bodyKeys = Object.keys(req.body);
        const forbidden = bodyKeys.filter((k) => !allowedKeys.includes(k));
        if (forbidden.length > 0) {
            res.status(403).json({
                success: false,
                message: `Employees can only update task status. Forbidden fields: ${forbidden.join(', ')}`,
            });
            return;
        }
        // Verify task belongs to the employee
        const existing = await taskService.getTaskById(req.params.id);
        if (existing.assignedTo._id?.toString() !== req.user.id) {
            res.status(403).json({ success: false, message: 'You can only update your own tasks' });
            return;
        }
    }
    const task = await taskService.updateTask(req.params.id, req.body);
    res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: task,
    });
});
// ─────────────────────────────────────────────
// DELETE /api/v1/tasks/:id    [Admin]
// ─────────────────────────────────────────────
exports.deleteTask = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await taskService.deleteTask(req.params.id);
    res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
    });
});
//# sourceMappingURL=task.controller.js.map