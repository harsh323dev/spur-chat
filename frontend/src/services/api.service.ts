import axios from 'axios';
import { ChatResponse, HistoryResponse } from '../types/chat.types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const sendMessage = async (
  message: string,
  sessionId?: string
): Promise<ChatResponse> => {
  const response = await axios.post(`${API_URL}/chat/message`, {
    message,
    sessionId
  });
  return response.data;
};

export const getHistory = async (sessionId: string): Promise<HistoryResponse> => {
  const response = await axios.get(`${API_URL}/chat/history/${sessionId}`);
  return response.data;
};
