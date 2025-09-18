import { Router } from 'express';
import { z } from 'zod';
import { MatchModel, PlayerMatchStatsModel } from '../models';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

const matchSchema = z.object({
  date: z.string(),
  opponent: z.string().min(1),
  venue: z.string().min(1),
  match_type: z.string().default('League'),
  result: z.string().optional(),
  our_score: z.string().optional(),
  opponent_score: z.string().optional(),
  man_of_match: z.number().optional(),
  description: z.string().optional(),
  is_home: z.boolean().default(true),
  status: z.string().default('completed')
});

const playerStatsSchema = z.object({
  player_id: z.number(),
  batting_runs: z.number().default(0),
  batting_balls: z.number().default(0),
  batting_fours: z.number().default(0),
  batting_sixes: z.number().default(0),
  batting_how_out: z.string().optional(),
  bowling_overs: z.number().default(0),
  bowling_runs: z.number().default(0),
  bowling_wickets: z.number().default(0),
  bowling_maidens: z.number().default(0),
  fielding_catches: z.number().default(0),
  fielding_stumpings: z.number().default(0)
});

router.get('/', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const matches = MatchModel.getAll(limit, offset);

    res.json({
      success: true,
      data: matches
    });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch matches'
    });
  }
});

router.get('/recent', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const matches = MatchModel.getRecent(limit);

    res.json({
      success: true,
      data: matches
    });
  } catch (error) {
    console.error('Get recent matches error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent matches'
    });
  }
});

router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const match = MatchModel.getById(id);

    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Match not found'
      });
    }

    res.json({
      success: true,
      data: match
    });
  } catch (error) {
    console.error('Get match error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch match'
    });
  }
});

router.get('/:id/stats', (req, res) => {
  try {
    const matchId = parseInt(req.params.id);
    const stats = PlayerMatchStatsModel.getByMatch(matchId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get match stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch match statistics'
    });
  }
});

router.post('/', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  try {
    const matchData = matchSchema.parse(req.body);
    const match = MatchModel.create(matchData);

    res.status(201).json({
      success: true,
      data: match
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        details: error.errors
      });
    }

    console.error('Create match error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create match'
    });
  }
});

router.post('/:id/stats', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  try {
    const matchId = parseInt(req.params.id);
    const statsData = playerStatsSchema.parse(req.body);
    
    const stats = PlayerMatchStatsModel.create({
      ...statsData,
      match_id: matchId
    });

    res.status(201).json({
      success: true,
      data: stats
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        details: error.errors
      });
    }

    console.error('Create player stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create player statistics'
    });
  }
});

router.put('/:id', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const updateData = req.body;

    const match = MatchModel.update(id, updateData);

    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Match not found'
      });
    }

    res.json({
      success: true,
      data: match
    });
  } catch (error) {
    console.error('Update match error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update match'
    });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = MatchModel.delete(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Match not found'
      });
    }

    res.json({
      success: true,
      message: 'Match deleted successfully'
    });
  } catch (error) {
    console.error('Delete match error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete match'
    });
  }
});

export default router;