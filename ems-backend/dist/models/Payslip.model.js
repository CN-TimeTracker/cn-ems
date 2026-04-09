"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// ─────────────────────────────────────────────
// SCHEMA
// ─────────────────────────────────────────────
const PayslipSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Uploader is required'],
    },
}, {
    timestamps: true,
    versionKey: false,
});
// ─────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────
// Unique payslip per user per month/year
PayslipSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });
// ─────────────────────────────────────────────
// MODEL EXPORT
// ─────────────────────────────────────────────
const Payslip = (0, mongoose_1.model)('Payslip', PayslipSchema);
exports.default = Payslip;
//# sourceMappingURL=Payslip.model.js.map