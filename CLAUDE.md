# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Research Agent - A fullstack application that answers questions by searching the web and synthesizing information. Built with React/TypeScript frontend, FastAPI backend, and PostgreSQL database.

## Tech Stack

- **Frontend:** React with TypeScript (no vanilla Shadcn - customize components)
- **Backend:** Python FastAPI with streaming responses
- **Database:** PostgreSQL
- **AI:** LLM with tool use capability (OpenAI/Anthropic)

## Architecture

```
pantheon/
├── frontend/          # React TypeScript app
│   └── src/
│       ├── components/   # Chat UI, message display, thinking steps
│       ├── pages/        # Route components (home, /chat/:id)
│       └── services/     # API client
├── backend/           # FastAPI application
│   └── app/
│       ├── api/          # /chat endpoint
│       ├── agents/       # AI agent with web search tool
│       ├── models/       # Pydantic schemas
│       └── database.py   # PostgreSQL connection
└── database/          # Schema and migrations
```

## Core Features

1. **Chat Interface:** Minimal UI with animations, displays thinking/reasoning steps and sources
2. **Streaming:** Backend streams responses via SSE to frontend
3. **AI Agent:** Decides when to search web vs answer directly, cites sources
4. **Shareable Chats:** Each conversation has unique ID accessible at `/chat/:id`
5. **Persistence:** All conversations stored in PostgreSQL

## Build Commands

### Frontend
```bash
cd frontend
npm install
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Lint check
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload    # Development server
pytest                            # Run tests
```

### Database
```bash
createdb pantheon_db
psql pantheon_db < database/schema.sql
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost/pantheon_db
OPENAI_API_KEY=...    # or ANTHROPIC_API_KEY
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:8000
```

## Key Implementation Notes

- **Streaming:** Use FastAPI `StreamingResponse` or SSE. Emit events for: thinking steps, search queries, search results, final answer
- **Tool Use:** Agent decides autonomously when web search is needed vs answering from knowledge
- **Source Citation:** All web sources must be displayed with the response
- **Database Schema:** Use UUIDs for chat IDs (shareable), include timestamps, store full message history
- **CORS:** Configure FastAPI middleware for frontend origin

## Evaluation Priority

1. Design (UI polish)
2. Architecture (code structure)
3. AI Implementation (reasoning quality)
4. Data Layer (schema design)
5. Completeness (end-to-end functionality)

## Deployment

- Frontend: Vercel
- Backend: Railway/Fly.io/Render
- Database: Managed PostgreSQL (Supabase/Railway/Neon)
