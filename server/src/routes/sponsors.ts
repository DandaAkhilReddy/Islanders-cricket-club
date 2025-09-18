import { Router } from 'express';
import { SponsorModel } from '../models';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import { uploadSingle } from '../middleware/upload';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const sponsors = await SponsorModel.getAll();

    res.json({
      success: true,
      data: sponsors
    });
  } catch (error) {
    console.error('Get sponsors error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sponsors'
    });
  }
});

router.post('/', authenticateToken, requireAdmin, uploadSingle('sponsorLogo'), async (req: AuthRequest, res) => {
  try {
    let sponsorData = req.body;

    if (req.file) {
      sponsorData.logo_url = `/uploads/sponsors/${req.file.filename}`;
    }

    const sponsor = await SponsorModel.create(sponsorData);

    res.status(201).json({
      success: true,
      data: sponsor
    });
  } catch (error) {
    console.error('Create sponsor error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create sponsor'
    });
  }
});

export default router;