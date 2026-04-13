import Task from '../models/Task.model';
import User from '../models/User.model';
import Project from '../models/Project.model';
import WorkLog from '../models/WorkLog.model';
import {
  ITask,
  ICreateTaskInput,
  IUpdateTaskInput,
  ITaskFilters,
  TaskStatus,
} from '../interfaces';
import { TimeService } from './time.service';

// ─────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────

export class TaskService {
  /**
   * Creates and assigns a task.
   * Validates that the referenced project and user both exist before creating.
   */
  async createTask(input: ICreateTaskInput, createdBy: string): Promise<ITask> {
    // Guard: project must exist
    const project = await Project.findById(input.projectId);
    if (!project) throw new Error('Project not found');

    // Removed assignedTo check because it is handled by the controller using req.user.id

    const task = await Task.create({ ...input, createdBy });
    
    // Auto-start the timer upon creation for the assigned user
    // (createdBy and assignedTo are the same in this flow)
    return this.startTimer(task._id.toString(), createdBy);
  }

  /**
   * Filtered task list — supports combinations of projectId, assignedTo, status.
   */
  async getTasks(filters: ITaskFilters): Promise<ITask[]> {
    const query: Record<string, any> = {};

    if (filters.projectId) query.projectId = filters.projectId;
    if (filters.assignedTo) query.assignedTo = filters.assignedTo;
    if (filters.status)     query.status = filters.status;

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

    return Task.find(query)
      .populate('projectId', 'name clientName status')
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name')
      .sort({ date: -1 });
  }

  /**
   * Returns tasks assigned to a specific user — used on the employee dashboard.
   */
  async getTasksForUser(userId: string): Promise<ITask[]> {
    return Task.find({ assignedTo: userId })
      .populate('projectId', 'name clientName status')
      .populate('createdBy', 'name')
      .sort({ date: -1 });
  }

  /**
   * Returns today's pending/in-progress tasks for a user.
   */
  async getTodaysTasksForUser(userId: string): Promise<ITask[]> {
    return Task.find({
      assignedTo: userId,
      status: { $ne: TaskStatus.ProjectCompleted },
    })
      .populate('projectId', 'name')
      .sort({ date: -1 });
  }

  /**
   * Returns a single task with full population.
   */
  async getTaskById(id: string): Promise<ITask> {
    return this._populate(id);
  }

  /**
   * Updates task fields. Employees can only update status; Admins can update anything.
   * The role enforcement happens in the controller/middleware layer.
   */
  async updateTask(id: string, input: IUpdateTaskInput): Promise<ITask> {
    // Removed reassignment logic because tasks are tied to the creator in the new model.

    const task = await Task.findByIdAndUpdate(
      id,
      { $set: input },
      { new: true, runValidators: true }
    );
    if (!task) throw new Error('Task not found');

    return this._populate(task._id.toString());
  }

  /**
   * Deletes a task — Admin only. Controller enforces the role.
   */
  async deleteTask(id: string): Promise<void> {
    const task = await Task.findByIdAndDelete(id);
    if (!task) throw new Error('Task not found');
  }

  // Removed overdue tasks logic because tasks are now daily logs

  /**
   * Returns user IDs that have NO tasks assigned (accountability engine).
   */
  async getUsersWithNoTasks(allUserIds: string[]): Promise<string[]> {
    const usersWithTasks = await Task.distinct('assignedTo', {
      status: { $ne: TaskStatus.ProjectCompleted },
    });
    const assigned = usersWithTasks.map((id) => id.toString());
    return allUserIds.filter((id) => !assigned.includes(id));
  }

