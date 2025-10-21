import { Router, Request, Response } from 'express';
import { UserActivity } from '../models/UserActivity.model';
import { logger } from '../../utils/logger';

const router = Router();

// POST /api/activity - Record user activity
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      activityType,
      targetId,
      metadata,
      sessionId
    } = req.body;

    if (!userId || !activityType) {
      return res.status(400).json({
        success: false,
        error: 'userId and activityType are required'
      });
    }

    const activity = await UserActivity.create({
      userId,
      activityType,
      targetId,
      metadata,
      sessionId,
      timestamp: new Date()
    });

    res.status(201).json({
      success: true,
      data: activity
    });
  } catch (error: any) {
    logger.error('Error recording activity:', {
      action: 'activity_record_error',
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to record activity'
    });
  }
});

// GET /api/activity/:userId - Get user activity history
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { activityType, limit = 50, page = 1 } = req.query;

    const query: any = { userId: req.params.userId };
    
    if (activityType) {
      query.activityType = activityType;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const activities = await UserActivity.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));

    const total = await UserActivity.countDocuments(query);

    res.json({
      success: true,
      data: activities,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error: any) {
    logger.error('Error fetching activity:', {
      action: 'activity_fetch_error',
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch activity'
    });
  }
});

// GET /api/activity/:userId/stats - Get activity statistics
router.get('/:userId/stats', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const query: any = { userId: req.params.userId };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate as string);
      if (endDate) query.timestamp.$lte = new Date(endDate as string);
    }

    const stats = await UserActivity.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = stats.reduce((acc: any, stat: any) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: formattedStats
    });
  } catch (error: any) {
    logger.error('Error fetching activity stats:', {
      action: 'activity_stats_error',
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

// DELETE /api/activity/:userId - Clear user activity (admin/user request)
router.delete('/:userId', async (req: Request, res: Response) => {
  try {
    const { olderThan } = req.query;

    const query: any = { userId: req.params.userId };

    if (olderThan) {
      query.timestamp = { $lt: new Date(olderThan as string) };
    }

    const result = await UserActivity.deleteMany(query);

    logger.info('User activity cleared', {
      action: 'activity_cleared',
      metadata: { userId: req.params.userId, count: result.deletedCount }
    });

    res.json({
      success: true,
      message: `${result.deletedCount} activities deleted`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear activity'
    });
  }
});

export default router;
