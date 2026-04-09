"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const interfaces_1 = require("../interfaces");
// ─────────────────────────────────────────────
// SCHEMA
// ─────────────────────────────────────────────
const ProjectSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Project name is required'],
        trim: true,
        maxlength: [150, 'Project name cannot exceed 150 characters'],
    },
    clientName: {
        type: String,
        required: [true, 'Client name is required'],
        trim: true,
        maxlength: [100, 'Client name cannot exceed 100 characters'],
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Custom Product', 'Support', 'Product'],
        default: 'Product',
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required'],
    },
    deadline: {
        type: Date,
        required: [true, 'Deadline is required'],
    },
    status: {
        type: String,
        enum: Object.values(interfaces_1.ProjectStatus),
        default: interfaces_1.ProjectStatus.Active,
    },
    allocatedHours: {
        type: Number,
        required: [true, 'Allocated hours are required'],
        default: 0,
    },
    assignedTo: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
        }],
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
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ deadline: 1 });
ProjectSchema.index({ createdBy: 1 });
// ─────────────────────────────────────────────
// MODEL EXPORT
// ─────────────────────────────────────────────
const Project = (0, mongoose_1.model)('Project', ProjectSchema);
exports.default = Project;
//# sourceMappingURL=Project.model.js.map