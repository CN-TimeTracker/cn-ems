"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const schemas_1 = require("../middleware/schemas");
const router = (0, express_1.Router)();
// POST   /api/v1/auth/login
router.post('/login', (0, validate_middleware_1.validate)(schemas_1.loginSchema), auth_controller_1.login);
// GET    /api/v1/auth/me
router.get('/me', auth_middleware_1.protect, auth_controller_1.getMe);
// POST   /api/v1/auth/logout
router.post('/logout', auth_middleware_1.protect, auth_controller_1.logout);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map