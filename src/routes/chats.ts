import { Router, Request, Response } from 'express';
import { Chat, Match, User } from '../models';
import { authenticate } from '../middleware/auth';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

const router = Router();

// Get user's chats
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const chats = await Chat.find({
      participants: userId,
      isActive: true
    })
      .populate({
        path: 'participants',
        select: 'firstName lastName profilePicture userType isVerified',
        match: { _id: { $ne: userId } }
      })
      .populate({
        path: 'matchId',
        select: 'serviceId',
        populate: {
          path: 'serviceId',
          select: 'title category'
        }
      })
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Get last message for each chat
    const chatsWithLastMessage = await Promise.all(
      chats.map(async (chat) => {
        const lastMessage = chat.messages && chat.messages.length > 0 
          ? chat.messages[chat.messages.length - 1]
          : null;

        // Count unread messages
        const unreadCount = chat.messages 
          ? chat.messages.filter(msg => 
              !msg.readBy.some(read => read.userId.toString() === userId)
            ).length
          : 0;

        return {
          ...chat,
          lastMessage,
          unreadCount,
          otherParticipant: chat.participants[0] // Since we filtered out current user
        };
      })
    );

    const total = await Chat.countDocuments({
      participants: userId,
      isActive: true
    });

    res.json({
      chats: chatsWithLastMessage,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Error fetching chats:', {
      component: 'chats',
      action: 'fetch_chats',
      error: error instanceof Error ? error : String(error),
      userId: req.user!.id
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get chat by ID
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid chat ID' });
    }

    const chat = await Chat.findOne({
      _id: id,
      participants: userId
    })
      .populate({
        path: 'participants',
        select: 'firstName lastName profilePicture userType isVerified'
      })
      .populate({
        path: 'matchId',
        populate: [
          {
            path: 'serviceId',
            select: 'title description category price'
          },
          {
            path: 'clientId',
            select: 'firstName lastName profilePicture'
          },
          {
            path: 'lawyerId',
            populate: {
              path: 'userId',
              select: 'firstName lastName profilePicture'
            }
          }
        ]
      })
      .lean();

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Mark messages as read
    await Chat.findByIdAndUpdate(id, {
      $addToSet: {
        'messages.$[].readBy': {
          userId,
          readAt: new Date()
        }
      }
    });

    res.json(chat);
  } catch (error) {
    logger.error('Error fetching chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send message
router.post('/:id/messages', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { content, type = 'text', attachments = [] } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid chat ID' });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const chat = await Chat.findOne({
      _id: id,
      participants: userId
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Create message
    const message = {
      _id: new mongoose.Types.ObjectId(),
      senderId: userId,
      content: content.trim(),
      type,
      attachments,
      sentAt: new Date(),
      readBy: [{
        userId,
        readAt: new Date()
      }]
    };

    // Add message to chat
    chat.messages.push(message);
    chat.lastActivity = new Date();
    chat.metadata.lastMessage = {
      content: content.trim(),
      sentAt: new Date(),
      senderId: userId
    };

    await chat.save();

    // Populate sender info for response
    const populatedMessage = await Chat.findById(id)
      .select('messages')
      .populate({
        path: 'messages.senderId',
        select: 'firstName lastName profilePicture'
      })
      .lean();

    const newMessage = populatedMessage?.messages.find(
      msg => msg._id.toString() === message._id.toString()
    );

    logger.info(`Message sent in chat ${id} by user ${userId}`);
    res.status(201).json({
      message: newMessage,
      chatId: id
    });
  } catch (error) {
    logger.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get chat messages
router.get('/:id/messages', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { page = 1, limit = 50, before } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid chat ID' });
    }

    // Verify user is participant
    const chat = await Chat.findOne({
      _id: id,
      participants: userId
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    let query: Record<string, object> = {};
    if (before) {
      query = { sentAt: { $lt: new Date(before.toString()) } };
    }

    // Get messages with pagination
    const messages = chat.messages
      .filter(msg => {
        if (before) {
          return msg.sentAt < new Date(before.toString());
        }
        return true;
      })
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime())
      .slice(0, Number(limit));

    // Populate sender info
    const populatedMessages = await Chat.populate(messages, {
      path: 'senderId',
      select: 'firstName lastName profilePicture userType'
    });

    res.json({
      messages: populatedMessages.reverse(), // Return in chronological order
      hasMore: chat.messages.length > Number(page) * Number(limit),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: chat.messages.length
      }
    });
  } catch (error) {
    logger.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark messages as read
router.patch('/:id/read', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { messageIds } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid chat ID' });
    }

    const chat = await Chat.findOne({
      _id: id,
      participants: userId
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Mark specific messages as read or all if no messageIds provided
    const updateQuery: Record<string, object> = {};
    
    if (messageIds && Array.isArray(messageIds)) {
      updateQuery['messages.$[elem].readBy'] = {
        $addToSet: {
          userId,
          readAt: new Date()
        }
      };
      
      await Chat.updateOne(
        { _id: id },
        { $addToSet: updateQuery },
        {
          arrayFilters: [
            { 'elem._id': { $in: messageIds.map(id => new mongoose.Types.ObjectId(id)) } }
          ]
        }
      );
    } else {
      // Mark all messages as read
      await Chat.updateOne(
        { _id: id },
        {
          $addToSet: {
            'messages.$[].readBy': {
              userId,
              readAt: new Date()
            }
          }
        }
      );
    }

    logger.info(`Messages marked as read in chat ${id} by user ${userId}`);
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    logger.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Set typing indicator
router.post('/:id/typing', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { isTyping = true } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid chat ID' });
    }

    const chat = await Chat.findOne({
      _id: id,
      participants: userId
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Update typing indicator
    const typingUpdate = isTyping 
      ? {
          $addToSet: {
            'metadata.typingUsers': {
              userId,
              startedAt: new Date()
            }
          }
        }
      : {
          $pull: {
            'metadata.typingUsers': { userId }
          }
        };

    await Chat.findByIdAndUpdate(id, typingUpdate);

    res.json({ 
      message: `Typing indicator ${isTyping ? 'set' : 'removed'}`,
      isTyping 
    });
  } catch (error) {
    logger.error('Error setting typing indicator:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update chat settings
router.patch('/:id/settings', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { notifications, autoDelete } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid chat ID' });
    }

    const chat = await Chat.findOne({
      _id: id,
      participants: userId
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Update settings
    const updateData: Record<string, boolean> = {};
    if (typeof notifications === 'boolean') {
      updateData['settings.notifications'] = notifications;
    }
    if (typeof autoDelete === 'boolean') {
      updateData['settings.autoDelete'] = autoDelete;
    }

    await Chat.findByIdAndUpdate(id, { $set: updateData });

    logger.info(`Chat settings updated for chat ${id} by user ${userId}`);
    res.json({ 
      message: 'Chat settings updated successfully',
      settings: { notifications, autoDelete }
    });
  } catch (error) {
    logger.error('Error updating chat settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Archive chat
router.patch('/:id/archive', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid chat ID' });
    }

    const chat = await Chat.findOne({
      _id: id,
      participants: userId
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Archive chat
    chat.isActive = false;
    chat.lastActivity = new Date();
    await chat.save();

    logger.info(`Chat ${id} archived by user ${userId}`);
    res.json({ 
      message: 'Chat archived successfully',
      chatId: id
    });
  } catch (error) {
    logger.error('Error archiving chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get chat statistics
router.get('/stats/overview', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const stats = await Chat.aggregate([
      {
        $match: {
          participants: new mongoose.Types.ObjectId(userId),
          isActive: true
        }
      },
      {
        $project: {
          totalMessages: { $size: '$messages' },
          unreadMessages: {
            $size: {
              $filter: {
                input: '$messages',
                cond: {
                  $not: {
                    $in: [
                      new mongoose.Types.ObjectId(userId),
                      '$$.readBy.userId'
                    ]
                  }
                }
              }
            }
          },
          lastActivity: 1
        }
      },
      {
        $group: {
          _id: null,
          totalChats: { $sum: 1 },
          totalMessages: { $sum: '$totalMessages' },
          totalUnread: { $sum: '$unreadMessages' },
          lastActivity: { $max: '$lastActivity' }
        }
      }
    ]);

    const result = stats[0] || {
      totalChats: 0,
      totalMessages: 0,
      totalUnread: 0,
      lastActivity: null
    };

    res.json(result);
  } catch (error) {
    logger.error('Error fetching chat stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;