import { Router } from 'express';
import {
  createUser,
  getAllUsers,
  getActiveEmployees,
  getUserById,
  updateUser,
  deactivateUser,
  activateUser,
} from '../controllers/user.controller';
import { protect, adminOnly } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createUserSchema, updateUserSchema } from '../middleware/schemas';

const router = Router();

// All routes require authentication
router.use(protect);

// GET    /api/v1/users/active   — protected (task assignment dropdowns)
router.get('/active', getActiveEmployees);

// All routes below are Admin only
router.use(adminOnly);

// POST   /api/v1/users
router.post('/', validate(createUserSchema), createUser);

// GET    /api/v1/users
router.get('/', getAllUsers);

// GET    /api/v1/users/:id
router.get('/:id', getUserById);

// PATCH  /api/v1/users/:id
router.patch('/:id', validate(updateUserSchema), updateUser);

// DELETE /api/v1/users/:id     (soft delete)
router.delete('/:id', deactivateUser);

// POST   /api/v1/users/:id/activate
router.post('/:id/activate', activateUser);

export default router;
