import { Router } from 'express';
import * as eventController from '../controllers/event.controller';
import { protect, adminOnly } from '../middleware/auth.middleware';
import { uploadEventImagesMiddleware } from '../middleware/multer.middleware';

const router = Router();

// Routes accessible by all authenticated users
router.use(protect as any); // Apply protect to all event routes

router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEvent);

// Routes restricted to Admins
router.post(
  '/',
  adminOnly as any,
  uploadEventImagesMiddleware.array('images'),
  eventController.createEvent
);

router.patch(
  '/:id',
  adminOnly as any,
  uploadEventImagesMiddleware.array('images'),
  eventController.updateEvent
);

router.delete('/:id', adminOnly as any, eventController.deleteEvent);

export default router;
