import cron from 'node-cron';
import { Attendance } from '../models';
import { AttendanceService } from './attendance.service';
import { getISTMidnight, IST_OFFSET_MS } from '../utils/dateUtils';
import { IBreakEntry } from '../interfaces';

const attendanceService = new AttendanceService();

/**
 * Scheduled tasks for the EMS system
 */
export class CronService {
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
    
    cron.schedule('5 0 * * *', async () => {
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
  private static async closePreviousDayAttendances() {
    try {
      // 1. Get Yesterday's IST Midnight
      // If today is April 10, yesterday is April 9.
      const now = new Date();
      const todayISTMidnight = getISTMidnight(now);
      const yesterdayISTMidnight = new Date(todayISTMidnight.getTime() - (24 * 60 * 60 * 1000));

      console.log(`🔍 Checking for stale open sessions before: ${todayISTMidnight.toISOString()}`);

      // 2. Find records for any day before today with no punchOutTime
      const openRecords = await Attendance.find({
        date: { $lt: todayISTMidnight },
        punchOutTime: { $exists: false }
      });

      if (openRecords.length === 0) {
        console.log('✅ No open sessions found for yesterday.');
        return;
      }

      console.log(`📝 Auto-closing ${openRecords.length} sessions...`);

      for (const record of openRecords) {
        // Close any open breaks
        const breaks = record.breaks as IBreakEntry[];
        const openBreak = breaks.find(b => !b.endTime);
        
        // Auto punch out time: 23:59:59 of that specific record's day
        const recordDate = new Date(record.date);
        const autoPunchOutTime = new Date(recordDate.getTime() + (24 * 60 * 60 * 1000) - 1000);

        if (openBreak) {
          openBreak.endTime = autoPunchOutTime;
          record.markModified('breaks');
        }

        record.punchOutTime = autoPunchOutTime;
        record.totalWorkMs = attendanceService.calculateWorkDuration(
          record.punchInTime,
          record.punchOutTime,
          breaks
        );

        await record.save();
        console.log(`   - Closed session for User ID: ${record.userId}`);
      }

      console.log('✨ Midnight Auto-Logout Job completed.');
    } catch (error) {
      console.error('❌ Error in closePreviousDayAttendances:', error);
    }
  }
}
