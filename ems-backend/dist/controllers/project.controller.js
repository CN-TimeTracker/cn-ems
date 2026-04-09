"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectRemainingHours = exports.getAssignedProjects = exports.deleteProject = exports.updateProject = exports.getProjectById = exports.getActiveProjects = exports.getAllProjects = exports.createProject = void 0;
const services_1 = require("../services");
const asyncHandler_1 = require("../utils/asyncHandler");
const projectService = new services_1.ProjectService();
// ─────────────────────────────────────────────
// POST /api/v1/projects       [Admin]
// ─────────────────────────────────────────────
exports.createProject = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = await projectService.createProject(req.body, req.user.id);
    res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: project,
    });
});
// ─────────────────────────────────────────────
// GET /api/v1/projects        [Protected]
// ─────────────────────────────────────────────
exports.getAllProjects = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const projects = await projectService.getAllProjects();
    res.status(200).json({
        success: true,
        count: projects.length,
        data: projects,
    });
});
// ─────────────────────────────────────────────
// GET /api/v1/projects/active [Protected]
// For work-log and task dropdowns
// ─────────────────────────────────────────────
exports.getActiveProjects = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const projects = await projectService.getActiveProjects();
    res.status(200).json({
        success: true,
        count: projects.length,
        data: projects,
    });
});
// ─────────────────────────────────────────────
// GET /api/v1/projects/:id    [Protected]
// ─────────────────────────────────────────────
exports.getProjectById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = await projectService.getProjectById(req.params.id);
    res.status(200).json({
        success: true,
        data: project,
    });
});
// ─────────────────────────────────────────────
// PATCH /api/v1/projects/:id  [Admin]
// ─────────────────────────────────────────────
exports.updateProject = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const project = await projectService.updateProject(req.params.id, req.body);
    res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        data: project,
    });
});
// ─────────────────────────────────────────────
// DELETE /api/v1/projects/:id [Admin]
// ─────────────────────────────────────────────
exports.deleteProject = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await projectService.deleteProject(req.params.id);
    res.status(200).json({
        success: true,
        message: 'Project deleted successfully',
    });
});
// ─────────────────────────────────────────────
// GET /api/v1/projects/assigned [Protected]
// ─────────────────────────────────────────────
exports.getAssignedProjects = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const projects = await projectService.getAssignedProjects(req.user.id);
    res.status(200).json({
        success: true,
        count: projects.length,
        data: projects,
    });
});
// ─────────────────────────────────────────────
// GET /api/v1/projects/:id/remaining [Protected]
// ─────────────────────────────────────────────
exports.getProjectRemainingHours = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const status = await projectService.getProjectRemainingHours(req.params.id);
    res.status(200).json({
        success: true,
        data: status,
    });
});
//# sourceMappingURL=project.controller.js.map