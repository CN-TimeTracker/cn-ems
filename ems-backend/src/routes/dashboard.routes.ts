import { Router } from 'express';
import {
  getAdminDashboard,
  getEmployeeDashboard,
  getCelebrations,
} from '../controllers/dashboard.controller';
import { protect, adminOnly } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(protect);

// GET    /api/v1/dashboard/admin     — Admin only accountability snapshot
router.get('/admin', adminOnly, getAdminDashboard);

// GET    /api/v1/dashboard/employee      — Personal dashboard
router.get('/employee', getEmployeeDashboard);

// GET    /api/v1/dashboard/celebrations  — Birthdays and anniversaries
router.get('/celebrations', getCelebrations);

export default router;
