"use strict";
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
     * Creates a new project. createdBy is injected from the JWT payload in the controller.
     */
    async createProject(input, createdBy) {
        const project = await Project_model_1.default.create({ ...input, createdBy });
        return project;
    }
    /**
     * Returns all projects sorted by deadline ascending.
     * Populates creator name so the frontend doesn't need a second call.
     */
    async getAllProjects() {
        return Project_model_1.default.find()
            .populate('createdBy', 'name email role')
            .sort({ deadline: 1 });
    }
    /**
     * Returns only Active projects — used in work-log dropdowns.
     */
    async getActiveProjects() {
        return Project_model_1.default.find({ status: interfaces_1.ProjectStatus.Active })
            .populate('createdBy', 'name')
            .sort({ deadline: 1 });
    }
    /**
     * Returns a single project with creator info.
     */
    async getProjectById(id) {
        const project = await Project_model_1.default.findById(id).populate('createdBy', 'name email');
        if (!project)
            throw new Error('Project not found');
        return project;
    }
    /**
     * Admin can update any project field, including marking it Completed.
     */
    async updateProject(id, input) {
        const project = await Project_model_1.default.findByIdAndUpdate(id, { $set: input }, { new: true, runValidators: true });
        if (!project)
            throw new Error('Project not found');
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