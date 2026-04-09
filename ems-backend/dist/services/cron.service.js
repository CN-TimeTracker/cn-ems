"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronService = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const models_1 = require("../models");
const attendance_service_1 = require("./attendance.service");
const dateUtils_1 = require("../utils/dateUtils");
const attendanceService = new attendance_service_1.AttendanceService();
/**
 * Scheduled tasks for the EMS system
 */
class CronService {
    static init() {
        console.log('📅 Cron Service Initialized');
        // Run every day at 00:05 AM IST
        // Cron schedule: minute hour day-of-month month day-of-week
        // 00:05 IST -> 18:35 UTC (previous day)
        // However, node-cron usually uses local server time. 
        // If the server is in IST, "5 0 * * *" is 00:05 IST.
        // For reliability across timezones, we can run every hour and check if we need to close yesterday's records,
        // or just assume server time / set timezone if node-cron supports it.
        // node-cron does support timezone since v3.
        node_cron_1.default.schedule('5 0 * * *', async () => {
            console.log('⏰ Running Midnight Auto-Logout Job...');
            await this.closePreviousDayAttendances();
        }, {
            timezone: "Asia/Kolkata"
        });
    }
    /**
     * Finds all attendance records for 'yesterday' that haven't been punched out
     * and closes them automatically.
     */
    static async closePreviousDayAttendances() {
        try {
            // 1. Get Yesterday's IST Midnight
            // If today is April 10, yesterday is April 9.
            const now = new Date();
            const todayISTMidnight = (0, dateUtils_1.getISTMidnight)(now);
            const yesterdayISTMidnight = new Date(todayISTMidnight.getTime() - (24 * 60 * 60 * 1000));
            console.log(`🔍 Checking for open sessions for: ${yesterdayISTMidnight.toISOString()}`);
            // 2. Find records for yesterday with no punchOutTime
            const openRecords = await models_1.Attendance.find({
                date: yesterdayISTMidnight,
                punchOutTime: { $exists: false }
            });
            if (openRecords.length === 0) {
                console.log('✅ No open sessions found for yesterday.');
                return;
            }
            console.log(`📝 Auto-closing ${openRecords.length} sessions...`);
            for (const record of openRecords) {
                // Close any open breaks
                const breaks = record.breaks;
                const openBreak = breaks.find(b => !b.endTime);
                // Auto punch out time: 23:59:59 of that day
                // Yesterday's midnight + 24h - 1s
                const autoPunchOutTime = new Date(yesterdayISTMidnight.getTime() + (24 * 60 * 60 * 1000) - 1000);
                if (openBreak) {
                    openBreak.endTime = autoPunchOutTime;
                    record.markModified('breaks');
                }
                record.punchOutTime = autoPunchOutTime;
                record.totalWorkMs = attendanceService.calculateWorkDuration(record.punchInTime, record.punchOutTime, breaks);
                await record.save();
                console.log(`   - Closed session for User ID: ${record.userId}`);
            }
            console.log('✨ Midnight Auto-Logout Job completed.');
        }
        catch (error) {
            console.error('❌ Error in closePreviousDayAttendances:', error);
        }
    }
}
exports.CronService = CronService;
//# sourceMappingURL=cron.service.js.map