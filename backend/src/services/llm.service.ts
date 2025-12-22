import Groq from 'groq-sdk';
import { Message } from '../db/queries';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const STORE_KNOWLEDGE = `You are a helpful support agent for TechVibe Electronics, an e-commerce store.

STORE INFORMATION:
- Shipping Policy: Free shipping on orders over $50. Standard shipping takes 5-7 business days. Express shipping (2-3 days) available for $15.
- Return Policy: 30-day money-back guarantee. Items must be unused and in original packaging. Free return shipping for defective items.
- Support Hours: Monday-Friday 9 AM - 6 PM EST. Email support available 24/7 at support@techvibe.com
- Payment Methods: We accept Visa, Mastercard, American Express, PayPal, and Apple Pay.
- International Shipping: We ship to USA, Canada, UK, and EU countries. International shipping costs vary by location.

Answer customer questions clearly, concisely, and professionally. If you don't know something, direct them to contact support@techvibe.com.`;

export const generateReply = async (
  history: Message[],
  userMessage: string
): Promise<string> => {
  try {
    const messages: any[] = [
      {
        role: 'system',
        content: STORE_KNOWLEDGE
      }
    ];

    const recentHistory = history.slice(-10);
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      });
    });

    messages.push({
      role: 'user',
      content: userMessage
    });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 500,
      top_p: 1
    });

    return completion.choices[0]?.message?.content || 
           'I apologize, but I could not generate a response. Please try again.';

  } catch (error: any) {
    console.error('LLM Error:', error);
    
    if (error.status === 401) {
      throw new Error('API authentication failed. Please check your API key.');
    } else if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    } else if (error.code === 'ETIMEDOUT') {
      throw new Error('Request timeout. Please try again.');
    }
    
    throw new Error('An error occurred while generating a response. Please try again later.');
  }
};
