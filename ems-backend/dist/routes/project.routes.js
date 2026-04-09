"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const project_controller_1 = require("../controllers/project.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const schemas_1 = require("../middleware/schemas");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.protect);
// GET    /api/v1/projects/active  — all authenticated users
router.get('/active', project_controller_1.getActiveProjects);
// GET    /api/v1/projects          — all authenticated users
router.get('/', project_controller_1.getAllProjects);
// GET    /api/v1/projects/:id      — all authenticated users
router.get('/:id', project_controller_1.getProjectById);
// Admin-only routes below
// POST   /api/v1/projects
router.post('/', auth_middleware_1.adminOnly, (0, validate_middleware_1.validate)(schemas_1.createProjectSchema), project_controller_1.createProject);
// PATCH  /api/v1/projects/:id
router.patch('/:id', auth_middleware_1.adminOnly, (0, validate_middleware_1.validate)(schemas_1.updateProjectSchema), project_controller_1.updateProject);
// DELETE /api/v1/projects/:id
router.delete('/:id', auth_middleware_1.adminOnly, project_controller_1.deleteProject);
exports.default = router;
//# sourceMappingURL=project.routes.js.map