export interface Message {
  id: string;
  conversation_id: string;
  sender: 'user' | 'ai';
  text: string;
  created_at: string;
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
}

export interface HistoryResponse {
  messages: Message[];
}
