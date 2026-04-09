"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attendance_controller_1 = require("../controllers/attendance.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All attendance routes require authentication
router.use(auth_middleware_1.protect);
// POST   /api/v1/attendance/punch-in    — Employee punches in
router.post('/punch-in', attendance_controller_1.punchIn);
// POST   /api/v1/attendance/punch-out   — Employee punches out
router.post('/punch-out', attendance_controller_1.punchOut);
// POST   /api/v1/attendance/break/start — Employee starts a break
router.post('/break/start', attendance_controller_1.startBreak);
// POST   /api/v1/attendance/break/end   — Employee ends a break
router.post('/break/end', attendance_controller_1.endBreak);
// GET    /api/v1/attendance/today       — Employee's own record for today
router.get('/today', attendance_controller_1.getMyToday);
// PATCH  /api/v1/attendance/today/reason — Employee updates their late reason
router.patch('/today/reason', attendance_controller_1.updateLateReason);
// GET    /api/v1/attendance/admin/today — Admin: all employees' attendance today
router.get('/admin/today', auth_middleware_1.adminOnly, attendance_controller_1.getAdminTodayView);
exports.default = router;
//# sourceMappingURL=attendance.routes.js.map