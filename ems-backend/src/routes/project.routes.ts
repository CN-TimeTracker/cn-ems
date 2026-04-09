import { Router } from 'express';
import {
  createProject,
  getAllProjects,
  getActiveProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getAssignedProjects,
  getProjectRemainingHours,
} from '../controllers/project.controller';
import { protect, adminOnly } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createProjectSchema, updateProjectSchema } from '../middleware/schemas';

const router = Router();

// All routes require authentication
router.use(protect);

// GET    /api/v1/projects/assigned — projects assigned to the user
router.get('/assigned', getAssignedProjects);

// GET    /api/v1/projects/active  — all authenticated users
router.get('/active', getActiveProjects);

// GET    /api/v1/projects/:id/remaining — remaining hours
router.get('/:id/remaining', getProjectRemainingHours);

// GET    /api/v1/projects          — all authenticated users
router.get('/', getAllProjects);

// GET    /api/v1/projects/:id      — all authenticated users
router.get('/:id', getProjectById);

// Admin-only routes below
// POST   /api/v1/projects
router.post('/', adminOnly, validate(createProjectSchema), createProject);

// PATCH  /api/v1/projects/:id
router.patch('/:id', adminOnly, validate(updateProjectSchema), updateProject);

// DELETE /api/v1/projects/:id
router.delete('/:id', adminOnly, deleteProject);

export default router;
