import { Router } from 'express';
import { z } from 'zod';
import { EventModel } from '../models';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import { uploadSingle, uploadMultiple } from '../middleware/upload';

const router = Router();

const eventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.string(),
  location: z.string().optional(),
  event_type: z.string().default('social')
});

router.get('/', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const events = EventModel.getAll(limit, offset);

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events'
    });
  }
});

router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const event = EventModel.getById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event'
    });
  }
});

router.post('/', authenticateToken, requireAdmin, uploadSingle('eventPhoto'), (req: AuthRequest, res) => {
  try {
    let eventData = eventSchema.parse(req.body);

    if (req.file) {
      eventData = {
        ...eventData,
        cover_image_url: `/uploads/events/${req.file.filename}`
      } as any;
    }

    const event = EventModel.create(eventData as any);

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        details: error.errors
      });
    }

    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create event'
    });
  }
});

router.put('/:id', authenticateToken, requireAdmin, uploadSingle('eventPhoto'), (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    let updateData = req.body;

    if (req.file) {
      updateData.cover_image_url = `/uploads/events/${req.file.filename}`;
    }

    const event = EventModel.update(id, updateData);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update event'
    });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = EventModel.delete(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete event'
    });
  }
});

export default router;