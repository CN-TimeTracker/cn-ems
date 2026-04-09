import { Response } from 'express';
import { WorkLogService } from '../services';
import { IAuthRequest, UserRole } from '../interfaces';
import { asyncHandler } from '../utils/asyncHandler';

const workLogService = new WorkLogService();

// ─────────────────────────────────────────────
// POST /api/v1/logs           [Protected]
// Logs hours for the authenticated user
// ─────────────────────────────────────────────

export const createLog = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const log = await workLogService.createLog(req.user!.id, req.body);

  res.status(201).json({
    success: true,
    message: 'Work logged successfully',
    data: log,
  });
});

// ─────────────────────────────────────────────
// GET /api/v1/logs/my         [Protected]
// Employee's own logs with optional filters
// Query: projectId, startDate, endDate
// ─────────────────────────────────────────────

export const getMyLogs = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { projectId, startDate, endDate } = req.query;

  const logs = await workLogService.getMyLogs(req.user!.id, {
    projectId: projectId as string | undefined,
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
  });

  res.status(200).json({
    success: true,
    count: logs.length,
    data: logs,
  });
});

// ─────────────────────────────────────────────
// GET /api/v1/logs            [Admin]
// All logs across all users
// Query: userId, projectId, startDate, endDate
// ─────────────────────────────────────────────

export const getAllLogs = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const { userId, projectId, startDate, endDate } = req.query;

  const logs = await workLogService.getAllLogs({
    userId: userId as string | undefined,
    projectId: projectId as string | undefined,
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
  });

  res.status(200).json({
    success: true,
    count: logs.length,
    data: logs,
  });
});

// ─────────────────────────────────────────────
// GET /api/v1/logs/today      [Protected]
// Hours logged today for the calling user
// ─────────────────────────────────────────────

export const getTodayHours = asyncHandler(async (req: IAuthRequest, res: Response) => {
  const hours = await workLogService.getTodayHoursForUser(req.user!.id);

  res.status(200).json({
    success: true,
    data: { hours, remaining: Math.max(0, 10 - hours) },
  });
});

// ─────────────────────────────────────────────
// GET /api/v1/logs/projects/summary  [Admin]
// Total hours per project
// ─────────────────────────────────────────────

export const getProjectHoursSummary = asyncHandler(
  async (_req: IAuthRequest, res: Response) => {
    const summary = await workLogService.getProjectHoursSummary();

    res.status(200).json({
      success: true,
      data: summary,
    });
  }
);

// ─────────────────────────────────────────────
// GET /api/v1/logs/my/project/:projectId/today [Protected]
// ─────────────────────────────────────────────

export const getMyProjectTodayHours = asyncHandler(
  async (req: IAuthRequest, res: Response) => {
    const { projectId } = req.params;
    const hours = await workLogService.getProjectHoursForUserToday(req.user!.id, projectId);

    res.status(200).json({
      success: true,
      data: hours,
    });
  }
);

// ─────────────────────────────────────────────
// GET /api/v1/logs/admin/breakdown     [Admin]
// ─────────────────────────────────────────────

export const getAdminProjectBreakdown = asyncHandler(
  async (_req: IAuthRequest, res: Response) => {
    const breakdown = await workLogService.getAdminProjectUserBreakdown();

    res.status(200).json({
      success: true,
      data: breakdown,
    });
  }
);
