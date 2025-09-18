import { Router } from 'express';
import { z } from 'zod';
import { PlayerModel } from '../models';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import { uploadSingle } from '../middleware/upload';

const router = Router();

const playerSchema = z.object({
  name: z.string().min(1),
  jersey_number: z.number().optional(),
  role: z.string().min(1),
  batting_style: z.string().optional(),
  bowling_style: z.string().optional(),
  bio: z.string().optional(),
  date_of_birth: z.string().optional(),
  nationality: z.string().default('India'),
  is_active: z.boolean().default(true),
  position: z.string().optional()
});

router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const players = await PlayerModel.getAll(limit, offset);

    res.json({
      success: true,
      data: players
    });
  } catch (error) {
    console.error('Get players error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch players'
    });
  }
});

router.get('/top-batsmen', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const players = PlayerModel.getTopBatsmen(limit);

    res.json({
      success: true,
      data: players
    });
  } catch (error) {
    console.error('Get top batsmen error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top batsmen'
    });
  }
});

router.get('/top-bowlers', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const players = PlayerModel.getTopBowlers(limit);

    res.json({
      success: true,
      data: players
    });
  } catch (error) {
    console.error('Get top bowlers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top bowlers'
    });
  }
});

router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const player = PlayerModel.getById(id);

    if (!player) {
      return res.status(404).json({
        success: false,
        error: 'Player not found'
      });
    }

    res.json({
      success: true,
      data: player
    });
  } catch (error) {
    console.error('Get player error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch player'
    });
  }
});

router.post('/', authenticateToken, requireAdmin, uploadSingle('playerPhoto'), (req: AuthRequest, res) => {
  try {
    let playerData = playerSchema.parse(req.body);

    if (req.file) {
      playerData = {
        ...playerData,
        photo_url: `/uploads/players/${req.file.filename}`
      } as any;
    }

    if (playerData.jersey_number) {
      const existingPlayer = PlayerModel.getByJerseyNumber(playerData.jersey_number);
      if (existingPlayer) {
        return res.status(400).json({
          success: false,
          error: 'Jersey number already taken'
        });
      }
    }

    const player = PlayerModel.create(playerData as any);

    res.status(201).json({
      success: true,
      data: player
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        details: error.errors
      });
    }

    console.error('Create player error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create player'
    });
  }
});

router.put('/:id', authenticateToken, requireAdmin, uploadSingle('playerPhoto'), (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    let updateData = req.body;

    if (req.file) {
      updateData.photo_url = `/uploads/players/${req.file.filename}`;
    }

    if (updateData.jersey_number) {
      const existingPlayer = PlayerModel.getByJerseyNumber(updateData.jersey_number);
      if (existingPlayer && existingPlayer.id !== id) {
        return res.status(400).json({
          success: false,
          error: 'Jersey number already taken'
        });
      }
    }

    const player = PlayerModel.update(id, updateData);

    if (!player) {
      return res.status(404).json({
        success: false,
        error: 'Player not found'
      });
    }

    res.json({
      success: true,
      data: player
    });
  } catch (error) {
    console.error('Update player error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update player'
    });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = PlayerModel.delete(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Player not found'
      });
    }

    res.json({
      success: true,
      message: 'Player deleted successfully'
    });
  } catch (error) {
    console.error('Delete player error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete player'
    });
  }
});

export default router;