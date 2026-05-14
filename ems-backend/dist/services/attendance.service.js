"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const models_1 = require("../models");
const dateUtils_1 = require("../utils/dateUtils");
const time_service_1 = require("./time.service");
const LATE_HOUR = 10; // 10 AM
const LATE_MINUTE = 15; // grace ends at :15
class AttendanceService {
    // ─────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────
    /** Returns true if punchInTime is after 10:15 AM IST */
    computeIsLate(punchInTime) {
        const ist = new Date(punchInTime.getTime() + dateUtils_1.IST_OFFSET_MS);
        const hour = ist.getUTCHours();
        const minute = ist.getUTCMinutes();
        return hour > LATE_HOUR || (hour === LATE_HOUR && minute > LATE_MINUTE);
    }
    /** Calculate total break milliseconds from a breaks array, context-aware of the date */
    calcTotalBreakMs(breaks, recordDate) {
        let total = 0;
        const now = time_service_1.TimeService.nowMs();
        // Determine if the record is for Today (IST)
        const todayIST = (0, dateUtils_1.getISTMidnight)(time_service_1.TimeService.now());
        const isToday = recordDate ? (0, dateUtils_1.getISTMidnight)(recordDate).getTime() === todayIST.getTime() : true;
        for (const b of breaks) {
            const start = new Date(b.startTime).getTime();
            let end;
            if (b.endTime) {
                end = new Date(b.endTime).getTime();
            }
            else if (isToday) {
                end = now;
            }
            else {
                // For past dates with an open break, cap at the end of that specific day (IST)
                // Midnight of recordDate + 24h - 1s
                const recordStartOfDay = (0, dateUtils_1.getISTMidnight)(recordDate);
                end = recordStartOfDay.getTime() + (24 * 60 * 60 * 1000) - 1000;
            }
            total += Math.max(0, end - start);
        }
        return total;
    }
    /** Calculate total work duration excluding breaks */
    calculateWorkDuration(punchIn, punchOut, breaks) {
        const totalMs = new Date(punchOut).getTime() - new Date(punchIn).getTime();
        const breakMs = this.calcTotalBreakMs(breaks, new Date(punchIn));
        return Math.max(0, totalMs - breakMs);
    }
    /** Dynamically calculate work duration up to the current moment if not punched out */
    calculateLiveWorkMs(record) {
        const recordDate = record.date ? new Date(record.date) : (record.punchInTime ? new Date(record.punchInTime) : undefined);
        if (!record.punchInTime)
            return 0;
        // If user has already punched out, use final tally
        if (record.punchOutTime) {
            if (record.totalWorkMs)
                return record.totalWorkMs;
            return this.calculateWorkDuration(record.punchInTime, record.punchOutTime, record.breaks || []);
        }
        // Ongoing shift: calculate difference until now
        const now = time_service_1.TimeService.nowMs();
        const totalMs = now - new Date(record.punchInTime).getTime();
        const breakMs = this.calcTotalBreakMs(record.breaks || [], recordDate);
        return Math.max(0, totalMs - breakMs);
    }
    // ─────────────────────────────────────────────
    // EMPLOYEE: punch in for today
    // ─────────────────────────────────────────────
    async punchIn(userId, input) {
        const now = time_service_1.TimeService.now();
        const today = (0, dateUtils_1.getISTMidnight)(now);
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
        const today = (0, dateUtils_1.getISTMidnight)();
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
        const today = (0, dateUtils_1.getISTMidnight)();
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
            lastBreak.endTime = time_service_1.TimeService.now();
            record.markModified('breaks');
        }
        record.punchOutTime = time_service_1.TimeService.now();
        record.totalWorkMs = this.calculateWorkDuration(record.punchInTime, record.punchOutTime, breaks);
        await record.save();
        return record;
    }
    // ─────────────────────────────────────────────
    // EMPLOYEE: start a break
    // ─────────────────────────────────────────────
    async startBreak(userId) {
        const today = (0, dateUtils_1.getISTMidnight)();
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
        breaks.push({ startTime: time_service_1.TimeService.now() });
        record.markModified('breaks');
        await record.save();
        return record;
    }
    // ─────────────────────────────────────────────
    // EMPLOYEE: end a break
    // ─────────────────────────────────────────────
    async endBreak(userId) {
        const today = (0, dateUtils_1.getISTMidnight)();
        const record = await models_1.Attendance.findOne({ userId, date: today });
        if (!record) {
            throw Object.assign(new Error('You have not punched in today.'), { statusCode: 400 });
        }
        const breaks = record.breaks;
        const lastBreak = breaks[breaks.length - 1];
        if (!lastBreak || lastBreak.endTime) {
            throw Object.assign(new Error('You are not currently on a break.'), { statusCode: 400 });
        }
        lastBreak.endTime = time_service_1.TimeService.now();
        record.markModified('breaks');
        await record.save();
        return record;
    }
    // ─────────────────────────────────────────────
    // EMPLOYEE: get today's record for calling user
    // ─────────────────────────────────────────────
    async getTodayForUser(userId) {
        const today = (0, dateUtils_1.getISTMidnight)();
        return models_1.Attendance.findOne({ userId, date: today }).lean();
    }
    // ─────────────────────────────────────────────
    // ADMIN: all employees with today's attendance
    // ─────────────────────────────────────────────
    async getAdminTodayView() {
        const today = (0, dateUtils_1.getISTMidnight)();
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
                totalBreakMs: this.calcTotalBreakMs(breaks, record.date ? new Date(record.date) : today),
                isLate: record.isLate,
                lateReason: record.lateReason,
                hasPunchedIn: true,
                hasPunchedOut: !!record.punchOutTime,
            };
        });
    }
    // ─────────────────────────────────────────────
    // ADMIN: ALL attendance history with filters
    // ─────────────────────────────────────────────
    async getAdminAllAttendanceHistory(filters) {
        const query = {};
        if (filters.userId) {
            query.userId = filters.userId;
        }
        if (filters.startDate || filters.endDate) {
            query.date = {};
            if (filters.startDate)
                query.date.$gte = new Date(filters.startDate);
            if (filters.endDate)
                query.date.$lte = new Date(filters.endDate);
        }
        // Sort by date descending
        const records = await models_1.Attendance.find(query)
            .populate('userId', 'name email role isActive createdAt')
            .sort({ date: -1 })
            .lean();
        return records.map((record) => {
            const user = record.userId;
            const publicUser = {
                _id: user?._id?.toString() || record.userId.toString(),
                name: user?.name || 'Unknown',
                email: user?.email || 'unknown@example.com',
                role: user?.role || 'Unknown',
                isActive: user?.isActive ?? false,
                createdAt: user?.createdAt || new Date(),
            };
            const breaks = (record.breaks || []);
            return {
                user: publicUser,
                punchInTime: record.punchInTime,
                punchOutTime: record.punchOutTime || null,
                breaks,
                totalBreakMs: this.calcTotalBreakMs(breaks, record.date ? new Date(record.date) : undefined),
                isLate: record.isLate,
                lateReason: record.lateReason,
                hasPunchedIn: true,
                hasPunchedOut: !!record.punchOutTime,
                date: record.date // Adding date to distinguish records
            };
        });
    }
}
exports.AttendanceService = AttendanceService;
//# sourceMappingURL=attendance.service.js.map