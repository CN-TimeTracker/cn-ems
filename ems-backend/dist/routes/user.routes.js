"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const schemas_1 = require("../middleware/schemas");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.protect);
// GET    /api/v1/users/active   — protected (task assignment dropdowns)
router.get('/active', user_controller_1.getActiveEmployees);
// All routes below are Admin only
router.use(auth_middleware_1.adminOnly);
// POST   /api/v1/users
router.post('/', (0, validate_middleware_1.validate)(schemas_1.createUserSchema), user_controller_1.createUser);
// GET    /api/v1/users
router.get('/', user_controller_1.getAllUsers);
// GET    /api/v1/users/:id
router.get('/:id', user_controller_1.getUserById);
// PATCH  /api/v1/users/:id
router.patch('/:id', (0, validate_middleware_1.validate)(schemas_1.updateUserSchema), user_controller_1.updateUser);
// DELETE /api/v1/users/:id     (soft delete)
router.delete('/:id', user_controller_1.deactivateUser);
exports.default = router;
//# sourceMappingURL=user.routes.js.map