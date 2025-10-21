import { Router, Request, Response } from 'express';
import { Session } from '../models/Session.model';
import { logger } from '../../utils/logger';

const router = Router();

// POST /api/sessions - Create new session
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      walletAddress,
      signature,
      message,
      token,
      deviceInfo
    } = req.body;

    if (!userId || !walletAddress || !token) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Deactivate old sessions for this user
    await Session.updateMany(
      { userId, isActive: true },
      { isActive: false }
    );

    // Create new session
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session = await Session.create({
      userId,
      sessionId,
      walletAddress: walletAddress.toLowerCase(),
      signature,
      message,
      token,
      loginTime: new Date(),
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      deviceInfo,
      isActive: true
    });

    logger.info('Session created', {
      action: 'session_created',
      metadata: { userId, sessionId }
    });

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error: any) {
    logger.error('Error creating session:', {
      action: 'session_create_error',
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to create session'
    });
  }
});

// GET /api/sessions/:userId - Get active sessions for user
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const sessions = await Session.find({
      userId: req.params.userId,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).sort({ lastActivity: -1 });

    res.json({
      success: true,
      data: sessions
    });
  } catch (error: any) {
    logger.error('Error fetching sessions:', {
      action: 'sessions_fetch_error',
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sessions'
    });
  }
});

// PATCH /api/sessions/:sessionId/activity - Update session activity
router.patch('/:sessionId/activity', async (req: Request, res: Response) => {
  try {
    const session = await Session.findOneAndUpdate(
      { sessionId: req.params.sessionId, isActive: true },
      { lastActivity: new Date() },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to update session'
    });
  }
});

// DELETE /api/sessions/:sessionId - Terminate session
router.delete('/:sessionId', async (req: Request, res: Response) => {
  try {
    const session = await Session.findOneAndUpdate(
      { sessionId: req.params.sessionId },
      { isActive: false },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    logger.info('Session terminated', {
      action: 'session_terminated',
      metadata: { sessionId: req.params.sessionId, userId: session.userId }
    });

    res.json({
      success: true,
      message: 'Session terminated'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to terminate session'
    });
  }
});

// DELETE /api/sessions/user/:userId - Terminate all sessions for user
router.delete('/user/:userId', async (req: Request, res: Response) => {
  try {
    await Session.updateMany(
      { userId: req.params.userId, isActive: true },
      { isActive: false }
    );

    logger.info('All sessions terminated for user', {
      action: 'user_sessions_terminated',
      metadata: { userId: req.params.userId }
    });

    res.json({
      success: true,
      message: 'All sessions terminated'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to terminate sessions'
    });
  }
});

export default router;
