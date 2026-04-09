"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// ─────────────────────────────────────────────
// SCHEMA
// ─────────────────────────────────────────────
const WorkLogSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required'],
    },
    projectId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Project is required'],
    },
    // Must be a task actually assigned to this user — enforced in service layer
    taskId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
    versionKey: false,
});
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
const WorkLog = (0, mongoose_1.model)('WorkLog', WorkLogSchema);
exports.default = WorkLog;
//# sourceMappingURL=WorkLog.model.js.map