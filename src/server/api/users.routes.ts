import { Router, Request, Response } from 'express';
import { User } from '../models/User.model';
import { logger } from '../../utils/logger';

const router = Router();

// POST /api/users - Create or update user
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      email,
      fullName,
      userType,
      walletAddress,
      profileImageUrl
    } = req.body;

    if (!userId || !fullName || !userType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Upsert user
    const user = await User.findOneAndUpdate(
      { userId },
      {
        userId,
        email,
        fullName,
        userType,
        walletAddress,
        profileImageUrl,
        lastActive: new Date()
      },
      { upsert: true, new: true }
    );

    logger.info('User created/updated', {
      action: 'user_upsert',
      metadata: { userId, userType }
    });

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error: any) {
    logger.error('Error creating/updating user:', {
      action: 'user_upsert_error',
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to create/update user'
    });
  }
});

// GET /api/users/:userId - Get user by ID
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    res.json({
      success: true,
      data: user
    });
  } catch (error: any) {
    logger.error('Error fetching user:', {
      action: 'user_fetch_error',
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
});

// GET /api/users/wallet/:address - Get user by wallet address
router.get('/wallet/:address', async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ walletAddress: req.params.address });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error: any) {
    logger.error('Error fetching user by wallet:', {
      action: 'user_wallet_fetch_error',
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
});

export default router;
