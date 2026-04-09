import { Request, Response, NextFunction } from 'express';
import Event from '../models/event.model';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/error.middleware';
import fs from 'fs';
import path from 'path';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import s3Client from '../config/s3';

// Helper to generate slug
const generateSlug = (name: string) => {
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
export const createEvent = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { name, info } = req.body;

  if (!name) {
    return next(new AppError('Event name is required', 400));
  }

  // Handle uploaded images
  const images: string[] = [];
  if (req.files && Array.isArray(req.files)) {
    (req.files as any[]).forEach((file) => {
      // Store S3 location URL
      images.push(file.location);
    });
  }

  const slug = generateSlug(name);

  // Check if slug exists
  const existingEvent = await Event.findOne({ slug });
  const finalSlug = existingEvent ? `${slug}-${Date.now()}` : slug;

  const event = await Event.create({
    name,
    info,
    slug: finalSlug,
    images,
    createdBy: (req as any).user.id,
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
export const getAllEvents = asyncHandler(async (_req: Request, res: Response) => {
  const events = await Event.find().sort({ createdAt: -1 }).populate('createdBy', 'name');

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
export const getEvent = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const event = await Event.findById(req.params.id).populate('createdBy', 'name');

  if (!event) {
    return next(new AppError('Event not found', 404));
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
export const updateEvent = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { name, info, removeImages } = req.body;
  
  let event = await Event.findById(req.params.id);

  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  // Handle name change and slug update
  if (name && name !== event.name) {
    event.name = name;
    const slug = generateSlug(name);
    const existingEvent = await Event.findOne({ slug, _id: { $ne: event._id } });
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
          await s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key
          }));
        }
      } catch (err) {
        console.error('Error deleting image from S3:', err);
      }
    }

    event.images = imagesToKeep;
  }

  // Handle new uploaded images
  if (req.files && Array.isArray(req.files)) {
    (req.files as any[]).forEach((file) => {
      event!.images.push(file.location);
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
export const deleteEvent = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  // Delete images from S3
  for (const imgUrl of event.images) {
    try {
      const key = imgUrl.split('.com/').pop();
      if (key) {
        await s3Client.send(new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: key
        }));
      }
    } catch (err) {
      console.error('Error deleting image from S3:', err);
    }
  }

  await event.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Event deleted successfully',
  });
});
