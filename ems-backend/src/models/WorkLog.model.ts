import { Schema, model } from 'mongoose';
import { IWorkLog } from '../interfaces';

// ─────────────────────────────────────────────
// SCHEMA
// ─────────────────────────────────────────────

const WorkLogSchema = new Schema<IWorkLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },

    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required'],
    },

    // Must be a task actually assigned to this user — enforced in service layer
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
    },

    hours: {
      type: Number,
      required: [true, 'Hours are required'],
      min: [0, 'Cannot log negative hours'],
      max: [10, 'Cannot log more than 10 hours per entry'],
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },

    startTime: {
      type: Date,
    },

    endTime: {
      type: Date,
    },

    // Stored as midnight UTC for easy daily grouping
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: () => {
        const d = new Date();
        d.setUTCHours(0, 0, 0, 0);
        return d;
      },
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

WorkLogSchema.index({ userId: 1, date: -1 });
WorkLogSchema.index({ projectId: 1, date: -1 });
WorkLogSchema.index({ taskId: 1 });

// The core accountability query: who logged what today?
WorkLogSchema.index({ date: 1, userId: 1 });

// ─────────────────────────────────────────────
// MODEL EXPORT
// ─────────────────────────────────────────────

const WorkLog = model<IWorkLog>('WorkLog', WorkLogSchema);
export default WorkLog;
