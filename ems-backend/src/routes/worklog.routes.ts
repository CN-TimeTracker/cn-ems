import { Router } from 'express';
import {
  createLog,
  getMyLogs,
  getAllLogs,
  getTodayHours,
  getProjectHoursSummary,
  getMyProjectTodayHours,
  getAdminProjectBreakdown,
} from '../controllers/worklog.controller';
import { protect, adminOnly } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createWorkLogSchema } from '../middleware/schemas';

const router = Router();

// All routes require authentication
router.use(protect);

// POST   /api/v1/logs             — log work (authenticated user)
router.post('/', validate(createWorkLogSchema), createLog);

// GET    /api/v1/logs/my          — own logs with optional filters
router.get('/my', getMyLogs);

// GET    /api/v1/logs/today       — today's hours for calling user
router.get('/today', getTodayHours);

// GET    /api/v1/logs/projects/summary — Admin: per-project totals
router.get('/projects/summary', adminOnly, getProjectHoursSummary);

// GET    /api/v1/logs             — Admin: all logs with filters
router.get('/', adminOnly, getAllLogs);

// GET    /api/v1/logs/my/project/:projectId/today — Hours for specific project today
router.get('/my/project/:projectId/today', getMyProjectTodayHours);

// GET    /api/v1/logs/admin/breakdown — Admin: detailed user-project breakdown
router.get('/admin/breakdown', adminOnly, getAdminProjectBreakdown);

export default router;
