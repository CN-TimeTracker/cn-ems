import { Router } from 'express';
import { login, getMe, logout, updatePassword } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { loginSchema } from '../middleware/schemas';

const router = Router();

// POST   /api/v1/auth/login
router.post('/login', validate(loginSchema), login);

// GET    /api/v1/auth/me
router.get('/me', protect, getMe);

// POST   /api/v1/auth/logout
router.post('/logout', protect, logout);

// PATCH  /api/v1/auth/password
router.patch('/password', protect, updatePassword);

export default router;
