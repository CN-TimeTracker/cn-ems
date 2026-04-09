import { Router } from 'express';
import { 
  punchIn, 
  punchOut,
  startBreak,
  endBreak,
  getMyToday, 
  getAdminTodayView,
  updateLateReason
} from '../controllers/attendance.controller';
import { protect, adminOnly } from '../middleware/auth.middleware';

const router = Router();

// All attendance routes require authentication
router.use(protect);

// POST   /api/v1/attendance/punch-in    — Employee punches in
router.post('/punch-in', punchIn);

// POST   /api/v1/attendance/punch-out   — Employee punches out
router.post('/punch-out', punchOut);

// POST   /api/v1/attendance/break/start — Employee starts a break
router.post('/break/start', startBreak);

// POST   /api/v1/attendance/break/end   — Employee ends a break
router.post('/break/end', endBreak);

// GET    /api/v1/attendance/today       — Employee's own record for today
router.get('/today', getMyToday);

// PATCH  /api/v1/attendance/today/reason — Employee updates their late reason
router.patch('/today/reason', updateLateReason);

// GET    /api/v1/attendance/admin/today — Admin: all employees' attendance today
router.get('/admin/today', adminOnly, getAdminTodayView);

export default router;
