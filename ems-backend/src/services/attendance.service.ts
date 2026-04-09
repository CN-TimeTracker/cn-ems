import { Attendance, User } from '../models';
import {
  ICreateAttendanceInput,
  IAdminAttendanceEntry,
  IUserPublic,
  IBreakEntry,
} from '../interfaces';
import { getISTMidnight, IST_OFFSET_MS } from '../utils/dateUtils';

const LATE_HOUR      = 10;                              // 10 AM
const LATE_MINUTE    = 15;                              // grace ends at :15

export class AttendanceService {

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────

  /** Returns true if punchInTime is after 10:15 AM IST */
  private computeIsLate(punchInTime: Date): boolean {
    const ist          = new Date(punchInTime.getTime() + IST_OFFSET_MS);
    const hour         = ist.getUTCHours();
    const minute       = ist.getUTCMinutes();
    return hour > LATE_HOUR || (hour === LATE_HOUR && minute > LATE_MINUTE);
  }

  /** Calculate total break milliseconds from a breaks array */
  private calcTotalBreakMs(breaks: IBreakEntry[]): number {
    let total = 0;
    for (const b of breaks) {
      const start = new Date(b.startTime).getTime();
      const end = b.endTime ? new Date(b.endTime).getTime() : Date.now();
      total += Math.max(0, end - start);
    }
    return total;
  }

  /** Calculate total work duration excluding breaks */
  public calculateWorkDuration(punchIn: Date, punchOut: Date, breaks: IBreakEntry[]): number {
    const totalMs = new Date(punchOut).getTime() - new Date(punchIn).getTime();
    const breakMs = this.calcTotalBreakMs(breaks);
    return Math.max(0, totalMs - breakMs);
  }

  // ─────────────────────────────────────────────
  // EMPLOYEE: punch in for today
  // ─────────────────────────────────────────────

  async punchIn(userId: string, input: ICreateAttendanceInput) {
    const now   = new Date();
    const today = getISTMidnight(now);
    const isLate = this.computeIsLate(now);

    // Allow creating the record without a reason initially so login can capture the exact time
    // The frontend will force the employee to fill it out separately if they are late.

    // Prevent duplicate punch-in
    const existing = await Attendance.findOne({ userId, date: today });
    if (existing) {
      throw Object.assign(new Error('You have already punched in today.'), { statusCode: 409 });
    }

    const record = await Attendance.create({
      userId,
      date:        today,
      punchInTime: now,
      isLate,
      lateReason:  isLate ? input.lateReason : undefined,
      breaks:      [],
    });

    return record;
  }

  // ─────────────────────────────────────────────
  // EMPLOYEE: update today's late reason
  // ─────────────────────────────────────────────

  async updateTodayLateReason(userId: string, reason: string) {
    if (!reason?.trim()) {
      throw new Error('A reason is required.');
    }

    const today = getISTMidnight();
    const record = await Attendance.findOne({ userId, date: today });

    if (!record) {
      throw Object.assign(new Error('No attendance record found for today.'), { statusCode: 404 });
    }

    if (!record.isLate) {
      throw Object.assign(new Error('You are not marked as late today. No reason is needed.'), { statusCode: 400 });
    }

    record.lateReason = reason;
    await record.save();

    return record;
  }

  // ─────────────────────────────────────────────
  // EMPLOYEE: punch out for today
  // ─────────────────────────────────────────────

  async punchOut(userId: string) {
    const today  = getISTMidnight();
    const record = await Attendance.findOne({ userId, date: today });

    if (!record) {
      throw Object.assign(new Error('You have not punched in today.'), { statusCode: 400 });
    }
    if (record.punchOutTime) {
      throw Object.assign(new Error('You have already punched out today.'), { statusCode: 409 });
    }

    // Auto-end any open break
    const breaks = record.breaks as IBreakEntry[];
    const lastBreak = breaks[breaks.length - 1];
    if (lastBreak && !lastBreak.endTime) {
      lastBreak.endTime = new Date();
      record.markModified('breaks');
    }

    record.punchOutTime = new Date();
    record.totalWorkMs = this.calculateWorkDuration(record.punchInTime, record.punchOutTime, breaks);
    await record.save();
    return record;
  }

  // ─────────────────────────────────────────────
  // EMPLOYEE: start a break
  // ─────────────────────────────────────────────

  async startBreak(userId: string) {
    const today  = getISTMidnight();
    const record = await Attendance.findOne({ userId, date: today });

    if (!record) {
      throw Object.assign(new Error('You have not punched in today.'), { statusCode: 400 });
    }
    if (record.punchOutTime) {
      throw Object.assign(new Error('Cannot start a break after punching out.'), { statusCode: 400 });
    }

    // Check if already on break
    const breaks = record.breaks as IBreakEntry[];
    const lastBreak = breaks[breaks.length - 1];
    if (lastBreak && !lastBreak.endTime) {
      throw Object.assign(new Error('You are already on a break.'), { statusCode: 409 });
    }

    breaks.push({ startTime: new Date() });
    record.markModified('breaks');
    await record.save();
    return record;
  }

  // ─────────────────────────────────────────────
  // EMPLOYEE: end a break
  // ─────────────────────────────────────────────

  async endBreak(userId: string) {
    const today  = getISTMidnight();
    const record = await Attendance.findOne({ userId, date: today });

    if (!record) {
      throw Object.assign(new Error('You have not punched in today.'), { statusCode: 400 });
    }

    const breaks = record.breaks as IBreakEntry[];
    const lastBreak = breaks[breaks.length - 1];
    if (!lastBreak || lastBreak.endTime) {
      throw Object.assign(new Error('You are not currently on a break.'), { statusCode: 400 });
    }

    lastBreak.endTime = new Date();
    record.markModified('breaks');
    await record.save();
    return record;
  }

  // ─────────────────────────────────────────────
  // EMPLOYEE: get today's record for calling user
  // ─────────────────────────────────────────────

  async getTodayForUser(userId: string) {
    const today = getISTMidnight();
    return Attendance.findOne({ userId, date: today }).lean();
  }

  // ─────────────────────────────────────────────
  // ADMIN: all employees with today's attendance
  // ─────────────────────────────────────────────

  async getAdminTodayView(): Promise<IAdminAttendanceEntry[]> {
    const today = getISTMidnight();

    // All active employees
    const allUsers = await User.find({ isActive: true, role: { $ne: 'Admin' } })
      .select('name email role isActive createdAt')
      .lean();

    // Today's attendance records
    const records = await Attendance.find({ date: today }).lean();
    const recordMap = new Map(records.map(r => [r.userId.toString(), r]));

    return allUsers.map((user): IAdminAttendanceEntry => {
      const record = recordMap.get(user._id.toString());
      const publicUser: IUserPublic = {
        _id:       user._id.toString(),
        name:      user.name,
        email:     user.email,
        role:      user.role,
        isActive:  user.isActive,
        createdAt: user.createdAt,
      };

      if (!record) {
        return {
          user: publicUser,
          punchInTime: null,
          punchOutTime: null,
          breaks: [],
          totalBreakMs: 0,
          isLate: false,
          hasPunchedIn: false,
          hasPunchedOut: false,
        };
      }

      const breaks = (record.breaks || []) as IBreakEntry[];

      return {
        user:          publicUser,
        punchInTime:   record.punchInTime,
        punchOutTime:  record.punchOutTime || null,
        breaks,
        totalBreakMs:  this.calcTotalBreakMs(breaks),
        isLate:        record.isLate,
        lateReason:    record.lateReason,
        hasPunchedIn:  true,
        hasPunchedOut: !!record.punchOutTime,
      };
    });
  }
}
