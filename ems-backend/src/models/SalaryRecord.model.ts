import { Schema, model } from 'mongoose';
import { ISalaryRecord } from '../interfaces';

const SalaryRecordSchema = new Schema<ISalaryRecord>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    month: {
      type: Number,
      required: [true, 'Month is required'],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
    lopOverride: {
      type: Number,
      default: undefined,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Unique salary record per user per month/year
SalaryRecordSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

const SalaryRecord = model<ISalaryRecord>('SalaryRecord', SalaryRecordSchema);
export default SalaryRecord;
