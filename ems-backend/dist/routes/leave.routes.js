"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const leave_controller_1 = require("../controllers/leave.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const schemas_1 = require("../middleware/schemas");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.protect);
// POST   /api/v1/leaves                — employee applies
router.post('/', (0, validate_middleware_1.validate)(schemas_1.createLeaveSchema), leave_controller_1.applyLeave);
// GET    /api/v1/leaves                — Admin: all; Employee: own
router.get('/', leave_controller_1.getLeaves);
// GET    /api/v1/leaves/pending        — Admin: approval queue
router.get('/pending', auth_middleware_1.adminOnly, leave_controller_1.getPendingLeaves);
// PATCH  /api/v1/leaves/:id/review     — Admin: approve or reject
router.patch('/:id/review', auth_middleware_1.adminOnly, (0, validate_middleware_1.validate)(schemas_1.reviewLeaveSchema), leave_controller_1.reviewLeave);
// DELETE /api/v1/leaves/:id            — Employee: cancel own pending leave
router.delete('/:id', leave_controller_1.cancelLeave);
exports.default = router;
//# sourceMappingURL=leave.routes.js.map