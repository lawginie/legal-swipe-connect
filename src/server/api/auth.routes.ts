import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model';
import { logger } from '../../utils/logger';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// POST /api/auth/base-signin - Authenticate with Base Account
router.post('/base-signin', async (req: Request, res: Response) => {
  try {
    const {
      walletAddress,
      signature,
      message,
      fullName,
      userType
    } = req.body;

    if (!walletAddress || !signature) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address and signature are required'
      });
    }

    // Create or update user
    const userId = `base-${walletAddress.toLowerCase()}`;
    
    let user = await User.findOne({ userId });

    if (user) {
      // Update existing user
      user.walletAddress = walletAddress.toLowerCase();
      user.lastActive = new Date();
      if (fullName) user.fullName = fullName;
      await user.save();

      logger.info('User signed in with Base', {
        action: 'base_signin',
        metadata: { userId, returning: true }
      });
    } else {
      // Create new user
      user = await User.create({
        userId,
        walletAddress: walletAddress.toLowerCase(),
        fullName: fullName || `Base User ${walletAddress.slice(0, 6)}`,
        userType: userType || 'client',
        email: `${walletAddress.toLowerCase()}@base.account`,
        lastActive: new Date()
      });

      logger.info('New user created with Base', {
        action: 'base_signup',
        metadata: { userId, userType: user.userType }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.userId,
        walletAddress: user.walletAddress,
        userType: user.userType
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Create session record
    const session = {
      userId: user.userId,
      walletAddress: user.walletAddress,
      signature,
      message,
      loginTime: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };

    res.status(200).json({
      success: true,
      data: {
        user: {
          userId: user.userId,
          fullName: user.fullName,
          userType: user.userType,
          walletAddress: user.walletAddress,
          email: user.email,
          profileImageUrl: user.profileImageUrl,
          createdAt: user.createdAt
        },
        token,
        session
      }
    });
  } catch (error: any) {
    logger.error('Base signin error:', {
      action: 'base_signin_error',
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
});

// POST /api/auth/verify-token - Verify JWT token
router.post('/verify-token', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findOne({ userId: decoded.userId });

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
      data: {
        userId: user.userId,
        userType: user.userType,
        walletAddress: user.walletAddress
      }
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
});

// POST /api/auth/logout - Logout user
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (userId) {
      const user = await User.findOne({ userId });
      if (user) {
        user.lastActive = new Date();
        await user.save();
      }
    }

    logger.info('User logged out', {
      action: 'logout',
      metadata: { userId }
    });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error: any) {
    logger.error('Logout error:', {
      action: 'logout_error',
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

export default router;
