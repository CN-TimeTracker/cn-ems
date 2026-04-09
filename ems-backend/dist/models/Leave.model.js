"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const interfaces_1 = require("../interfaces");
// ─────────────────────────────────────────────
// SCHEMA
// ─────────────────────────────────────────────
const LeaveSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
            validator: function (value) {
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
        enum: Object.values(interfaces_1.LeaveStatus),
        default: interfaces_1.LeaveStatus.Pending,
    },
    // Populated when an Admin approves or rejects
    reviewedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    reviewedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
    versionKey: false,
});
// ─────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────
LeaveSchema.index({ userId: 1, status: 1 });
LeaveSchema.index({ startDate: 1, endDate: 1 });
// ─────────────────────────────────────────────
// MODEL EXPORT
// ─────────────────────────────────────────────
const Leave = (0, mongoose_1.model)('Leave', LeaveSchema);
exports.default = Leave;
//# sourceMappingURL=Leave.model.js.map