import { Response } from 'express';
import { ProjectService } from '../services';
import { IAuthRequest } from '../interfaces';
import { asyncHandler } from '../utils/asyncHandler';

const projectService = new ProjectService();

// ─────────────────────────────────────────────
// POST /api/v1/projects       [Admin]
// ─────────────────────────────────────────────

export const createProject = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const project = await projectService.createProject(req.body, req.user!.id);

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: project,
  });
});

// ─────────────────────────────────────────────
// GET /api/v1/projects        [Protected]
// ─────────────────────────────────────────────

export const getAllProjects = asyncHandler(async (_req: IAuthRequest, res: Response) => {
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

export const getActiveProjects = asyncHandler(async (_req: IAuthRequest, res: Response) => {
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

export const getProjectById = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const project = await projectService.getProjectById(req.params.id);

  res.status(200).json({
    success: true,
    data: project,
  });
});

// ─────────────────────────────────────────────
// PATCH /api/v1/projects/:id  [Admin]
// ─────────────────────────────────────────────

export const updateProject = asyncHandler(async (req: IAuthRequest, res: Response) => {
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

export const deleteProject = asyncHandler(async (req: IAuthRequest, res: Response) => {
  await projectService.deleteProject(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Project deleted successfully',
  });
});

// ─────────────────────────────────────────────
// GET /api/v1/projects/assigned [Protected]
// ─────────────────────────────────────────────

export const getAssignedProjects = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const projects = await projectService.getAssignedProjects(req.user!.id);

  res.status(200).json({
    success: true,
    count: projects.length,
    data: projects,
  });
});

// ─────────────────────────────────────────────
// GET /api/v1/projects/:id/remaining [Protected]
// ─────────────────────────────────────────────

export const getProjectRemainingHours = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const status = await projectService.getProjectRemainingHours(req.params.id);

  res.status(200).json({
    success: true,
    data: status,
  });
});
