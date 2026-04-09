import Leave from '../models/Leave.model';
import WorkLog from '../models/WorkLog.model';
import {
  ILeave,
  ICreateLeaveInput,
  IReviewLeaveInput,
  LeaveStatus,
} from '../interfaces';

// ─────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────

const toMidnight = (date: Date): Date => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// ─────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────

export class LeaveService {
  /**
   * Employee applies for leave.
   * Validates no overlapping pending/approved leave exists for the same period.
   */
  async applyLeave(userId: string, input: ICreateLeaveInput): Promise<ILeave> {
    const { LeaveType, LeaveDuration, LeaveStatus } = await import('../interfaces');
    const start = toMidnight(new Date(input.startDate));
    const end   = toMidnight(new Date(input.endDate));

    if (end < start) {
      throw new Error('End date cannot be before start date');
    }

    // Monthly Casual Leave restriction: Max 1 day per month
    if (input.leaveType === LeaveType.Casual) {
      const monthStart = new Date(start.getFullYear(), start.getMonth(), 1);
      const monthEnd = new Date(start.getFullYear(), start.getMonth() + 1, 0);

      const existingCasualLeaves = await Leave.find({
        userId,
        leaveType: LeaveType.Casual,
        status: { $in: [LeaveStatus.Pending, LeaveStatus.Approved] },
        startDate: { $gte: monthStart, $lte: monthEnd },
      });

      let totalDays = 0;
      existingCasualLeaves.forEach(l => {
        if (l.duration === LeaveDuration.HalfDay) {
          totalDays += 0.5;
        } else {
          const diff = Math.round((l.endDate.getTime() - l.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          totalDays += diff;
        }
      });

      const currentRequestDays = input.duration === LeaveDuration.HalfDay 
        ? 0.5 
        : (Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

      if (totalDays + currentRequestDays > 1) {
        throw new Error('Total Casual Leave cannot exceed 1 day per month');
      }
    }

    // Block overlapping approved/pending leave
    const overlap = await Leave.findOne({
      userId,
      status: { $in: [LeaveStatus.Pending, LeaveStatus.Approved] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
      ],
    });

    if (overlap) {
      throw new Error('You already have a pending or approved leave overlapping these dates');
    }

    const leave = await Leave.create({
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
  async getLeaves(userId?: string): Promise<ILeave[]> {
    const query: Record<string, any> = {};
    if (userId) query.userId = userId;

    return Leave.find(query)
      .populate('userId', 'name email role')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });
  }

  /**
   * Returns pending leave requests — Admin dashboard uses this.
   */
  async getPendingLeaves(): Promise<ILeave[]> {
    return Leave.find({ status: LeaveStatus.Pending })
      .populate('userId', 'name email role')
      .sort({ startDate: 1 });
  }

  /**
   * Admin approves or rejects a leave request.
   * Records who reviewed it and when.
   */
  async reviewLeave(
    leaveId: string,
    adminId: string,
    input: IReviewLeaveInput
  ): Promise<ILeave> {
    const leave = await Leave.findById(leaveId);
    if (!leave) throw new Error('Leave request not found');

    if (leave.status !== LeaveStatus.Pending) {
      throw new Error('This leave has already been reviewed');
    }

    leave.status     = input.status;
    leave.reviewedBy = adminId as any;
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
  async cancelLeave(leaveId: string, userId: string): Promise<void> {
    const leave = await Leave.findById(leaveId);
    if (!leave) throw new Error('Leave request not found');

    if (leave.userId.toString() !== userId) {
      throw new Error('You can only cancel your own leave requests');
    }

    if (leave.status === LeaveStatus.Approved) {
      throw new Error('Approved leave cannot be cancelled — contact Admin');
    }

    await Leave.findByIdAndDelete(leaveId);
  }

  /**
   * Returns whether a user is on approved leave on a given date.
   * Used by the accountability engine to determine absent vs not-logged status.
   */
  async isOnLeave(userId: string, date: Date): Promise<boolean> {
    const d = toMidnight(date);
    const leave = await Leave.findOne({
      userId,
      status: LeaveStatus.Approved,
      startDate: { $lte: d },
      endDate: { $gte: d },
    });
    return !!leave;
  }
}
