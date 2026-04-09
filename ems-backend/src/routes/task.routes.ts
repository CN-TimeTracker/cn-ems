import { Router } from 'express';
import {
  createTask,
  getTasks,
  getMyTasks,
  getTaskById,
  updateTask,
  deleteTask,
  startTimer,
  pauseTimer,
  stopTimer,
} from '../controllers/task.controller';
import { protect, adminOnly } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createTaskSchema, updateTaskSchema } from '../middleware/schemas';

const router = Router();

// All routes require authentication
router.use(protect);

// GET    /api/v1/tasks/my         — employee's own tasks
router.get('/my', getMyTasks);


// GET    /api/v1/tasks            — Admin sees all; employee sees own
router.get('/', getTasks);

// GET    /api/v1/tasks/:id
router.get('/:id', getTaskById);

// POST   /api/v1/tasks            — Now allowed for all (with assignment check in controller/service)
router.post('/', validate(createTaskSchema), createTask);

// Timer endpoints
router.patch('/:id/start', startTimer);
router.patch('/:id/pause', pauseTimer);
router.patch('/:id/stop',  stopTimer);

// PATCH  /api/v1/tasks/:id        — Admin: all fields; Employee: status only
router.patch('/:id', validate(updateTaskSchema), updateTask);

// DELETE /api/v1/tasks/:id        — Admin only
router.delete('/:id', adminOnly, deleteTask);

export default router;
