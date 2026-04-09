import { Router } from 'express';
import {
  applyLeave,
  getLeaves,
  getPendingLeaves,
  reviewLeave,
  cancelLeave,
} from '../controllers/leave.controller';
import { protect, adminOnly } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createLeaveSchema, reviewLeaveSchema } from '../middleware/schemas';

const router = Router();

// All routes require authentication
router.use(protect);

// POST   /api/v1/leaves                — employee applies
router.post('/', validate(createLeaveSchema), applyLeave);

// GET    /api/v1/leaves                — Admin: all; Employee: own
router.get('/', getLeaves);

// GET    /api/v1/leaves/pending        — Admin: approval queue
router.get('/pending', adminOnly, getPendingLeaves);

// PATCH  /api/v1/leaves/:id/review     — Admin: approve or reject
router.patch('/:id/review', adminOnly, validate(reviewLeaveSchema), reviewLeave);

// DELETE /api/v1/leaves/:id            — Employee: cancel own pending leave
router.delete('/:id', cancelLeave);

export default router;
