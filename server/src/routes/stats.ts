import { Router } from 'express';
import { PlayerMatchStatsModel } from '../models';

const router = Router();

router.get('/player/:playerId', (req, res) => {
  try {
    const playerId = parseInt(req.params.playerId);
    const stats = PlayerMatchStatsModel.getByPlayer(playerId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get player stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch player statistics'
    });
  }
});

export default router;