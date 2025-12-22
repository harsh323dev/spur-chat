import React, { useState, useEffect, useRef } from 'react';
import { sendMessage, getHistory } from '../services/api.service';
import { Message } from '../types/chat.types';
import './ChatWidget.css';

const ChatWidget: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const storedSessionId = sessionStorage.getItem('chatSessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
      loadHistory(storedSessionId);
    }
  }, []);

  const loadHistory = async (id: string) => {
    try {
      const data = await getHistory(id);
      setMessages(data.messages);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    setError(null);
    setIsLoading(true);

    const tempId = Date.now().toString();
    const userMessage: Message = {
      id: tempId,
      conversation_id: sessionId || '',
      sender: 'user',
      text: trimmedInput,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await sendMessage(trimmedInput, sessionId || undefined);

      if (!sessionId) {
        setSessionId(response.sessionId);
        sessionStorage.setItem('chatSessionId', response.sessionId);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        conversation_id: response.sessionId,
        sender: 'ai',
        text: response.reply,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send message. Please try again.');
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setInput(trimmedInput);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setSessionId(null);
    sessionStorage.removeItem('chatSessionId');
    setError(null);
    setInput('');
  };

  const setQuickQuestion = (text: string) => {
    setInput(text);
    const inputElement = document.querySelector<HTMLTextAreaElement>('.chat-input textarea');
    inputElement?.focus();
  };

  return (
    <div className="chat-page">
      <div className="chat-widget">
        <header className="chat-header">
          <div className="chat-header-left">
            <h2>TechVibe Support</h2>
            <span className="status-indicator">● Online</span>
          </div>
          <button onClick={startNewChat} className="new-chat-btn" title="Start new conversation">
            New Chat
          </button>
        </header>

        <main className="chat-messages" aria-label="Chat messages">
          {messages.length === 0 && (
            <div className="welcome-message">
              <h3>👋 Welcome to TechVibe Support!</h3>
              <p>Ask me anything about our products, shipping, returns, or policies.</p>
              <div className="suggested-questions">
                <p>Try asking:</p>
                <button onClick={() => setQuickQuestion("What's your return policy?")}>
                  Return policy?
                </button>
                <button onClick={() => setQuickQuestion('Do you offer free shipping?')}>
                  Free shipping?
                </button>
                <button onClick={() => setQuickQuestion('What are your support hours?')}>
                  Support hours?
                </button>
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              <div className="message-avatar">
                {msg.sender === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message-content">
                <span className="message-sender">
                  {msg.sender === 'user' ? 'You' : 'Support Agent'}
                </span>
                <p>{msg.text}</p>
                <span className="message-time">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message ai">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <span className="message-sender">Support Agent</span>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </main>

        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <footer className="chat-input">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message…"
            rows={1}
            disabled={isLoading}
            maxLength={2000}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="send-btn"
            title="Send message"
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ChatWidget;
