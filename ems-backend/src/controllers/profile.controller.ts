import { Response, NextFunction } from 'express';
import { ProfileUpdateService } from '../services/profile.service';
import { IAuthRequest } from '../interfaces';
import { asyncHandler } from '../utils/asyncHandler';
import User from '../models/User.model';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import s3Client from '../config/s3';
import { AppError } from '../middleware/error.middleware';

const profileUpdateService = new ProfileUpdateService();

// ─────────────────────────────────────────────
// PATCH /api/v1/profile/picture
// Update profile picture
// ─────────────────────────────────────────────
export const updateProfilePicture = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new AppError('No image uploaded', 400));
  }

  const user = await User.findById(req.user!.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Delete old picture from S3 if it exists
  if (user.profilePicture) {
    try {
      const oldKey = user.profilePicture.split('.com/').pop();
      if (oldKey) {
        await s3Client.send(new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: oldKey,
        }));
      }
    } catch (err) {
      console.error('Error deleting old profile picture:', err);
      // Continue even if deletion fails (maybe the file was already gone)
    }
  }

  // Update with new URL (location is added by multer-s3)
  const newUrl = (req.file as any).location;
  user.profilePicture = newUrl;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile picture updated successfully',
    data: { profilePicture: newUrl },
  });
});

// ─────────────────────────────────────────────
// DELETE /api/v1/profile/picture
// Delete profile picture
// ─────────────────────────────────────────────
export const deleteProfilePicture = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user!.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (!user.profilePicture) {
    return res.status(200).json({ success: true, message: 'No profile picture to delete' });
  }

  // Delete from S3
  try {
    const key = user.profilePicture.split('.com/').pop();
    if (key) {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
      }));
    }
  } catch (err) {
    console.error('Error deleting profile picture from S3:', err);
  }

  user.profilePicture = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile picture removed successfully',
  });
});

// ─────────────────────────────────────────────
// POST /api/v1/profile/request-update
// Employee requests profile update
// ─────────────────────────────────────────────
export const requestUpdate = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const request = await profileUpdateService.requestUpdate(req.user!.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Profile update requested successfully. Pending admin approval.',
    data: request,
  });
});

// ─────────────────────────────────────────────
// GET /api/v1/profile/my-pending
// Check if user has an active pending request
// ─────────────────────────────────────────────

export const getMyPendingRequest = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const request = await profileUpdateService.getPendingRequestForUser(req.user!.id);
  res.status(200).json({
    success: true,
    data: request ?? null,
  });
});

// ─────────────────────────────────────────────
// GET /api/v1/profile/requests
// Admin list all pending requests
// ─────────────────────────────────────────────

export const getPendingRequests = asyncHandler(async (_req: IAuthRequest, res: Response) => {
  const requests = await profileUpdateService.getAllPendingRequests();
  res.status(200).json({
    success: true,
    count: requests.length,
    data: requests,
  });
});

// ─────────────────────────────────────────────
// POST /api/v1/profile/requests/:id/approve
// Admin approves request
// ─────────────────────────────────────────────

export const approveRequest = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const request = await profileUpdateService.approveRequest(req.params.id, req.user!.id);
  res.status(200).json({
    success: true,
    message: 'Profile update request approved.',
    data: request,
  });
});

// ─────────────────────────────────────────────
// POST /api/v1/profile/requests/:id/reject
// Admin rejects request
// ─────────────────────────────────────────────

export const rejectRequest = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const request = await profileUpdateService.rejectRequest(req.params.id, req.user!.id);
  res.status(200).json({
    success: true,
    message: 'Profile update request rejected.',
    data: request,
  });
});

// ─────────────────────────────────────────────
// GET /api/v1/profile/review-history [Admin]
// ─────────────────────────────────────────────

export const getReviewHistory = asyncHandler(async (_req: IAuthRequest, res: Response) => {
  const history = await profileUpdateService.getReviewHistory();
  res.status(200).json({
    success: true,
    count: history.length,
    data: history,
  });
});

// ─────────────────────────────────────────────
// POST /api/v1/profile/requests/:id/revoke [Admin]
// ─────────────────────────────────────────────

export const revokeRequest = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const request = await profileUpdateService.revokeRequest(req.params.id, req.user!.id);
  res.status(200).json({
    success: true,
    message: 'Profile update approval revoked successfully.',
    data: request,
  });
});
