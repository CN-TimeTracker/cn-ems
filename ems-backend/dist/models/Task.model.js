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
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters'],
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
    roleTag: {
        type: String,
        enum: Object.values(interfaces_1.UserRole),
        required: [true, 'Role tag is required'],
    },
    status: {
        type: String,
        enum: Object.values(interfaces_1.TaskStatus),
        default: interfaces_1.TaskStatus.ToDo,
    },
    deadline: {
        type: Date,
        required: [true, 'Task deadline is required'],
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
TaskSchema.index({ deadline: 1 });
// Compound: quickly find all tasks for a user on a project
TaskSchema.index({ projectId: 1, assignedTo: 1 });
// ─────────────────────────────────────────────
// MODEL EXPORT
// ─────────────────────────────────────────────
const Task = (0, mongoose_1.model)('Task', TaskSchema);
exports.default = Task;
//# sourceMappingURL=Task.model.js.map