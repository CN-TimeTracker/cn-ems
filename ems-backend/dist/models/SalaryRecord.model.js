"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const SalaryRecordSchema = new mongoose_1.Schema({
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
    lopOverride: {
        type: Number,
        default: undefined,
    },
    isApproved: {
        type: Boolean,
        default: false,
    },
    approvedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
    versionKey: false,
});
// Unique salary record per user per month/year
SalaryRecordSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });
const SalaryRecord = (0, mongoose_1.model)('SalaryRecord', SalaryRecordSchema);
exports.default = SalaryRecord;
//# sourceMappingURL=SalaryRecord.model.js.map