import { Schema, model } from 'mongoose';
import { IPayslip } from '../interfaces';

// ─────────────────────────────────────────────
// SCHEMA
// ─────────────────────────────────────────────

const PayslipSchema = new Schema<IPayslip>(
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

    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },

    filename: {
      type: String,
      required: [true, 'Filename is required'],
    },

    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader is required'],
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

// Unique payslip per user per month/year
PayslipSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

// ─────────────────────────────────────────────
// MODEL EXPORT
// ─────────────────────────────────────────────

const Payslip = model<IPayslip>('Payslip', PayslipSchema);
export default Payslip;
