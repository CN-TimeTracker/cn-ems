import { Response } from 'express';
import { DashboardService } from '../services';
import { IAuthRequest } from '../interfaces';
import { asyncHandler } from '../utils/asyncHandler';

const dashboardService = new DashboardService();

// ─────────────────────────────────────────────
// GET /api/v1/dashboard/admin     [Admin]
// Full accountability snapshot
// ─────────────────────────────────────────────

export const getAdminDashboard = asyncHandler(
  async (_req: IAuthRequest, res: Response) => {
    const data = await dashboardService.getAdminDashboard();

    res.status(200).json({
      success: true,
      data,
    });
  }
);

// ─────────────────────────────────────────────
// GET /api/v1/dashboard/employee  [Protected]
// Personal dashboard for the calling employee
// ─────────────────────────────────────────────

export const getEmployeeDashboard = asyncHandler(
  async (req: IAuthRequest, res: Response) => {
    const data = await dashboardService.getEmployeeDashboard(req.user!.id);

    res.status(200).json({
      success: true,
      data,
    });
  }
);

// ─────────────────────────────────────────────
// GET /api/v1/dashboard/celebrations  [Protected]
// Today's birthdays and work anniversaries
// ─────────────────────────────────────────────

export const getCelebrations = asyncHandler(
  async (_req: IAuthRequest, res: Response) => {
    const data = await dashboardService.getCelebrations();

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  }
);
