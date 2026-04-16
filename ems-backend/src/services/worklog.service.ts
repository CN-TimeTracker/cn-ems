import WorkLog from '../models/WorkLog.model';
import Task from '../models/Task.model';
import Leave from '../models/Leave.model';
import Attendance from '../models/Attendance.model';
import { AttendanceService } from './attendance.service';
import {
  IWorkLog,
  ICreateWorkLogInput,
  IWorkLogFilters,
  LeaveStatus,
} from '../interfaces';

// ─────────────────────────────────────────────
// HELPER — normalize date to midnight UTC
// ─────────────────────────────────────────────

const toMidnightUTC = (date: Date): Date => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// ─────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────

export class WorkLogService {
  /**
   * Creates a work log entry.
   *
   * Rules enforced here:
   *   1. User can only log against tasks assigned to them.
   *   2. Total hours logged per day (across all entries) cannot exceed 10.
   *   3. Cannot log if an approved leave exists for that day.
   */
  async createLog(
    userId: string,
    input: ICreateWorkLogInput
  ): Promise<IWorkLog> {
    const logDate = toMidnightUTC(input.date ? new Date(input.date) : new Date());

    // ── Rule 1: task must be assigned to this user (if taskId is provided) ─────
    if (input.taskId) {
      const task = await Task.findById(input.taskId);
      if (!task) throw new Error('Task not found');
      if (task.assignedTo.toString() !== userId) {
        throw new Error('You can only log hours against tasks assigned to you');
      }
    }

    // ── Rule 3: no approved leave on this date ────────────────────────────
    const approvedLeave = await Leave.findOne({
      userId,
      status: LeaveStatus.Approved,
      startDate: { $lte: logDate },
      endDate: { $gte: logDate },
    });
    if (approvedLeave) {
      throw new Error('You have an approved leave on this date — no log required');
    }

    // ── Rule 2: daily hours cap = 10 ─────────────────────────────────────
    const nextDay = new Date(logDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const hoursAlreadyLogged = await WorkLog.aggregate([
      {
        $match: {
          userId: new (await import('mongoose')).default.Types.ObjectId(userId), 
          date: { $gte: logDate, $lt: nextDay },
        },
      },
      { $group: { _id: null, total: { $sum: '$hours' } } },
    ]);

    const currentTotal = hoursAlreadyLogged[0]?.total ?? 0;
    if (currentTotal + input.hours > 10) {
      throw new Error(
        `Adding ${input.hours}h would exceed the 10-hour daily limit. You have ${10 - currentTotal}h remaining today.`
      );
    }

    const log = await WorkLog.create({
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
  async getMyLogs(
    userId: string,
    filters: IWorkLogFilters
  ): Promise<IWorkLog[]> {
    const query: Record<string, any> = { userId };

    if (filters.projectId) query.projectId = filters.projectId;
    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = toMidnightUTC(filters.startDate);
      if (filters.endDate)   query.date.$lte = toMidnightUTC(filters.endDate);
    }

    return WorkLog.find(query)
      .populate('projectId', 'name clientName')
      .populate('taskId', 'workType description status')
      .sort({ date: -1 });
  }

  /**
   * Admin: returns all logs across all users with optional filters.
   */
  async getAllLogs(filters: IWorkLogFilters): Promise<IWorkLog[]> {
    const query: Record<string, any> = {};

    if (filters.userId)    query.userId = filters.userId;
    if (filters.projectId) query.projectId = filters.projectId;
    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = toMidnightUTC(filters.startDate);
      if (filters.endDate)   query.date.$lte = toMidnightUTC(filters.endDate);
    }

    return WorkLog.find(query)
      .populate('userId', 'name email role')
      .populate('projectId', 'name clientName')
      .populate('taskId', 'workType description status')
      .sort({ date: -1 });
  }

  /**
   * Returns total hours logged by a user on a specific date.
   * Used for dashboard stats and daily cap validation.
   */
  async getTodayHoursForUser(userId: string, date?: Date): Promise<number> {
    const logDate = toMidnightUTC(date ?? new Date());
    const attendanceRecord = await Attendance.findOne({ userId, date: logDate }).lean();

    if (!attendanceRecord) return 0;

    const attendanceService = new AttendanceService();
    // If it's assessing today dynamically
    if (!date || logDate.getTime() === toMidnightUTC(new Date()).getTime()) {
      const liveMs = attendanceService.calculateLiveWorkMs(attendanceRecord);
      return Number((liveMs / (1000 * 60 * 60)).toFixed(2));
    }

    // For retrospective dates
    return Number(((attendanceRecord.totalWorkMs || 0) / (1000 * 60 * 60)).toFixed(2));
  }

  /**
   * Returns every user who has logged at least one entry today.
   * Used by the accountability engine.
   */
  async getUsersWhoLoggedToday(): Promise<string[]> {
    const today = toMidnightUTC(new Date());
    const nextDay = new Date(today);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const logs = await WorkLog.distinct('userId', {
      date: { $gte: today, $lt: nextDay },
    });

    return logs.map((id: any) => id.toString());
  }

  /**
   * Per-project total hours — used in admin dashboard project-hours widget.
   */
  async getProjectHoursSummary(): Promise<
    { projectId: string; projectName: string; totalHours: number }[]
  > {
    const result = await WorkLog.aggregate([
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
  async getProjectHoursForUserToday(userId: string, projectId: string): Promise<number> {
    const today = toMidnightUTC(new Date());
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    const result = await WorkLog.aggregate([
      {
        $match: {
          userId: new (await import('mongoose')).default.Types.ObjectId(userId),
          projectId: new (await import('mongoose')).default.Types.ObjectId(projectId),
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
  async getAdminProjectUserBreakdown(): Promise<any[]> {
    const today = toMidnightUTC(new Date());
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    return WorkLog.aggregate([
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

  private async _populate(id: string): Promise<IWorkLog> {
    const log = await WorkLog.findById(id)
      .populate('userId', 'name email')
      .populate('projectId', 'name clientName')
      .populate('taskId', 'workType description status deadline');
    if (!log) throw new Error('Work log not found');
    return log;
  }
}
