import mongoose from 'mongoose';
import Leave from '../src/models/Leave.model';
import { LeaveType, LeaveDuration } from '../src/interfaces';
import dotenv from 'dotenv';

dotenv.config();

async function testValidation() {
  try {
    const leave = new Leave({
      userId: new mongoose.Types.ObjectId(),
      startDate: new Date('2026-04-14'),
      endDate: new Date('2026-04-14'),
      reason: 'test',
      leaveType: LeaveType.Casual,
      duration: LeaveDuration.FullDay
    });

    const error = leave.validateSync();
    if (error) {
      console.log('❌ Validation Failed:', error.message);
    } else {
      console.log('✅ Validation Passed');
    }
  } catch (err) {
    console.error('💥 Error:', err);
  } finally {
    process.exit();
  }
}

testValidation();
