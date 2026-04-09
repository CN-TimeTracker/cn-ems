import { Response } from 'express';
import { UserService } from '../services';
import { IAuthRequest } from '../interfaces';
import { asyncHandler } from '../utils/asyncHandler';

const userService = new UserService();

// ─────────────────────────────────────────────
// POST /api/v1/users          [Admin]
// ─────────────────────────────────────────────

export const createUser = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const user = await userService.createUser(req.body);

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: user,
  });
});

// ─────────────────────────────────────────────
// GET /api/v1/users           [Admin]
// ─────────────────────────────────────────────

export const getAllUsers = asyncHandler(async (_req: IAuthRequest, res: Response) => {
  const users = await userService.getAllUsers();

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// ─────────────────────────────────────────────
// GET /api/v1/users/active    [Protected]
// Dropdown list for task assignment
// ─────────────────────────────────────────────

export const getActiveEmployees = asyncHandler(async (_req: IAuthRequest, res: Response) => {
  const users = await userService.getActiveEmployees();

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// ─────────────────────────────────────────────
// GET /api/v1/users/:id       [Admin]
// ─────────────────────────────────────────────

export const getUserById = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const user = await userService.getUserById(req.params.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// ─────────────────────────────────────────────
// PATCH /api/v1/users/:id     [Admin]
// ─────────────────────────────────────────────

export const updateUser = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const user = await userService.updateUser(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: user,
  });
});

// ─────────────────────────────────────────────
// DELETE /api/v1/users/:id    [Admin]
// Soft-delete — marks isActive: false
// ─────────────────────────────────────────────

export const deactivateUser = asyncHandler(async (req: IAuthRequest, res: Response) => {
  await userService.deactivateUser(req.params.id);

  res.status(200).json({
    success: true,
    message: 'User deactivated successfully',
  });
});

// ─────────────────────────────────────────────
// POST /api/v1/users/:id/activate [Admin]
// ─────────────────────────────────────────────

export const activateUser = asyncHandler(async (req: IAuthRequest, res: Response) => {
  await userService.activateUser(req.params.id);

  res.status(200).json({
    success: true,
    message: 'User activated successfully',
  });
});
