"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const worklog_controller_1 = require("../controllers/worklog.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const schemas_1 = require("../middleware/schemas");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.protect);
// POST   /api/v1/logs             — log work (authenticated user)
router.post('/', (0, validate_middleware_1.validate)(schemas_1.createWorkLogSchema), worklog_controller_1.createLog);
// GET    /api/v1/logs/my          — own logs with optional filters
router.get('/my', worklog_controller_1.getMyLogs);
// GET    /api/v1/logs/today       — today's hours for calling user
router.get('/today', worklog_controller_1.getTodayHours);
// GET    /api/v1/logs/projects/summary — Admin: per-project totals
router.get('/projects/summary', auth_middleware_1.adminOnly, worklog_controller_1.getProjectHoursSummary);
// GET    /api/v1/logs             — Admin: all logs with filters
router.get('/', auth_middleware_1.adminOnly, worklog_controller_1.getAllLogs);
// GET    /api/v1/logs/my/project/:projectId/today — Hours for specific project today
router.get('/my/project/:projectId/today', worklog_controller_1.getMyProjectTodayHours);
// GET    /api/v1/logs/admin/breakdown — Admin: detailed user-project breakdown
router.get('/admin/breakdown', auth_middleware_1.adminOnly, worklog_controller_1.getAdminProjectBreakdown);
exports.default = router;
//# sourceMappingURL=worklog.routes.js.map