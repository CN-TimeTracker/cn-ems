"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateHoliday = exports.deleteHoliday = exports.addHoliday = exports.getAllHolidays = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const Holiday_model_1 = __importDefault(require("../models/Holiday.model"));
/**
 * GET /api/v1/holidays
 * Get all public holidays
 */
exports.getAllHolidays = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const holidays = await Holiday_model_1.default.find().sort({ date: 1 });
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
exports.addHoliday = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { date, name } = req.body;
    if (!date || !name) {
        throw new Error('Please provide both date and name for the holiday');
    }
    // Normalize date to midnight UTC
    const holidayDate = new Date(date);
    holidayDate.setUTCHours(0, 0, 0, 0);
    const holiday = await Holiday_model_1.default.create({
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
exports.deleteHoliday = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const holiday = await Holiday_model_1.default.findByIdAndDelete(req.params.id);
    if (!holiday) {
        throw new Error('Holiday not found');
    }
    res.status(200).json({
        success: true,
        message: 'Holiday removed successfully',
    });
});
/**
 * PATCH /api/v1/holidays/:id
 * Update a public holiday [Admin Only]
 */
exports.updateHoliday = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { date, name } = req.body;
    const holiday = await Holiday_model_1.default.findById(req.params.id);
    if (!holiday) {
        throw new Error('Holiday not found');
    }
    if (date) {
        const holidayDate = new Date(date);
        holidayDate.setUTCHours(0, 0, 0, 0);
        holiday.date = holidayDate;
    }
    if (name) {
        holiday.name = name;
    }
    await holiday.save();
    res.status(200).json({
        success: true,
        message: 'Holiday updated successfully',
        data: holiday,
    });
});
//# sourceMappingURL=holiday.controller.js.map