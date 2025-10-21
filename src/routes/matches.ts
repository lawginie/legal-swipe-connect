import { Router, Request, Response } from 'express';
import { Match, Chat, User, Lawyer, Service } from '../models';
import { authenticate } from '../middleware/auth';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

const router = Router();

// Get user's matches
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 20, status = 'active' } = req.query;

    const query: Record<string, string | boolean | object> = {
      $or: [
        { clientId: userId },
        { lawyerId: userId }
      ],
      isActive: true
    };

    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [matches, total] = await Promise.all([
      Match.find(query)
        .populate({
          path: 'clientId',
          select: 'firstName lastName profilePicture location userType isVerified'
        })
        .populate({
          path: 'lawyerId',
          select: 'specializations rating hourlyRate responseTime',
          populate: {
            path: 'userId',
            select: 'firstName lastName profilePicture location isVerified'
          }
        })
        .populate({
          path: 'serviceId',
          select: 'title description category price images'
        })
        .sort({ matchedAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Match.countDocuments(query)
    ]);

    // Add role information for each match
    const matchesWithRole = matches.map(match => ({
      ...match,
      userRole: match.clientId._id.toString() === userId ? 'client' : 'lawyer',
      otherUser: match.clientId._id.toString() === userId ? match.lawyerId : match.clientId
    }));

    res.json({
      matches: matchesWithRole,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get match by ID
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid match ID' });
    }

    const match = await Match.findOne({
      _id: id,
      $or: [
        { clientId: userId },
        { lawyerId: userId }
      ]
    })
      .populate({
        path: 'clientId',
        select: 'firstName lastName profilePicture location userType isVerified'
      })
      .populate({
        path: 'lawyerId',
        select: 'specializations rating hourlyRate responseTime firmName',
        populate: {
          path: 'userId',
          select: 'firstName lastName profilePicture location isVerified'
        }
      })
      .populate({
        path: 'serviceId',
        select: 'title description category price duration deliverables images'
      })
      .lean();

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Add role information
    const matchWithRole = {
      ...match,
      userRole: match.clientId._id.toString() === userId ? 'client' : 'lawyer',
      otherUser: match.clientId._id.toString() === userId ? match.lawyerId : match.clientId
    };

    res.json(matchWithRole);
  } catch (error) {
    logger.error('Error fetching match:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Accept a match
router.patch('/:id/accept', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid match ID' });
    }

    const match = await Match.findOne({
      _id: id,
      $or: [
        { clientId: userId },
        { lawyerId: userId }
      ],
      status: 'pending'
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found or already processed' });
    }

    // Update match status
    match.status = 'active';
    match.lastActivity = new Date();
    await match.save();

    // Create chat if it doesn't exist
    let chat = await Chat.findOne({ matchId: match._id });
    if (!chat) {
      chat = new Chat({
        matchId: match._id,
        participants: [match.clientId, match.lawyerId],
        settings: {
          notifications: true,
          encryption: true
        }
      });
      await chat.save();
      
      // Update match with chat ID
      match.chatId = chat._id;
      await match.save();
    }

    logger.info(`Match ${id} accepted by user ${userId}`);
    res.json({ 
      message: 'Match accepted successfully',
      match: {
        id: match._id,
        status: match.status,
        chatId: chat._id
      }
    });
  } catch (error) {
    logger.error('Error accepting match:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Decline a match
router.patch('/:id/decline', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid match ID' });
    }

    const match = await Match.findOne({
      _id: id,
      $or: [
        { clientId: userId },
        { lawyerId: userId }
      ],
      status: 'pending'
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found or already processed' });
    }

    // Update match status
    match.status = 'declined';
    match.lastActivity = new Date();
    await match.save();

    logger.info(`Match ${id} declined by user ${userId}`);
    res.json({ 
      message: 'Match declined successfully',
      match: {
        id: match._id,
        status: match.status
      }
    });
  } catch (error) {
    logger.error('Error declining match:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Archive a match
router.patch('/:id/archive', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid match ID' });
    }

    const match = await Match.findOne({
      _id: id,
      $or: [
        { clientId: userId },
        { lawyerId: userId }
      ]
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Update match status
    match.isActive = false;
    match.lastActivity = new Date();
    await match.save();

    logger.info(`Match ${id} archived by user ${userId}`);
    res.json({ 
      message: 'Match archived successfully',
      match: {
        id: match._id,
        isActive: match.isActive
      }
    });
  } catch (error) {
    logger.error('Error archiving match:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Rate a match
router.post('/:id/rate', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { rating, feedback } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid match ID' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const match = await Match.findOne({
      _id: id,
      $or: [
        { clientId: userId },
        { lawyerId: userId }
      ],
      status: 'active'
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found or not active' });
    }

    // Determine who is rating whom
    const isClient = match.clientId.toString() === userId;
    const ratingField = isClient ? 'ratings.clientRating' : 'ratings.lawyerRating';
    const feedbackField = isClient ? 'feedback.clientFeedback' : 'feedback.lawyerFeedback';

    // Check if user already rated
    const existingRating = isClient ? match.ratings?.clientRating : match.ratings?.lawyerRating;
    if (existingRating) {
      return res.status(400).json({ error: 'You have already rated this match' });
    }

    // Update match with rating
    const updateData: Record<string, object | Date> = {
      [ratingField]: {
        rating,
        ratedAt: new Date()
      },
      lastActivity: new Date()
    };

    if (feedback) {
      updateData[feedbackField] = feedback;
    }

    await Match.findByIdAndUpdate(id, { $set: updateData });

    // Update lawyer's overall rating if client rated
    if (isClient) {
      await updateLawyerRating(match.lawyerId, rating);
    }

    logger.info(`Match ${id} rated by user ${userId}`);
    res.json({ 
      message: 'Rating submitted successfully',
      rating: {
        value: rating,
        feedback: feedback || null
      }
    });
  } catch (error) {
    logger.error('Error rating match:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get match statistics
router.get('/stats/overview', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const stats = await Match.aggregate([
      {
        $match: {
          $or: [
            { clientId: new mongoose.Types.ObjectId(userId) },
            { lawyerId: new mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      pending: 0,
      active: 0,
      declined: 0,
      completed: 0,
      total: 0
    };

    stats.forEach(stat => {
      if (Object.prototype.hasOwnProperty.call(formattedStats, stat._id)) {
        formattedStats[stat._id as keyof typeof formattedStats] = stat.count;
      }
      formattedStats.total += stat.count;
    });

    // Get recent matches
    const recentMatches = await Match.find({
      $or: [
        { clientId: userId },
        { lawyerId: userId }
      ],
      isActive: true
    })
      .populate('clientId', 'firstName lastName profilePicture')
      .populate({
        path: 'lawyerId',
        populate: {
          path: 'userId',
          select: 'firstName lastName profilePicture'
        }
      })
      .sort({ matchedAt: -1 })
      .limit(5)
      .lean();

    res.json({
      stats: formattedStats,
      recentMatches
    });
  } catch (error) {
    logger.error('Error fetching match stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to update lawyer's overall rating
async function updateLawyerRating(lawyerId: string, newRating: number): Promise<void> {
  try {
    const lawyer = await Lawyer.findById(lawyerId);
    if (!lawyer) return;

    // Get all ratings for this lawyer
    const matches = await Match.find({
      lawyerId,
      'ratings.clientRating.rating': { $exists: true }
    });

    if (matches.length === 0) return;

    // Calculate new average rating
    const totalRating = matches.reduce((sum, match) => {
      return sum + (match.ratings?.clientRating?.rating || 0);
    }, 0);

    const averageRating = totalRating / matches.length;

    // Update lawyer's rating
    lawyer.rating = Math.round(averageRating * 10) / 10; // Round to 1 decimal place
    await lawyer.save();

    logger.info(`Updated lawyer ${lawyerId} rating to ${lawyer.rating}`);
  } catch (error) {
    logger.error('Error updating lawyer rating:', error);
  }
}

export default router;