"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const models_1 = require("../models");
// ─────────────────────────────────────────────
// CONSTANTS
// Office: 10:00 AM – 7:00 PM IST
// Grace : 15 minutes → late after 10:15 AM IST
// IST   : UTC + 5h 30m = UTC + 330 minutes
// ─────────────────────────────────────────────
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // 330 min in ms
const LATE_HOUR = 10; // 10 AM
const LATE_MINUTE = 15; // grace ends at :15
class AttendanceService {
    // ─────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────
    /** Returns midnight UTC for the current IST day */
    todayMidnightUTC() {
        const nowIST = new Date(Date.now() + IST_OFFSET_MS);
        const midnight = new Date(nowIST);
        midnight.setUTCHours(0, 0, 0, 0);
        // Convert back to real UTC midnight for the IST day
        return new Date(midnight.getTime() - IST_OFFSET_MS);
    }
    /** Returns true if punchInTime is after 10:15 AM IST */
    computeIsLate(punchInTime) {
        const ist = new Date(punchInTime.getTime() + IST_OFFSET_MS);
        const hour = ist.getUTCHours();
        const minute = ist.getUTCMinutes();
        return hour > LATE_HOUR || (hour === LATE_HOUR && minute > LATE_MINUTE);
    }
    /** Calculate total break milliseconds from a breaks array */
    calcTotalBreakMs(breaks) {
        let total = 0;
        for (const b of breaks) {
            const end = b.endTime ? new Date(b.endTime).getTime() : Date.now();
            total += end - new Date(b.startTime).getTime();
        }
        return total;
    }
    // ─────────────────────────────────────────────
    // EMPLOYEE: punch in for today
    // ─────────────────────────────────────────────
    async punchIn(userId, input) {
        const now = new Date();
        const today = this.todayMidnightUTC();
        const isLate = this.computeIsLate(now);
        // Allow creating the record without a reason initially so login can capture the exact time
        // The frontend will force the employee to fill it out separately if they are late.
        // Prevent duplicate punch-in
        const existing = await models_1.Attendance.findOne({ userId, date: today });
        if (existing) {
            throw Object.assign(new Error('You have already punched in today.'), { statusCode: 409 });
        }
        const record = await models_1.Attendance.create({
            userId,
            date: today,
            punchInTime: now,
            isLate,
            lateReason: isLate ? input.lateReason : undefined,
            breaks: [],
        });
        return record;
    }
    // ─────────────────────────────────────────────
    // EMPLOYEE: update today's late reason
    // ─────────────────────────────────────────────
    async updateTodayLateReason(userId, reason) {
        if (!reason?.trim()) {
            throw new Error('A reason is required.');
        }
        const today = this.todayMidnightUTC();
        const record = await models_1.Attendance.findOne({ userId, date: today });
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
    async punchOut(userId) {
        const today = this.todayMidnightUTC();
        const record = await models_1.Attendance.findOne({ userId, date: today });
        if (!record) {
            throw Object.assign(new Error('You have not punched in today.'), { statusCode: 400 });
        }
        if (record.punchOutTime) {
            throw Object.assign(new Error('You have already punched out today.'), { statusCode: 409 });
        }
        // Auto-end any open break
        const breaks = record.breaks;
        const lastBreak = breaks[breaks.length - 1];
        if (lastBreak && !lastBreak.endTime) {
            lastBreak.endTime = new Date();
            record.markModified('breaks');
        }
        record.punchOutTime = new Date();
        await record.save();
        return record;
    }
    // ─────────────────────────────────────────────
    // EMPLOYEE: start a break
    // ─────────────────────────────────────────────
    async startBreak(userId) {
        const today = this.todayMidnightUTC();
        const record = await models_1.Attendance.findOne({ userId, date: today });
        if (!record) {
            throw Object.assign(new Error('You have not punched in today.'), { statusCode: 400 });
        }
        if (record.punchOutTime) {
            throw Object.assign(new Error('Cannot start a break after punching out.'), { statusCode: 400 });
        }
        // Check if already on break
        const breaks = record.breaks;
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
    async endBreak(userId) {
        const today = this.todayMidnightUTC();
        const record = await models_1.Attendance.findOne({ userId, date: today });
        if (!record) {
            throw Object.assign(new Error('You have not punched in today.'), { statusCode: 400 });
        }
        const breaks = record.breaks;
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
    async getTodayForUser(userId) {
        const today = this.todayMidnightUTC();
        return models_1.Attendance.findOne({ userId, date: today }).lean();
    }
    // ─────────────────────────────────────────────
    // ADMIN: all employees with today's attendance
    // ─────────────────────────────────────────────
    async getAdminTodayView() {
        const today = this.todayMidnightUTC();
        // All active employees
        const allUsers = await models_1.User.find({ isActive: true, role: { $ne: 'Admin' } })
            .select('name email role isActive createdAt')
            .lean();
        // Today's attendance records
        const records = await models_1.Attendance.find({ date: today }).lean();
        const recordMap = new Map(records.map(r => [r.userId.toString(), r]));
        return allUsers.map((user) => {
            const record = recordMap.get(user._id.toString());
            const publicUser = {
                _id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
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
            const breaks = (record.breaks || []);
            return {
                user: publicUser,
                punchInTime: record.punchInTime,
                punchOutTime: record.punchOutTime || null,
                breaks,
                totalBreakMs: this.calcTotalBreakMs(breaks),
                isLate: record.isLate,
                lateReason: record.lateReason,
                hasPunchedIn: true,
                hasPunchedOut: !!record.punchOutTime,
            };
        });
    }
}
exports.AttendanceService = AttendanceService;
//# sourceMappingURL=attendance.service.js.map