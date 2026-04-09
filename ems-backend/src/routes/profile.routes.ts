import { Router } from 'express';
import { 
  requestUpdate, 
  getMyPendingRequest, 
  getPendingRequests, 
  approveRequest, 
  rejectRequest,
  revokeRequest,
  getReviewHistory,
  updateProfilePicture,
  deleteProfilePicture
} from '../controllers/profile.controller';
import { protect, adminOnly } from '../middleware/auth.middleware';
import { uploadProfilePictureMiddleware } from '../middleware/multer.middleware';

const router = Router();

// Protect all profile routes
router.use(protect);

// Profile Picture
router.patch('/picture', uploadProfilePictureMiddleware.single('image'), updateProfilePicture);
router.delete('/picture', deleteProfilePicture);

// Employee routes
router.post('/request-update', requestUpdate);
router.get('/my-pending', getMyPendingRequest);

// Admin routes
router.get('/requests', adminOnly, getPendingRequests);
router.post('/requests/:id/approve', adminOnly, approveRequest);
router.post('/requests/:id/reject', adminOnly, rejectRequest);
router.post('/requests/:id/revoke', adminOnly, revokeRequest);
router.get('/review-history', adminOnly, getReviewHistory);

export default router;
