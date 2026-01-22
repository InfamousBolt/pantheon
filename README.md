# Pantheon - AI Research Agent

A fullstack AI research agent that answers questions by searching the web and synthesizing information. Features a modern chat interface with real-time streaming, thinking steps visualization, and source citations.

## Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Python FastAPI with SSE streaming
- **Database:** PostgreSQL with async SQLAlchemy
- **AI:** Anthropic Claude with tool use capability

## Features

- Real-time streaming responses via Server-Sent Events
- AI agent autonomously decides when to search the web
- Displays thinking/reasoning steps as the agent works
- Source citations for all web-sourced information
- Shareable chat links (`/chat/:id`)
- Persistent conversation history

## Project Structure

```
pantheon/
├── frontend/           # React TypeScript app
│   └── src/
│       ├── components/ # UI components
│       ├── pages/      # Route pages
│       ├── services/   # API client
│       └── stores/     # Zustand state
├── backend/            # FastAPI application
│   └── app/
│       ├── api/        # API routes
│       ├── agents/     # AI agent logic
│       ├── models/     # Pydantic schemas
│       └── database.py # Database connection
└── database/           # SQL schema
```

## Local Development Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL 14+

### Database Setup

```bash
# Create database
createdb pantheon_db

# Apply schema
psql pantheon_db < database/schema.sql
```

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your values:
# DATABASE_URL=postgresql+asyncpg://user:password@localhost/pantheon_db
# ANTHROPIC_API_KEY=your_api_key

# Run development server
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
echo "VITE_API_URL=http://localhost:8000" > .env.local

# Run development server
npm run dev
```

Frontend runs at `http://localhost:5173`

## Environment Variables

### Backend

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (must include `+asyncpg`) |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude |

### Frontend

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |

## Deployment

### Backend (Railway)

1. Create a new Railway project
2. Add PostgreSQL service
3. Add backend service from GitHub repo
4. Set root directory to `backend`
5. Add environment variables:
   - `DATABASE_URL`: Use the public database URL with `postgresql+asyncpg://` prefix
   - `ANTHROPIC_API_KEY`: Your API key
6. Deploy

### Frontend (Vercel)

1. Import GitHub repo to Vercel
2. Set root directory to `frontend`
3. Add environment variable:
   - `VITE_API_URL`: Your Railway backend URL
4. Deploy

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/chats` | List all chats |
| POST | `/api/chats` | Create new chat |
| GET | `/api/chats/:id` | Get chat with messages |
| DELETE | `/api/chats/:id` | Delete chat |
| PATCH | `/api/chats/:id/title` | Update chat title |
| POST | `/api/chats/:id/messages` | Send message (SSE stream) |

## License

MIT
