"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// ─────────────────────────────────────────────
// SCHEMA
// ─────────────────────────────────────────────
const BreakEntrySchema = new mongoose_1.Schema({
    startTime: { type: Date, required: true },
    endTime: { type: Date },
}, { _id: false });
const AttendanceSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
    versionKey: false,
});
// ─────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────
// One punch-in record per user per day
AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ date: -1 });
// ─────────────────────────────────────────────
// MODEL EXPORT
// ─────────────────────────────────────────────
const Attendance = (0, mongoose_1.model)('Attendance', AttendanceSchema);
exports.default = Attendance;
//# sourceMappingURL=Attendance.model.js.map