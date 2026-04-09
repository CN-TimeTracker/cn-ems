import { Schema, model } from 'mongoose';
import { IAttendance } from '../interfaces';

// ─────────────────────────────────────────────
// SCHEMA
// ─────────────────────────────────────────────

const BreakEntrySchema = new Schema(
  {
    startTime: { type: Date, required: true },
    endTime:   { type: Date },
  },
  { _id: false }
);

const AttendanceSchema = new Schema<IAttendance>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },

    // Stored as midnight UTC for easy daily grouping & uniqueness check
    date: {
      type: Date,
      required: true,
      default: () => {
        const d = new Date();
        d.setUTCHours(0, 0, 0, 0);
        return d;
      },
    },

    // The actual timestamp when the employee clicked "Punch In"
    punchInTime: {
      type: Date,
      required: [true, 'Punch-in time is required'],
    },

    // Optional — filled when employee punches out
    punchOutTime: {
      type: Date,
    },

    // Break periods
    breaks: {
      type: [BreakEntrySchema],
      default: [],
    },
    totalWorkMs: {
      type: Number,
    },

    // Computed on creation: true if after grace period (10:15 AM IST)
    isLate: {
      type: Boolean,
      required: true,
      default: false,
    },

    // Required when isLate = true
    lateReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ─────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────

// One punch-in record per user per day
AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ date: -1 });

// ─────────────────────────────────────────────
// MODEL EXPORT
// ─────────────────────────────────────────────

const Attendance = model<IAttendance>('Attendance', AttendanceSchema);
export default Attendance;
