# 💬 SpurChat – AI Support Agent

> Mini customer support chat widget with persistent conversations, Groq-powered AI agent, and Neon PostgreSQL storage – built for the Spur Founding Full‑Stack Engineer take‑home assignment. 

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=000000)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Groq](https://img.shields.io/badge/Groq_LLM-FF6B6B?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://console.groq.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Neon](https://img.shields.io/badge/Neon_DB-00E599?style=for-the-badge&logo=neondatabase&logoColor=white)](https://neon.tech/)
[![Render](https://img.shields.io/badge/Backend-Render-0466C8?style=for-the-badge&logo=render&logoColor=white)](https://render.com/) 
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/) 

**🚀 Live Demo (Frontend):** https://spurchat-harsh.vercel.app/  
**🧠 Backend API:** https://spurchat-harsh.onrender.com/  
**📊 Health:** https://spurchat-harsh.onrender.com/health 

---

## 📸 UI Preview

### Empty state

![SpurChat Empty](./ss/s.png)

### Active conversation

![SpurChat Conversation](./ss/ss.png)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture & Data Model](#architecture--data-model)
- [Installation & Local Setup](#installation--local-setup)
- [Backend API](#backend-api)
- [Environment Configuration](#environment-configuration)
- [LLM Notes](#llm-notes)
- [Author](#author)

---

## 🎯 Overview

**SpurChat** is a small but realistic AI support experience that simulates a live chat widget for a fictional e‑commerce store. A user asks questions like *“What’s your return policy?”* or *“Do you ship to USA?”* and an AI agent responds with contextual answers based on store policies. 

It is built to match Spur’s expectations:

- Real LLM API integration (Groq, Llama 3.3 70B Versatile). 
- Persisted conversations in PostgreSQL, retrievable via `sessionId`. 
- Simple, responsive chat UI with clear user/agent separation and typing indicator. 
- Production‑style deployment: Render (backend) + Neon (Postgres) + Vercel (frontend). 

---

## ✨ Features

### 💬 Core Chat Experience

- Scrollable, auto‑scrolling message list.
- Distinct styling for **user** vs **AI** messages.
- “Agent is typing…” indicator while waiting for Groq response. 
- Keyboard shortcuts: `Enter` to send, `Shift+Enter` for newline.
- **New Chat** button to start a fresh conversation.

### 🧠 AI Support Agent

- Uses **Groq** to call `llama-3.3-70b-versatile` chat model.
- Seeded with store‑specific FAQs:
  - Shipping policy
  - Return / refund policy
  - Support hours
  - Payment methods
  - Supported countries
- Includes recent conversation history for contextual replies. 

### 🗂️ Persistence & Sessions

- Every message (user + AI) stored in Postgres:
  - `conversations` table
  - `messages` table 
- Frontend stores `sessionId` in `sessionStorage` so:
  - Page reload restores conversation history.
  - History endpoint (`GET /api/chat/history/:sessionId`) rehydrates the UI.

### 📱 Responsive UI

- Desktop: centered chat card with tall message area.
- Mobile:
  - Chat takes full viewport height.
  - **Input stays pinned at the bottom**, only messages scroll.
  - Touch‑friendly buttons and spacing.

---

## 🛠️ Tech Stack

| Layer           | Technologies                                                                 |
|-----------------|------------------------------------------------------------------------------|
| **Frontend**    | React 18, TypeScript, Create React App, CSS modules for Chat UI              |
| **Backend**     | Node.js, Express, TypeScript, ts-node, nodemon                               |
| **Database**    | PostgreSQL 17 on Neon (serverless Postgres)                                  |
| **LLM Provider**| Groq – Llama 3.3 70B Versatile chat model                                    |
| **Hosting**     | Render (backend API) + Vercel (frontend static build)                        |
| **Dev Tools**   | Thunder Client / Postman, nodemon, environment‑based config                  |

---

## 🧱 Architecture & Data Model

### High‑Level Flow

1. User loads the React app (Vercel).
2. Chat widget:
   - Restores `sessionId` from `sessionStorage` if present.
   - Hits `/api/chat/history/:sessionId` to fetch previous messages. 
3. On new message:
   - Frontend `POST /api/chat/message` with `{ message, sessionId? }`.
   - Backend:
     - Validates input.
     - Creates or validates conversation.
     - Persists user message.
     - Calls Groq LLM via `generateReply(history, userMessage)`.
     - Persists AI reply.
     - Returns `{ reply, sessionId }`.
4. Frontend updates UI and caches `sessionId` for subsequent requests.

---

## 🚀 Installation & Local Setup

### ✅ Prerequisites

- Node.js **v18+** (works with v24 on dev machine)
- npm
- Neon Postgres account (or any Postgres with SSL) 
- Groq account + API key 

---

### 1. Clone the Repository

git clone https://github.com/harsh323dev/spur-chat.git

cd spur-chat


### 2. Backend Setup

cd backend

npm install


Create `.env` in `backend`:

PORT=3000
NODE_ENV=development

Neon Postgres connection string
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require

Groq API key from https://console.groq.com
GROQ_API_KEY=gsk_xxx


Run database migrations (creates `conversations` and `messages` tables in Neon):

npm run migrate


Start backend locally:

npm run dev

API: http://localhost:3000/api

Health: http://localhost:3000/health


### 3. Frontend Setup

In a second terminal:

cd spur-chat/frontend
npm install


Create `.env` in `frontend`:

Local dev – points to local backend
REACT_APP_API_URL=http://localhost:3000/api


Start the React app:

npm start


The frontend will open on http://localhost:3001 (if 3000 is used by backend).


You can now chat end‑to‑end against your local backend. 

---

## 🌐 Backend API

### POST `/api/chat/message`

**Request body:**

{
"message": "What's your return policy?",
"sessionId": "optional-uuid"
}


- `message` – required, non‑empty, max 2000 chars.
- `sessionId` – optional; if omitted, backend creates a new conversation. 

**Response:**

{
"reply": "At TechVibe Electronics, we offer a 30-day money-back guarantee...",
"sessionId": "uuid-of-conversation"
}


### GET `/api/chat/history/:sessionId`

Returns all messages for the conversation ordered by `created_at`:

{
"messages": [
{
"id": "uuid",
"conversation_id": "uuid",
"sender": "user",
"text": "What's your return policy?",
"created_at": "2025-12-22T..."
},
{
"id": "uuid",
"conversation_id": "uuid",
"sender": "ai",
"text": "At TechVibe Electronics, we offer a 30-day money-back guarantee...",
"created_at": "2025-12-22T..."
}
]
}


---

## 🔐 Environment Configuration

### Backend (`backend/.env`)

PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
GROQ_API_KEY=gsk_xxx


### Frontend (`frontend/.env`)

- Local:

REACT_APP_API_URL=http://localhost:3000/api


- Production (Vercel):

REACT_APP_API_URL=https://spurchat-harsh.onrender.com/api


---

## 🧠 LLM Notes

- **Provider:** Groq (https://console.groq.com/) 
- **Model:** `llama-3.3-70b-versatile` (latest recommended chat model at time of build). 
- **Prompting:**
  - System prompt seeds details of **TechVibe Electronics**:
    - Shipping policy
    - Returns/refunds
    - Support hours
    - Payment methods
    - Supported countries
  - Last ~10 messages of history are included to keep context without blowing up token usage. 
- **Parameters:**
  - `temperature: 0.7`
  - `max_tokens: 500`
  - `top_p: 1`

Error handling:
- 401 → API key issues
- 429 → rate limit
- Timeouts → user‑friendly retry message
All mapped to friendly agent messages instead of raw errors. 

---

## 🛡️ Robustness & Edge Cases

As required in the brief, the app is intentionally “idiot‑proofed”: 

- **Input validation:**
  - Rejects null/empty messages.
  - Caps length to 2000 chars with clear error.
- **Backend safety:**
  - No crashes on bad input: validation and try/catch around DB + LLM.
  - Central error handler returns JSON with safe messages.
- **LLM failures:**
  - User sees: *“I’m experiencing technical difficulties…”* plus a short explanation.
- **Frontend UX:**
  - Disabled send button while request in-flight.
  - Error banner with dismiss button.
  - Conversation persists via `sessionStorage`.
- **Secrets:**
  - All keys (`DATABASE_URL`, `GROQ_API_KEY`) are env‑only; `.env` is git‑ignored.

---

## 🔄 Trade‑offs & If I Had More Time

- **Auth & multi‑tenant:**  
  No authentication; sessions are anonymous. Next step would be user accounts or signed, time‑limited session tokens. 

- **Richer domain knowledge:**  
  Policies are currently embedded in system prompt. Could move to DB + retrieval (or embeddings) for more realistic FAQ behavior.

- **Testing:**  
  Manual testing via Thunder Client + browser. With more time: Jest tests for routes/services, plus Playwright/Cypress E2E flows.

- **Channels & tools:**  
  Architecture keeps LLM integration in `llm.service.ts` and routes thin, so adding WhatsApp/IG or tools (order lookup, refund creation) is straightforward, but not implemented due to timebox. [file:1]

---

## 👨‍💻 Author

**Harsh Agarwal**

- GitHub: [@harsh323dev](https://github.com/harsh323dev)
- LinkedIn: https://www.linkedin.com/in/harsh323
- Email: harshagarwal323.ag@gmail.com

---

*Built with love for Spur • Backend on Render + Neon • Frontend on Vercel • AI by Groq ♥*