  /**
   * Starts the timer for a task.
   * Auto-pauses any other running tasks for the same user.
   */
  async startTimer(taskId: string, userId: string): Promise<ITask> {
    const task = await Task.findById(taskId);
    if (!task) throw new Error('Task not found');
    if (task.assignedTo.toString() !== userId) {
      throw new Error('You can only track time for tasks assigned to you');
    }
    if (task.isRunning) return task; // Already running

    // ── Auto-pause other running tasks for this user ─────────────────
    const runningTasks = await Task.find({ 
      assignedTo: userId, 
      isRunning: true,
      _id: { $ne: taskId }
    });

    for (const otherTask of runningTasks) {
      await this.pauseTimer(otherTask._id.toString(), userId);
    }

    // ── Start target task ─────────────────────────────────────────────
    task.isRunning = true;
    task.lastStartedAt = TimeService.now();
    task.status = TaskStatus.CurrentlyWorking;

    // Self-heal legacy tasks created before these fields were strictly required
    if (!task.date) task.date = TimeService.now();
    if (!task.time) task.time = '00:00';
    if (!task.workType) task.workType = 'General Task';

    await task.save();

    return this._populate(task._id.toString());
  }

  /**
   * Pauses the timer and accumulates elapsed minutes.
   */
  async pauseTimer(taskId: string, userId: string): Promise<ITask> {
    const task = await Task.findById(taskId);
    if (!task) throw new Error('Task not found');
    if (task.assignedTo.toString() !== userId) {
      throw new Error('Permission denied');
    }

    if (task.isRunning && task.lastStartedAt) {
      const now = TimeService.now();
      const startTime = new Date(task.lastStartedAt);
      const elapsedMs = now.getTime() - startTime.getTime();
      const elapsedMins = elapsedMs / (1000 * 60);
      
      task.totalMinutesSpent = (task.totalMinutesSpent || 0) + elapsedMins;
      task.isRunning = false;
      task.lastStartedAt = null;

      // Self-heal legacy tasks
      if (!task.date) task.date = TimeService.now();
      if (!task.time) task.time = '00:00';
      if (!task.workType) task.workType = 'General Task';

      await task.save();

      // Auto-log the session as worked hours on the project
      let hours = elapsedMins / 60;
      if (hours > 10) hours = 10; // Cap at 10 hours so we don't trip Mongoose max validation
      
      if (hours > 0) {
        const logDate = new Date(now);
        logDate.setUTCHours(0, 0, 0, 0);

        try {
          await WorkLog.create({
            userId,
            projectId: task.projectId,
            taskId: task._id,
            hours: Number(hours.toFixed(4)),
            notes: `Auto-logged from timer (${task.workType || 'Session'})`,
            startTime,
            endTime: now,
            date: logDate
          });
        } catch (e: any) {
          console.error(`[TaskService] Failed to auto-create worklog: ${e.message}`);
          // We swallow the error so that the task stop is successful regardless,
          // rather than throwing 400 Bad Request if they hit a random boundary condition.
        }
      }
    }

    return this._populate(task._id.toString());
  }

  /**
   * Pauses all running tasks for a specific user.
   * Useful for auto-pausing tasks upon logout or midnight cron.
   */
  async pauseAllRunningTasks(userId: string): Promise<void> {
    const runningTasks = await Task.find({ 
      assignedTo: userId, 
      isRunning: true
    });

    for (const task of runningTasks) {
      try {
        await this.pauseTimer(task._id.toString(), userId);
      } catch (err) {
        console.error(`[TaskService] Failed to auto-pause task ${task._id} on auto-action:`, err);
      }
    }
  }

  /**
   * Stops the timer, accumulates time, and marks task as Done.
   */
  async stopTimer(taskId: string, userId: string): Promise<ITask> {
    const task = await this.pauseTimer(taskId, userId);
    
    // We must re-fetch the raw document to save it, because pauseTimer returns a populated lean-like document
    const rawTask = await Task.findById(taskId);
    if (!rawTask) throw new Error('Task not found');
    
    rawTask.status = TaskStatus.ProjectCompleted;

    // Self-heal legacy tasks
    if (!rawTask.date) rawTask.date = TimeService.now();
    if (!rawTask.time) rawTask.time = '00:00';
    if (!rawTask.workType) rawTask.workType = 'General Task';

    await rawTask.save();
    
    return this._populate(rawTask._id.toString());
  }

  // ─── PRIVATE HELPERS ──────────────────────────────────────────────────────

  /** Centralized population to keep it DRY across all task queries */
  private async _populate(id: string): Promise<ITask> {
    const task = await Task.findById(id)
      .populate('projectId', 'name clientName status deadline')
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name');
    if (!task) throw new Error('Task not found');
    return task;
  }
}
