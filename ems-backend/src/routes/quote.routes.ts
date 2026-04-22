import { Router } from 'express';
import { QuoteController } from '../controllers/quote.controller';
import { protect, roleGuard } from '../middleware/auth.middleware';
import { UserRole } from '../interfaces';

const router = Router();

// Public / Authenticated - Get the daily quote for dashboard
router.get('/daily', protect, QuoteController.getDaily);

// Admin Only - Manage quotes
router.use(protect, roleGuard(UserRole.Admin));

router.route('/')
  .get(QuoteController.getAll)
  .post(QuoteController.create);

router.route('/:id')
  .delete(QuoteController.delete);

export default router;
