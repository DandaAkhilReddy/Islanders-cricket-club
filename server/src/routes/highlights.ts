import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import { uploadSingle } from '../middleware/upload';

const router = Router();

const highlightSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  video_url: z.string().url(),
  match_id: z.number().optional()
});

router.get('/', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM highlights ORDER BY created_at DESC');
    const highlights = stmt.all();

    res.json({
      success: true,
      data: highlights
    });
  } catch (error) {
    console.error('Get highlights error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch highlights'
    });
  }
});

router.post('/', authenticateToken, requireAdmin, uploadSingle('highlight'), (req: AuthRequest, res) => {
  try {
    let highlightData = highlightSchema.parse(req.body);

    if (req.file) {
      highlightData = {
        ...highlightData,
        thumbnail_url: `/uploads/highlights/${req.file.filename}`
      } as any;
    }

    const stmt = db.prepare(`
      INSERT INTO highlights (title, description, video_url, thumbnail_url, match_id)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      highlightData.title,
      highlightData.description,
      highlightData.video_url,
      (highlightData as any).thumbnail_url,
      highlightData.match_id
    );

    const getStmt = db.prepare('SELECT * FROM highlights WHERE id = ?');
    const highlight = getStmt.get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      data: highlight
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        details: error.errors
      });
    }

    console.error('Create highlight error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create highlight'
    });
  }
});

export default router;