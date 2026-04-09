import { Schema, model } from 'mongoose';
import { ILeave, LeaveStatus, LeaveType, LeaveDuration, HalfDayType } from '../interfaces';

// ─────────────────────────────────────────────
// SCHEMA
// ─────────────────────────────────────────────

const LeaveSchema = new Schema<ILeave>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },

    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },

    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (this: ILeave, value: Date) {
          return value >= this.startDate;
        },
        message: 'End date must be on or after the start date',
      },
    },

    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },

    status: {
      type: String,
      enum: Object.values(LeaveStatus),
      default: LeaveStatus.Pending,
    },

    leaveType: {
      type: String,
      enum: Object.values(LeaveType),
      required: [true, 'Leave type is required'],
    } as any,

    duration: {
      type: String,
      enum: Object.values(LeaveDuration),
      default: LeaveDuration.FullDay,
    } as any,

    halfDayType: {
      type: String,
      enum: Object.values(HalfDayType),
      required: function(this: any) {
        return this.duration === LeaveDuration.HalfDay;
      },
    } as any,

    // Populated when an Admin approves or rejects
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
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

LeaveSchema.index({ userId: 1, status: 1 });
LeaveSchema.index({ startDate: 1, endDate: 1 });

// ─────────────────────────────────────────────
// MODEL EXPORT
// ─────────────────────────────────────────────

const Leave = model<ILeave>('Leave', LeaveSchema);
export default Leave;
