import { Response } from 'express';
import { TaskService } from '../services';
import { IAuthRequest, UserRole, TaskStatus } from '../interfaces';
import { asyncHandler } from '../utils/asyncHandler';

const taskService = new TaskService();

// ─────────────────────────────────────────────
// POST /api/v1/tasks          [Admin]
// ─────────────────────────────────────────────

export const createTask = asyncHandler(async (req: IAuthRequest, res: Response) => {
  if (req.user!.role === UserRole.Admin) {
    res.status(403).json({ success: false, message: 'Admins cannot create daily tasks. Only employees can log tasks.' });
    return;
  }

  // Auto-assign to the logged-in user and enforce current date/time
  const now = new Date();
  const taskData = {
    ...req.body,
    assignedTo: req.user!.id,
    date: now,
    time: now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
  };

  const task = await taskService.createTask(taskData, req.user!.id);

  res.status(201).json({
    success: true,
    message: 'Task logged successfully',
    data: task,
  });
});

// ─────────────────────────────────────────────
// GET /api/v1/tasks           [Protected]
// Query params: projectId, assignedTo, status
// Admin sees all; employee sees only their own
// ─────────────────────────────────────────────

export const getTasks = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { projectId, assignedTo, status, startDate, endDate } = req.query;

  const isAdmin = req.user!.role === UserRole.Admin;

  const filters = {
    projectId: projectId as string | undefined,
    // Non-admins can only see their own tasks
    assignedTo: isAdmin ? (assignedTo as string | undefined) : req.user!.id,
    status: status as TaskStatus | undefined,
    startDate: startDate as string | undefined,
    endDate: endDate as string | undefined,
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

export const getMyTasks = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const tasks = await taskService.getTasksForUser(req.user!.id);

  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks,
  });
});

// Removed Overdue Tasks endpoint
// ─────────────────────────────────────────────
// GET /api/v1/tasks/:id       [Protected]
// ─────────────────────────────────────────────

export const getTaskById = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const task = await taskService.getTaskById(req.params.id);

  // Employees can only view tasks assigned to them
  if (
    req.user!.role !== UserRole.Admin &&
    task.assignedTo._id?.toString() !== req.user!.id
  ) {
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
// Employee → can update status, workType, description
// ─────────────────────────────────────────────

export const updateTask = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const isAdmin = req.user!.role === UserRole.Admin;

  // Employees can only update task log details
  if (!isAdmin) {
    // Safe-guard: The frontend may send projectId because it's part of the form state,
    // but employees are not allowed to change it. Avoid throwing an error by removing it.
    if ('projectId' in req.body) {
      delete req.body.projectId;
    }

    const allowedKeys = ['status', 'workType', 'description'];
    const bodyKeys = Object.keys(req.body);
    const forbidden = bodyKeys.filter((k) => !allowedKeys.includes(k));

    if (forbidden.length > 0) {
      res.status(403).json({
        success: false,
        message: `Employees can only update task log details. Forbidden fields: ${forbidden.join(', ')}`,
      });
      return;
    }

    // Verify task belongs to the employee
    const existing = await taskService.getTaskById(req.params.id);
    if (existing.assignedTo._id?.toString() !== req.user!.id) {
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

export const deleteTask = asyncHandler(async (req: IAuthRequest, res: Response) => {
  await taskService.deleteTask(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
  });
});

// ─────────────────────────────────────────────
// Timer Endpoints          [Protected]
// ─────────────────────────────────────────────

export const startTimer = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const task = await taskService.startTimer(req.params.id, req.user!.id);
  res.status(200).json({ success: true, data: task });
});

export const pauseTimer = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const task = await taskService.pauseTimer(req.params.id, req.user!.id);
  res.status(200).json({ success: true, data: task });
});

export const stopTimer = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const task = await taskService.stopTimer(req.params.id, req.user!.id);
  res.status(200).json({ success: true, data: task });
});
