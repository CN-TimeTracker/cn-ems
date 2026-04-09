"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activateUser = exports.deactivateUser = exports.updateUser = exports.getUserById = exports.getActiveEmployees = exports.getAllUsers = exports.createUser = void 0;
const services_1 = require("../services");
const asyncHandler_1 = require("../utils/asyncHandler");
const userService = new services_1.UserService();
// ─────────────────────────────────────────────
// POST /api/v1/users          [Admin]
// ─────────────────────────────────────────────
exports.createUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
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
exports.getAllUsers = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
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
exports.getActiveEmployees = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
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
exports.getUserById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json({
        success: true,
        data: user,
    });
});
// ─────────────────────────────────────────────
// PATCH /api/v1/users/:id     [Admin]
// ─────────────────────────────────────────────
exports.updateUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
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
exports.deactivateUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await userService.deactivateUser(req.params.id);
    res.status(200).json({
        success: true,
        message: 'User deactivated successfully',
    });
});
// ─────────────────────────────────────────────
// POST /api/v1/users/:id/activate [Admin]
// ─────────────────────────────────────────────
exports.activateUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await userService.activateUser(req.params.id);
    res.status(200).json({
        success: true,
        message: 'User activated successfully',
    });
});
//# sourceMappingURL=user.controller.js.map