import pool from './database';
import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  conversation_id: string;
  sender: 'user' | 'ai';
  text: string;
  created_at: Date;
}

export interface Conversation {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export const createConversation = async (): Promise<string> => {
  const id = uuidv4();
  await pool.query(
    'INSERT INTO conversations (id) VALUES ($1)',
    [id]
  );
  return id;
};

export const getConversation = async (id: string): Promise<Conversation | null> => {
  const result = await pool.query(
    'SELECT * FROM conversations WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};

export const createMessage = async (
  conversationId: string,
  sender: 'user' | 'ai',
  text: string
): Promise<Message> => {
  const id = uuidv4();
  const result = await pool.query(
    `INSERT INTO messages (id, conversation_id, sender, text) 
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [id, conversationId, sender, text]
  );
  
  await pool.query(
    'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
    [conversationId]
  );
  
  return result.rows[0];
};

export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
  const result = await pool.query(
    'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
    [conversationId]
  );
  return result.rows;
};
