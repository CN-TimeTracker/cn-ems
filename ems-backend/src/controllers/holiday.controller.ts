import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import Holiday from '../models/Holiday.model';

/**
 * GET /api/v1/holidays
 * Get all public holidays
 */
export const getAllHolidays = asyncHandler(async (req: Request, res: Response) => {
  const holidays = await Holiday.find().sort({ date: 1 });
  res.status(200).json({
    success: true,
    count: holidays.length,
    data: holidays,
  });
});

/**
 * POST /api/v1/holidays
 * Add a new public holiday [Admin Only]
 */
export const addHoliday = asyncHandler(async (req: Request, res: Response) => {
  const { date, name } = req.body;

  if (!date || !name) {
    throw new Error('Please provide both date and name for the holiday');
  }

  // Normalize date to midnight UTC
  const holidayDate = new Date(date);
  holidayDate.setUTCHours(0, 0, 0, 0);

  const holiday = await Holiday.create({
    date: holidayDate,
    name,
  });

  res.status(201).json({
    success: true,
    message: 'Holiday added successfully',
    data: holiday,
  });
});

/**
 * DELETE /api/v1/holidays/:id
 * Remove a public holiday [Admin Only]
 */
export const deleteHoliday = asyncHandler(async (req: Request, res: Response) => {
  const holiday = await Holiday.findByIdAndDelete(req.params.id);

  if (!holiday) {
    throw new Error('Holiday not found');
  }

  res.status(200).json({
    success: true,
    message: 'Holiday removed successfully',
  });
});
