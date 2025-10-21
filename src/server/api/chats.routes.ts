import { Router, Request, Response } from 'express';
import { ChatRoom } from '../models/ChatRoom.model';
import { Match } from '../models/Match.model';
import { Lawyer } from '../models/Lawyer.model';
import { logger } from '../../utils/logger';

const router = Router();

// GET /api/chats/:userId - Get all chat rooms for a user
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Find chats where user is either client or lawyer
    const chats = await ChatRoom.find({
      $or: [
        { clientId: userId },
        { lawyerId: userId }
      ]
    }).sort({ updatedAt: -1 });

    // Populate other user details
    const chatsWithDetails = await Promise.all(
      chats.map(async (chat) => {
        const isClient = chat.clientId === userId;
        const otherUserId = isClient ? chat.lawyerId : chat.clientId;
        
        // For lawyers, fetch their profile
        const otherUser = await Lawyer.findOne({ profileId: otherUserId });

        return {
          ...chat.toObject(),
          otherUser,
          lastMessage: chat.messages.length > 0 
            ? chat.messages[chat.messages.length - 1]
            : null
        };
      })
    );

    res.json({
      success: true,
      data: chatsWithDetails
    });
  } catch (error: any) {
    logger.error('Error fetching chats:', {
      action: 'chats_fetch_error',
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chats'
    });
  }
});

// GET /api/chats/room/:matchId - Get or create chat room for a match
router.get('/room/:matchId', async (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;

    // Check if match exists
    const match = await Match.findOne({ _id: matchId });
    
    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Match not found'
      });
    }

    // Get or create chat room
    let chatRoom = await ChatRoom.findOne({ matchId: matchId.toString() });

    if (!chatRoom) {
      chatRoom = await ChatRoom.create({
        matchId: matchId.toString(),
        clientId: match.clientId,
        lawyerId: match.lawyerId,
        messages: []
      });

      logger.info('Chat room created', {
        action: 'chat_room_created',
        metadata: { matchId, clientId: match.clientId, lawyerId: match.lawyerId }
      });
    }

    res.json({
      success: true,
      data: chatRoom
    });
  } catch (error: any) {
    logger.error('Error getting chat room:', {
      action: 'chat_room_error',
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to get chat room'
    });
  }
});

// POST /api/chats/room/:roomId/message - Send a message
router.post('/room/:roomId/message', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { senderId, content } = req.body;

    if (!senderId || !content) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const chatRoom = await ChatRoom.findById(roomId);

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        error: 'Chat room not found'
      });
    }

    // Add message
    const message = {
      id: Date.now().toString(),
      senderId,
      content: content.trim(),
      createdAt: new Date(),
      isSystemMessage: false
    };

    chatRoom.messages.push(message);
    chatRoom.lastMessageAt = new Date();
    await chatRoom.save();

    logger.info('Message sent', {
      action: 'message_sent',
      metadata: { roomId, senderId, messageLength: content.length }
    });

    // Generate AI response if sender is client and recipient is system lawyer
    const lawyer = await Lawyer.findOne({ 
      profileId: chatRoom.lawyerId,
      isSystemProfile: true 
    });

    if (lawyer && senderId === chatRoom.clientId) {
      // Generate response based on message content
      const aiResponse = generateLawyerResponse(content, lawyer);
      
      setTimeout(async () => {
        const responseMessage = {
          id: (Date.now() + 1).toString(),
          senderId: chatRoom.lawyerId,
          content: aiResponse,
          createdAt: new Date(),
          isSystemMessage: true
        };

        chatRoom.messages.push(responseMessage);
        chatRoom.lastMessageAt = new Date();
        await chatRoom.save();

        logger.info('AI response sent', {
          action: 'ai_response_sent',
          metadata: { roomId, lawyerId: chatRoom.lawyerId }
        });
      }, 1000 + Math.random() * 1000);
    }

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error: any) {
    logger.error('Error sending message:', {
      action: 'message_send_error',
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
});

// AI Response Generator
function generateLawyerResponse(userMessage: string, lawyer: any): string {
  const msg = userMessage.toLowerCase();
  
  if (msg.includes('bail') || msg.includes('arrested') || msg.includes('custody')) {
    return `Based on my ${lawyer.experience} in ${lawyer.specialization}, I can help you with bail applications. The process typically takes 2-5 days. I charge between R3,000-R8,000 depending on complexity. Would you like me to review your case?`;
  }
  
  if (msg.includes('debt') || msg.includes('payment') || msg.includes('owe') || msg.includes('money')) {
    return `I specialize in debt matters with ${lawyer.experience}. I can help you understand your options, negotiate payment plans, or initiate legal proceedings if needed. My rates are competitive. What specific debt issue are you facing?`;
  }
  
  if (msg.includes('maintenance') || msg.includes('child support') || msg.includes('alimony')) {
    return `Maintenance claims are one of my specialties. I can help you file a claim, enforce existing orders, or defend against unfair claims. The process usually takes 4-8 weeks. Would you like to schedule a consultation?`;
  }
  
  if (msg.includes('cost') || msg.includes('price') || msg.includes('fee')) {
    return `My consultation fee is R${lawyer.consultationFee}. For full services, prices vary by complexity. I offer transparent pricing and accept USDC payments. Would you like a detailed quote for your specific matter?`;
  }
  
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return `Hello! I'm ${lawyer.name}, ${lawyer.specialization} specialist. I have ${lawyer.experience} of experience. How can I help you with your legal matter today?`;
  }
  
  return `Thank you for your message. As a ${lawyer.specialization} specialist with ${lawyer.experience}, I'm here to assist you. Could you provide more details about your legal matter so I can give you specific guidance?`;
}

export default router;
