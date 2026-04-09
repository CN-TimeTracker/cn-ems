"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payslip_controller_1 = require("../controllers/payslip.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All payslip routes require authentication
router.use(auth_middleware_1.protect);
// GET   /api/v1/payslips/generate — Generate dynamic payslip
router.get('/generate', payslip_controller_1.generateDynamicPayslip);
// GET   /api/v1/payslips/config/all — Get all salary configs (Admin only)
router.get('/config/all', auth_middleware_1.adminOnly, payslip_controller_1.getAllSalaryConfigs);
// GET   /api/v1/payslips/config/me — Get user's own salary configs (History)
router.get('/config/me', payslip_controller_1.getUserSalaryConfigs);
// GET   /api/v1/payslips/config — Get salary config
router.get('/config', payslip_controller_1.getSalaryConfig);
// POST  /api/v1/payslips/config — Update salary config (Admin only)
router.post('/config', auth_middleware_1.adminOnly, payslip_controller_1.updateSalaryConfig);
exports.default = router;
//# sourceMappingURL=payslip.routes.js.map