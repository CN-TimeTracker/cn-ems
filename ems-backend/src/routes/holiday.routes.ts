import { Router } from 'express';
import { 
  addHoliday, 
  deleteHoliday, 
  getAllHolidays 
} from '../controllers/holiday.controller';
import { protect, roleGuard } from '../middleware/auth.middleware';
import { UserRole } from '../interfaces';

const router = Router();

// Public holidays can be viewed by anyone authenticated
router.get('/', protect, getAllHolidays);

// Adding and deleting holidays is restricted to Admin
router.post('/', protect, roleGuard(UserRole.Admin), addHoliday);
router.delete('/:id', protect, roleGuard(UserRole.Admin), deleteHoliday);

export default router;
