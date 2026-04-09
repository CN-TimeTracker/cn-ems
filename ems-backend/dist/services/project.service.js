"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const Project_model_1 = __importDefault(require("../models/Project.model"));
const interfaces_1 = require("../interfaces");
// ─────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────
class ProjectService {
    /**
     * Helper to add business days (skipping weekends)
     */
    addBusinessDays(startDate, days) {
        const date = new Date(startDate);
        let added = 0;
        while (added < days) {
            date.setDate(date.getDate() + 1);
            if (date.getDay() !== 0 && date.getDay() !== 6) {
                added++;
            }
        }
        return date;
    }
    /**
     * Creates a new project. createdBy is injected from the JWT payload in the controller.
     */
    async createProject(input, createdBy) {
        const { startDate, allocatedHours } = input;
        // Auto-calculate deadline if not provided or force calculate according to 8h/day rule
        const daysRequired = Math.ceil((allocatedHours || 0) / 8);
        const calculatedDeadline = this.addBusinessDays(new Date(startDate), Math.max(0, daysRequired - 1));
        const project = await Project_model_1.default.create({
            ...input,
            deadline: calculatedDeadline,
            createdBy
        });
        return project.populate('createdBy', 'name email role').then(p => p.populate('assignedTo', 'name email'));
    }
    /**
     * Returns all projects sorted by deadline ascending.
     * Populates creator name so the frontend doesn't need a second call.
     */
    async getAllProjects() {
        return Project_model_1.default.find()
            .populate('createdBy', 'name email role')
            .populate('assignedTo', 'name email')
            .sort({ deadline: 1 });
    }
    /**
     * Returns only Active projects — used in work-log dropdowns.
     */
    async getActiveProjects() {
        return Project_model_1.default.find({ status: interfaces_1.ProjectStatus.Active })
            .populate('createdBy', 'name')
            .populate('assignedTo', 'name email')
            .sort({ deadline: 1 });
    }
    /**
     * Returns a single project with creator info.
     */
    async getProjectById(id) {
        const project = await Project_model_1.default.findById(id)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email');
        if (!project)
            throw new Error('Project not found');
        return project;
    }
    /**
     * Returns projects assigned to a specific user.
     */
    async getAssignedProjects(userId) {
        return Project_model_1.default.find({
            assignedTo: new (await Promise.resolve().then(() => __importStar(require('mongoose')))).default.Types.ObjectId(userId),
            status: interfaces_1.ProjectStatus.Active
        })
            .populate('assignedTo', 'name email')
            .sort({ deadline: 1 });
    }
    /**
     * Calculates remaining hours for a project.
     */
    async getProjectRemainingHours(projectId) {
        const project = await Project_model_1.default.findById(projectId);
        if (!project)
            throw new Error('Project not found');
        const Task = (await Promise.resolve().then(() => __importStar(require('../models/Task.model')))).default;
        const tasks = await Task.find({ projectId });
        const totalMinutesSpent = tasks.reduce((sum, t) => sum + (t.totalMinutesSpent || 0), 0);
        const totalHoursSpent = totalMinutesSpent / 60;
        return {
            allocated: project.allocatedHours || 0,
            spent: parseFloat(totalHoursSpent.toFixed(2)),
            remaining: parseFloat(((project.allocatedHours || 0) - totalHoursSpent).toFixed(2))
        };
    }
    /**
     * Admin can update any project field, including marking it Completed.
     */
    async updateProject(id, input) {
        const existing = await Project_model_1.default.findById(id);
        if (!existing)
            throw new Error('Project not found');
        const updateData = { ...input };
        // Recalculate deadline if startDate or allocatedHours change
        if (input.startDate || input.allocatedHours !== undefined) {
            const start = input.startDate ? new Date(input.startDate) : existing.startDate;
            const hours = input.allocatedHours !== undefined ? input.allocatedHours : existing.allocatedHours;
            const daysRequired = Math.ceil(hours / 8);
            updateData.deadline = this.addBusinessDays(start, Math.max(0, daysRequired - 1));
        }
        const project = await Project_model_1.default.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
            .populate('createdBy', 'name email role')
            .populate('assignedTo', 'name email');
        return project;
    }
    /**
     * Hard delete — only for Admin.
     * NOTE: deleting a project does NOT cascade-delete tasks/logs — handle separately or use soft-delete in production.
     */
    async deleteProject(id) {
        const project = await Project_model_1.default.findByIdAndDelete(id);
        if (!project)
            throw new Error('Project not found');
    }
}
exports.ProjectService = ProjectService;
//# sourceMappingURL=project.service.js.map