import { Router } from 'express';
import { LeadershipModel } from '../models';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import { uploadSingle } from '../middleware/upload';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const leadership = await LeadershipModel.getAll();

    res.json({
      success: true,
      data: leadership
    });
  } catch (error) {
    console.error('Get leadership error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leadership'
    });
  }
});

router.post('/', authenticateToken, requireAdmin, uploadSingle('leadershipPhoto'), async (req: AuthRequest, res) => {
  try {
    let leadershipData = req.body;

    if (req.file) {
      leadershipData.photo_url = `/uploads/leadership/${req.file.filename}`;
    }

    const leader = await LeadershipModel.create(leadershipData);

    res.status(201).json({
      success: true,
      data: leader
    });
  } catch (error) {
    console.error('Create leadership error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create leadership entry'
    });
  }
});

export default router;