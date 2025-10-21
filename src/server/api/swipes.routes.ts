import { Router, Request, Response } from 'express';
import { Swipe } from '../models/Swipe.model';
import { Match } from '../models/Match.model';
import { logger } from '../../utils/logger';

const router = Router();

// POST /api/swipes - Record a swipe
router.post('/', async (req: Request, res: Response) => {
  try {
    const { clientId, lawyerId, swipedRight } = req.body;

    if (!clientId || !lawyerId || typeof swipedRight !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Check if swipe already exists
    const existingSwipe = await Swipe.findOne({ clientId, lawyerId });
    
    if (existingSwipe) {
      return res.status(409).json({
        success: false,
        error: 'Already swiped on this lawyer'
      });
    }

    // Create the swipe
    const swipe = await Swipe.create({
      clientId,
      lawyerId,
      swipedRight
    });

    // If it's a right swipe, check if lawyer also swiped right (for mutual matching)
    // For now, we'll auto-match for system profiles
    let match = null;
    if (swipedRight) {
      match = await Match.create({
        clientId,
        lawyerId
      });

      logger.info('Match created', {
        action: 'match_created',
        metadata: { clientId, lawyerId }
      });
    }

    logger.info('Swipe recorded', {
      action: 'swipe_recorded',
      metadata: { clientId, lawyerId, swipedRight, matched: !!match }
    });

    res.status(201).json({
      success: true,
      data: {
        swipe,
        match
      }
    });
  } catch (error: any) {
    logger.error('Error recording swipe:', {
      action: 'swipe_error',
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to record swipe'
    });
  }
});

// GET /api/swipes/:clientId - Get all swipes for a client
router.get('/:clientId', async (req: Request, res: Response) => {
  try {
    const swipes = await Swipe.find({ 
      clientId: req.params.clientId 
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: swipes
    });
  } catch (error: any) {
    logger.error('Error fetching swipes:', {
      action: 'swipes_fetch_error',
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch swipes'
    });
  }
});

export default router;
