"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const interfaces_1 = require("../interfaces");
// ─────────────────────────────────────────────
// SCHEMA
// ─────────────────────────────────────────────
const TaskSchema = new mongoose_1.Schema({
    projectId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Project is required'],
    },
    workType: {
        type: String,
        required: [true, 'Work type is required'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    // ONE owner per task — enforced here and in the service layer
    assignedTo: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Task must be assigned to a user'],
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
    },
    time: {
        type: String,
        required: [true, 'Time is required'],
    },
    status: {
        type: String,
        enum: Object.values(interfaces_1.TaskStatus),
        default: interfaces_1.TaskStatus.CurrentlyWorking,
    },
    totalMinutesSpent: {
        type: Number,
        default: 0,
    },
    isRunning: {
        type: Boolean,
        default: false,
    },
    lastStartedAt: {
        type: Date,
        default: null,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
// ─────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────
TaskSchema.index({ projectId: 1 });
TaskSchema.index({ assignedTo: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ date: -1 });
// Compound: quickly find all tasks for a user on a project
TaskSchema.index({ projectId: 1, assignedTo: 1 });
// ─────────────────────────────────────────────
// MODEL EXPORT
// ─────────────────────────────────────────────
const Task = (0, mongoose_1.model)('Task', TaskSchema);
exports.default = Task;
//# sourceMappingURL=Task.model.js.map