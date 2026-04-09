"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const holiday_controller_1 = require("../controllers/holiday.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const interfaces_1 = require("../interfaces");
const router = (0, express_1.Router)();
// Public holidays can be viewed by anyone authenticated
router.get('/', auth_middleware_1.protect, holiday_controller_1.getAllHolidays);
// Adding and deleting holidays is restricted to Admin
router.post('/', auth_middleware_1.protect, (0, auth_middleware_1.roleGuard)(interfaces_1.UserRole.Admin), holiday_controller_1.addHoliday);
router.delete('/:id', auth_middleware_1.protect, (0, auth_middleware_1.roleGuard)(interfaces_1.UserRole.Admin), holiday_controller_1.deleteHoliday);
exports.default = router;
//# sourceMappingURL=holiday.routes.js.map