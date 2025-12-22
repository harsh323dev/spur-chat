import { Router, Request, Response } from 'express';
import {
  createConversation,
  createMessage,
  getConversation,
  getConversationMessages
} from '../db/queries';
import { generateReply } from '../services/llm.service';

const router = Router();

const validateMessage = (message: any): string | null => {
  if (!message || typeof message !== 'string') {
    return 'Message must be a non-empty string';
  }
  
  const trimmed = message.trim();
  if (trimmed.length === 0) {
    return 'Message cannot be empty';
  }
  
  if (trimmed.length > 2000) {
    return 'Message is too long (max 2000 characters)';
  }
  
  return null;
};

router.post('/message', async (req: Request, res: Response) => {
  try {
    const { message, sessionId } = req.body;

    const validationError = validateMessage(message);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const trimmedMessage = message.trim();
    let conversationId = sessionId;

    if (!conversationId) {
      conversationId = await createConversation();
    } else {
      const conversation = await getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
    }

    await createMessage(conversationId, 'user', trimmedMessage);

    const history = await getConversationMessages(conversationId);

    let aiReply: string;
    try {
      aiReply = await generateReply(history, trimmedMessage);
    } catch (error: any) {
      aiReply = `I apologize, but I'm experiencing technical difficulties. ${error.message}`;
    }

    await createMessage(conversationId, 'ai', aiReply);

    res.json({
      reply: aiReply,
      sessionId: conversationId
    });

  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      error: 'An unexpected error occurred. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/history/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const conversation = await getConversation(sessionId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messages = await getConversationMessages(sessionId);
    res.json({ messages });

  } catch (error: any) {
    console.error('History endpoint error:', error);
    res.status(500).json({ error: 'Failed to fetch conversation history' });
  }
});

export default router;
