import { Response } from 'express';
import { LeaveService } from '../services';
import { IAuthRequest, UserRole } from '../interfaces';
import { asyncHandler } from '../utils/asyncHandler';

const leaveService = new LeaveService();

// ─────────────────────────────────────────────
// POST /api/v1/leaves         [Protected]
// Employee applies for leave
// ─────────────────────────────────────────────

export const applyLeave = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const leave = await leaveService.applyLeave(req.user!.id, req.body);

  res.status(201).json({
    success: true,
    message: 'Leave application submitted',
    data: leave,
  });
});

// ─────────────────────────────────────────────
// GET /api/v1/leaves          [Protected]
// Admin → all leaves
// Employee → only their own
// ─────────────────────────────────────────────

export const getLeaves = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const isAdmin = req.user!.role === UserRole.Admin;

  // Admins can optionally filter by userId via query param
  const filterUserId = isAdmin
    ? (req.query.userId as string | undefined)
    : req.user!.id;

  const leaves = await leaveService.getLeaves(filterUserId);

  res.status(200).json({
    success: true,
    count: leaves.length,
    data: leaves,
  });
});

// ─────────────────────────────────────────────
// GET /api/v1/leaves/pending  [Admin]
// All pending leave requests — for admin approval queue
// ─────────────────────────────────────────────

export const getPendingLeaves = asyncHandler(async (_req: IAuthRequest, res: Response) => {
  const leaves = await leaveService.getPendingLeaves();

  res.status(200).json({
    success: true,
    count: leaves.length,
    data: leaves,
  });
});

// ─────────────────────────────────────────────
// PATCH /api/v1/leaves/:id/review  [Admin]
// Approve or reject a leave request
// ─────────────────────────────────────────────

export const reviewLeave = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const leave = await leaveService.reviewLeave(
    req.params.id,
    req.user!.id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: `Leave ${req.body.status.toLowerCase()} successfully`,
    data: leave,
  });
});

// ─────────────────────────────────────────────
// DELETE /api/v1/leaves/:id   [Protected]
// Employee cancels their own pending leave
// ─────────────────────────────────────────────

export const cancelLeave = asyncHandler(async (req: IAuthRequest, res: Response) => {
  await leaveService.cancelLeave(req.params.id, req.user!.id);

  res.status(200).json({
    success: true,
    message: 'Leave request cancelled',
  });
});
