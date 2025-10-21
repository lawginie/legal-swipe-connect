import { Router, Request, Response } from 'express';
import { Lawyer } from '../models/Lawyer.model';
import { logger } from '../../utils/logger';

const router = Router();

// GET /api/lawyers - Get all lawyers with optional filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const { specialization, location, minRating, page = 1, limit = 20 } = req.query;
    
    const query: any = {};
    
    if (specialization) {
      query.specialization = specialization;
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating as string) };
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const lawyers = await Lawyer.find(query)
      .sort({ rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));
    
    const total = await Lawyer.countDocuments(query);

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    
    logger.info('Lawyers fetched', {
      action: 'lawyers_fetched',
      metadata: { 
        count: lawyers.length, 
        total: total, 
        page: pageNum, 
        limit: limitNum 
      }
    });

    res.json({
      success: true,
      data: lawyers,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error: any) {
    logger.error('Error fetching lawyers:', {
      action: 'lawyers_fetch_error',
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lawyers'
    });
  }
});

// GET /api/lawyers/:id - Get single lawyer by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const lawyer = await Lawyer.findOne({ profileId: req.params.id });
    
    if (!lawyer) {
      return res.status(404).json({
        success: false,
        error: 'Lawyer not found'
      });
    }

    logger.info('Lawyer profile fetched', {
      action: 'lawyer_profile_fetched',
      metadata: { profileId: req.params.id }
    });

    res.json({
      success: true,
      data: lawyer
    });
  } catch (error: any) {
    logger.error('Error fetching lawyer:', {
      action: 'lawyer_fetch_error',
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lawyer'
    });
  }
});

// GET /api/lawyers/specialization/:spec - Get lawyers by specialization
router.get('/specialization/:spec', async (req: Request, res: Response) => {
  try {
    const lawyers = await Lawyer.find({ 
      specialization: req.params.spec 
    }).sort({ rating: -1 });

    logger.info('Lawyers by specialization fetched', {
      action: 'lawyers_by_spec_fetched',
      metadata: { specialization: req.params.spec, count: lawyers.length }
    });

    res.json({
      success: true,
      data: lawyers
    });
  } catch (error: any) {
    logger.error('Error fetching lawyers by specialization:', {
      action: 'lawyers_by_spec_error',
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lawyers'
    });
  }
});

export default router;
