import { Router, Request, Response } from 'express';
import { Match } from '../models/Match.model';
import { Lawyer } from '../models/Lawyer.model';
import { logger } from '../../utils/logger';

const router = Router();

// GET /api/matches/:clientId - Get all matches for a client
router.get('/:clientId', async (req: Request, res: Response) => {
  try {
    const matches = await Match.find({ 
      clientId: req.params.clientId 
    }).sort({ createdAt: -1 });

    // Populate lawyer details
    const matchesWithLawyers = await Promise.all(
      matches.map(async (match) => {
        const lawyer = await Lawyer.findOne({ profileId: match.lawyerId });
        return {
          ...match.toObject(),
          lawyer
        };
      })
    );

    logger.info('Matches fetched', {
      action: 'matches_fetched',
      metadata: { clientId: req.params.clientId, count: matches.length }
    });

    res.json({
      success: true,
      data: matchesWithLawyers
    });
  } catch (error: any) {
    logger.error('Error fetching matches:', {
      action: 'matches_fetch_error',
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch matches'
    });
  }
});

// DELETE /api/matches/:matchId - Unmatch
router.delete('/:matchId', async (req: Request, res: Response) => {
  try {
    const match = await Match.findByIdAndDelete(req.params.matchId);

    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Match not found'
      });
    }

    logger.info('Match deleted', {
      action: 'match_deleted',
      metadata: { matchId: req.params.matchId }
    });

    res.json({
      success: true,
      message: 'Match deleted successfully'
    });
  } catch (error: any) {
    logger.error('Error deleting match:', {
      action: 'match_delete_error',
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to delete match'
    });
  }
});

export default router;
