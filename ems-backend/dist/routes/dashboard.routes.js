"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.protect);
// GET    /api/v1/dashboard/admin     — Admin only accountability snapshot
router.get('/admin', auth_middleware_1.adminOnly, dashboard_controller_1.getAdminDashboard);
// GET    /api/v1/dashboard/employee      — Personal dashboard
router.get('/employee', dashboard_controller_1.getEmployeeDashboard);
// GET    /api/v1/dashboard/celebrations  — Birthdays and anniversaries
router.get('/celebrations', dashboard_controller_1.getCelebrations);
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map