"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvent = exports.updateEvent = exports.getEvent = exports.getAllEvents = exports.createEvent = void 0;
const event_model_1 = __importDefault(require("../models/event.model"));
const asyncHandler_1 = require("../utils/asyncHandler");
const error_middleware_1 = require("../middleware/error.middleware");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_1 = __importDefault(require("../config/s3"));
// Helper to generate slug
const generateSlug = (name) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};
/**
 * @desc    Create new event
 * @route   POST /api/v1/events
 * @access  Private/Admin
 */
exports.createEvent = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const { name, info } = req.body;
    if (!name) {
        return next(new error_middleware_1.AppError('Event name is required', 400));
    }
    // Handle uploaded images
    const images = [];
    if (req.files && Array.isArray(req.files)) {
        req.files.forEach((file) => {
            // Store S3 location URL
            images.push(file.location);
        });
    }
    const slug = generateSlug(name);
    // Check if slug exists
    const existingEvent = await event_model_1.default.findOne({ slug });
    const finalSlug = existingEvent ? `${slug}-${Date.now()}` : slug;
    const event = await event_model_1.default.create({
        name,
        info,
        slug: finalSlug,
        images,
        createdBy: req.user.id,
    });
    res.status(201).json({
        success: true,
        data: event,
    });
});
/**
 * @desc    Get all events
 * @route   GET /api/v1/events
 * @access  Private
 */
exports.getAllEvents = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const events = await event_model_1.default.find().sort({ createdAt: -1 }).populate('createdBy', 'name');
    res.status(200).json({
        success: true,
        count: events.length,
        data: events,
    });
});
/**
 * @desc    Get single event
 * @route   GET /api/v1/events/:id
 * @access  Private
 */
exports.getEvent = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const event = await event_model_1.default.findById(req.params.id).populate('createdBy', 'name');
    if (!event) {
        return next(new error_middleware_1.AppError('Event not found', 404));
    }
    res.status(200).json({
        success: true,
        data: event,
    });
});
/**
 * @desc    Update event
 * @route   PATCH /api/v1/events/:id
 * @access  Private/Admin
 */
exports.updateEvent = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const { name, info, removeImages } = req.body;
    let event = await event_model_1.default.findById(req.params.id);
    if (!event) {
        return next(new error_middleware_1.AppError('Event not found', 404));
    }
    // Handle name change and slug update
    if (name && name !== event.name) {
        event.name = name;
        const slug = generateSlug(name);
        const existingEvent = await event_model_1.default.findOne({ slug, _id: { $ne: event._id } });
        event.slug = existingEvent ? `${slug}-${Date.now()}` : slug;
    }
    if (info !== undefined) {
        event.info = info;
    }
    // Handle image removals
    if (removeImages && Array.isArray(removeImages)) {
        const imagesToKeep = event.images.filter((img) => !removeImages.includes(img));
        // Delete from S3
        for (const imgUrl of removeImages) {
            try {
                const key = imgUrl.split('.com/').pop();
                if (key) {
                    await s3_1.default.send(new client_s3_1.DeleteObjectCommand({
                        Bucket: process.env.AWS_S3_BUCKET_NAME,
                        Key: key
                    }));
                }
            }
            catch (err) {
                console.error('Error deleting image from S3:', err);
            }
        }
        event.images = imagesToKeep;
    }
    // Handle new uploaded images
    if (req.files && Array.isArray(req.files)) {
        req.files.forEach((file) => {
            event.images.push(file.location);
        });
    }
    await event.save();
    res.status(200).json({
        success: true,
        data: event,
    });
});
/**
 * @desc    Delete event
 * @route   DELETE /api/v1/events/:id
 * @access  Private/Admin
 */
exports.deleteEvent = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const event = await event_model_1.default.findById(req.params.id);
    if (!event) {
        return next(new error_middleware_1.AppError('Event not found', 404));
    }
    // Delete images from S3
    for (const imgUrl of event.images) {
        try {
            const key = imgUrl.split('.com/').pop();
            if (key) {
                await s3_1.default.send(new client_s3_1.DeleteObjectCommand({
                    Bucket: process.env.AWS_S3_BUCKET_NAME,
                    Key: key
                }));
            }
        }
        catch (err) {
            console.error('Error deleting image from S3:', err);
        }
    }
    await event.deleteOne();
    res.status(200).json({
        success: true,
        message: 'Event deleted successfully',
    });
});
//# sourceMappingURL=event.controller.js.map