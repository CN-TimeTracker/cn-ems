import { Router } from 'express';
import {
  uploadPayslip,
  getPayslip,
  getPayslipHistory,
  generateDynamicPayslip,
  getSalaryConfig,
  updateSalaryConfig,
  getAllSalaryConfigs,
  getUserSalaryConfigs
} from '../controllers/payslip.controller';
import { protect, adminOnly } from '../middleware/auth.middleware';
import { uploadPayslipMiddleware } from '../middleware/multer.middleware';

const router = Router();

// All payslip routes require authentication
router.use(protect);

// GET   /api/v1/payslips/generate — Generate dynamic payslip
router.get('/generate', generateDynamicPayslip);

// GET   /api/v1/payslips/config/all — Get all salary configs (Admin only)
router.get('/config/all', adminOnly, getAllSalaryConfigs);

// GET   /api/v1/payslips/config/me — Get user's own salary configs (History)
router.get('/config/me', getUserSalaryConfigs);

// GET   /api/v1/payslips/config — Get salary config
router.get('/config', getSalaryConfig);

// POST  /api/v1/payslips/config — Update salary config (Admin only)
router.post('/config', adminOnly, updateSalaryConfig);

export default router;
