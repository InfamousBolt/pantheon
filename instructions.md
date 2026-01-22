# Take Home for Keshav

## Assignment: Build an AI Research Agent

**Time Estimate:** 4-6 hours

**Deadline:** 01/23/2025

---

### Objective

Build a fullstack AI-powered research agent that can answer questions by searching the web and synthesizing information.

---

### Requirements

**Frontend (TypeScript/React)**

- Clean, minimal chat interface
- No Vanilla Shadcn
- Add Animations where necessary
- Display agent's thinking/reasoning steps
- Show sources used in responses
- Shareable chat links (e.g., `/chat/:id`)

**Backend (FastAPI)**

- `/chat` endpoint that handles user queries
- Implement an AI agent with tool use (web search)
- Stream responses to frontend

**Database (PostgreSQL)**

- Store all chat conversations
- Each chat gets a unique shareable ID
- Retrieve chat history via API

**AI Agent**

- Use any LLM (OpenAI, Anthropic, etc.)
- Agent must decide when to search vs. answer directly
- Cite sources in final response

---

### Evaluation Criteria

1. **Design** — Is the UI intuitive and polished?
2. **Architecture** — Is the code well-structured and maintainable?
3. **AI Implementation** — Does the agent reason effectively?
4. **Data Layer** — Is the database schema sensible?
5. **Completeness** — Does it work end-to-end?

---

### Deliverables

- GitHub repo with README (setup instructions) - @dakshaymehta (github)
- Deployed frontend (**Vercel preferred**)
- Deployed backend with PostgreSQL
- Brief write-up: architecture decisions + tradeoffs (max 300 words)
- Recorded Video of the project working as intended

---

### Bonus (Optional)

- Conversation memory/history
- Multiple tool support
- Voice input/output

---

**Questions?** Reply to this doc or email directly. dakshay@thepantheonai.com
