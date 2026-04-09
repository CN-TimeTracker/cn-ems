"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const task_controller_1 = require("../controllers/task.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const schemas_1 = require("../middleware/schemas");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.protect);
// GET    /api/v1/tasks/my         — employee's own tasks
router.get('/my', task_controller_1.getMyTasks);
// GET    /api/v1/tasks            — Admin sees all; employee sees own
router.get('/', task_controller_1.getTasks);
// GET    /api/v1/tasks/:id
router.get('/:id', task_controller_1.getTaskById);
// POST   /api/v1/tasks            — Now allowed for all (with assignment check in controller/service)
router.post('/', (0, validate_middleware_1.validate)(schemas_1.createTaskSchema), task_controller_1.createTask);
// Timer endpoints
router.patch('/:id/start', task_controller_1.startTimer);
router.patch('/:id/pause', task_controller_1.pauseTimer);
router.patch('/:id/stop', task_controller_1.stopTimer);
// PATCH  /api/v1/tasks/:id        — Admin: all fields; Employee: status only
router.patch('/:id', (0, validate_middleware_1.validate)(schemas_1.updateTaskSchema), task_controller_1.updateTask);
// DELETE /api/v1/tasks/:id        — Admin only
router.delete('/:id', auth_middleware_1.adminOnly, task_controller_1.deleteTask);
exports.default = router;
//# sourceMappingURL=task.routes.js.map