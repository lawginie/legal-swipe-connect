import { Router, Request, Response } from 'express';
import { Swipe, Match, Service, Lawyer, User } from '../models';
import { authenticate } from '../middleware/auth';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

const router = Router();

// Create a swipe
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { targetId, targetType, action } = req.body;

    // Validate input
    if (!targetId || !targetType || !action) {
      return res.status(400).json({ 
        error: 'targetId, targetType, and action are required' 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ error: 'Invalid target ID' });
    }

    if (!['service', 'lawyer'].includes(targetType)) {
      return res.status(400).json({ 
        error: 'targetType must be either "service" or "lawyer"' 
      });
    }

    if (!['like', 'dislike', 'super_like'].includes(action)) {
      return res.status(400).json({ 
        error: 'action must be "like", "dislike", or "super_like"' 
      });
    }

    // Check if user already swiped on this target
    const existingSwipe = await Swipe.findOne({
      userId,
      targetId,
      targetType
    });

    if (existingSwipe) {
      return res.status(400).json({ 
        error: 'You have already swiped on this target' 
      });
    }

    // Verify target exists
    let target;
    if (targetType === 'service') {
      target = await Service.findById(targetId);
    } else {
      target = await Lawyer.findById(targetId);
    }

    if (!target) {
      return res.status(404).json({ error: 'Target not found' });
    }

    // Create swipe
    const swipe = new Swipe({
      userId,
      targetId,
      targetType,
      action
    });

    await swipe.save();

    // Check for match if it's a like or super_like
    let match = null;
    if (action === 'like' || action === 'super_like') {
      match = await checkForMatch(userId, targetId, targetType);
    }

    logger.info(`User ${userId} swiped ${action} on ${targetType} ${targetId}`);
    
    res.status(201).json({
      swipe,
      match: match ? {
        id: match._id,
        matched: true,
        matchedAt: match.matchedAt
      } : null
    });
  } catch (error) {
    logger.error('Error creating swipe:', error);
    if (error instanceof Error && error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's swipe history
router.get('/history', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 20, action, targetType } = req.query;

    const query: Record<string, string | object> = { userId };
    
    if (action) {
      query.action = action;
    }
    
    if (targetType) {
      query.targetType = targetType;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [swipes, total] = await Promise.all([
      Swipe.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Swipe.countDocuments(query)
    ]);

    // Populate target details
    const populatedSwipes = await Promise.all(
      swipes.map(async (swipe) => {
        let targetDetails = null;
        
        if (swipe.targetType === 'service') {
          targetDetails = await Service.findById(swipe.targetId)
            .populate({
              path: 'lawyerId',
              populate: {
                path: 'userId',
                select: 'firstName lastName profilePicture'
              }
            })
            .select('title description category price images')
            .lean();
        } else if (swipe.targetType === 'lawyer') {
          targetDetails = await Lawyer.findById(swipe.targetId)
            .populate('userId', 'firstName lastName profilePicture')
            .select('specializations rating hourlyRate')
            .lean();
        }

        return {
          ...swipe,
          targetDetails
        };
      })
    );

    res.json({
      swipes: populatedSwipes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Error fetching swipe history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get swipe recommendations
router.get('/recommendations', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { type = 'service', limit = 10, location } = req.query;

    // Get user's previous swipes to exclude
    const swipedTargets = await Swipe.find({ userId })
      .distinct('targetId');

    let recommendations = [];

    if (type === 'service') {
      const query: Record<string, boolean | object> = {
        _id: { $nin: swipedTargets },
        isActive: true
      };

      const aggregationPipeline: Record<string, object>[] = [
        { $match: query },
        {
          $lookup: {
            from: 'lawyers',
            localField: 'lawyerId',
            foreignField: '_id',
            as: 'lawyer'
          }
        },
        { $unwind: '$lawyer' },
        {
          $lookup: {
            from: 'users',
            localField: 'lawyer.userId',
            foreignField: '_id',
            as: 'lawyer.user'
          }
        },
        { $unwind: '$lawyer.user' }
      ];

      // Location-based recommendations
      if (location) {
        const [lat, lng] = location.toString().split(',').map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
          aggregationPipeline.push({
            $addFields: {
              distance: {
                $sqrt: {
                  $add: [
                    { $pow: [{ $subtract: ['$lawyer.user.location.coordinates.0', lng] }, 2] },
                    { $pow: [{ $subtract: ['$lawyer.user.location.coordinates.1', lat] }, 2] }
                  ]
                }
              }
            }
          });
          aggregationPipeline.push({ $sort: { distance: 1, rating: -1 } });
        }
      } else {
        aggregationPipeline.push({ $sort: { rating: -1, createdAt: -1 } });
      }

      aggregationPipeline.push(
        { $limit: Number(limit) },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            category: 1,
            price: 1,
            duration: 1,
            deliverables: 1,
            tags: 1,
            images: 1,
            rating: 1,
            reviews: 1,
            location: 1,
            lawyer: {
              _id: 1,
              specializations: 1,
              rating: 1,
              responseTime: 1,
              user: {
                firstName: 1,
                lastName: 1,
                profilePicture: 1,
                location: 1,
                isVerified: 1
              }
            },
            distance: 1
          }
        }
      );

      recommendations = await Service.aggregate(aggregationPipeline);
    } else if (type === 'lawyer') {
      const query: Record<string, boolean | object> = {
        _id: { $nin: swipedTargets },
        isVerifiedLawyer: true,
        acceptsNewClients: true
      };

      const aggregationPipeline: Record<string, object>[] = [
        { $match: query },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' }
      ];

      // Location-based recommendations
      if (location) {
        const [lat, lng] = location.toString().split(',').map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
          aggregationPipeline.push({
            $addFields: {
              distance: {
                $sqrt: {
                  $add: [
                    { $pow: [{ $subtract: ['$user.location.coordinates.0', lng] }, 2] },
                    { $pow: [{ $subtract: ['$user.location.coordinates.1', lat] }, 2] }
                  ]
                }
              }
            }
          });
          aggregationPipeline.push({ $sort: { distance: 1, rating: -1 } });
        }
      } else {
        aggregationPipeline.push({ $sort: { rating: -1, createdAt: -1 } });
      }

      aggregationPipeline.push(
        { $limit: Number(limit) },
        {
          $project: {
            _id: 1,
            specializations: 1,
            experience: 1,
            hourlyRate: 1,
            rating: 1,
            consultationFee: 1,
            responseTime: 1,
            practiceAreas: 1,
            firmName: 1,
            yearsOfPractice: 1,
            languages: 1,
            user: {
              firstName: 1,
              lastName: 1,
              profilePicture: 1,
              location: 1,
              isVerified: 1
            },
            distance: 1
          }
        }
      );

      recommendations = await Lawyer.aggregate(aggregationPipeline);
    }

    res.json({
      recommendations,
      type,
      count: recommendations.length
    });
  } catch (error) {
    logger.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get swipe statistics
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const stats = await Swipe.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      likes: 0,
      dislikes: 0,
      superLikes: 0,
      total: 0
    };

    stats.forEach(stat => {
      switch (stat._id) {
        case 'like':
          formattedStats.likes = stat.count;
          break;
        case 'dislike':
          formattedStats.dislikes = stat.count;
          break;
        case 'super_like':
          formattedStats.superLikes = stat.count;
          break;
      }
      formattedStats.total += stat.count;
    });

    // Get match count
    const matchCount = await Match.countDocuments({
      $or: [
        { clientId: userId },
        { lawyerId: userId }
      ],
      status: 'active'
    });

    res.json({
      swipes: formattedStats,
      matches: matchCount
    });
  } catch (error) {
    logger.error('Error fetching swipe stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to check for matches
async function checkForMatch(userId: string, targetId: string, targetType: string): Promise<object | null> {
  try {
    if (targetType === 'service') {
      // For services, create a match with the lawyer who owns the service
      const service = await Service.findById(targetId).populate('lawyerId');
      if (!service) return null;

      const lawyerId = service.lawyerId._id;

      // Check if match already exists
      const existingMatch = await Match.findOne({
        clientId: userId,
        lawyerId: lawyerId,
        serviceId: targetId
      });

      if (existingMatch) return existingMatch;

      // Create new match
      const match = new Match({
        clientId: userId,
        lawyerId: lawyerId,
        serviceId: targetId,
        status: 'pending',
        matchedAt: new Date(),
        compatibility: {
          score: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
          factors: ['service_interest', 'location_proximity']
        }
      });

      await match.save();
      return match;
    } else if (targetType === 'lawyer') {
      // For lawyers, create a general match
      const existingMatch = await Match.findOne({
        clientId: userId,
        lawyerId: targetId
      });

      if (existingMatch) return existingMatch;

      const match = new Match({
        clientId: userId,
        lawyerId: targetId,
        status: 'pending',
        matchedAt: new Date(),
        compatibility: {
          score: Math.floor(Math.random() * 30) + 70,
          factors: ['profile_compatibility', 'location_proximity']
        }
      });

      await match.save();
      return match;
    }

    return null;
  } catch (error) {
    logger.error('Error checking for match:', error);
    return null;
  }
}

export default router;