import json
import httpx
from typing import AsyncGenerator
from anthropic import AsyncAnthropic
from app.config import get_settings
from app.models.schemas import ThinkingStep, Source

settings = get_settings()


class ResearchAgent:
    """AI Research Agent using Claude with Tavily web search."""

    def __init__(self):
        self.client = AsyncAnthropic(api_key=settings.anthropic_api_key)
        self.model = "claude-sonnet-4-20250514"
        self.tavily_api_key = settings.tavily_api_key

        self.tools = [
            {
                "name": "web_search",
                "description": "Search the web for current information. Use this when you need up-to-date information, recent events, or facts you're not certain about. Returns relevant web pages with titles, URLs, and content snippets.",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The search query to find relevant information",
                        }
                    },
                    "required": ["query"],
                },
            }
        ]

        self.system_prompt = """You are a helpful research assistant. Your job is to answer questions accurately and thoroughly.

When answering questions:
1. If the question requires current/recent information or facts you're uncertain about, use the web_search tool to find accurate information.
2. If the question is about well-established facts, general knowledge, or concepts you're confident about, answer directly without searching.
3. When you use search results, cite your sources by mentioning the relevant information came from the web.
4. Be comprehensive but concise in your answers.
5. If search results don't fully answer the question, say so and provide what you can.

Always aim to be helpful, accurate, and honest about the source of your information."""

    async def search_web(self, query: str) -> list[Source]:
        """Execute a web search using Tavily API."""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    "https://api.tavily.com/search",
                    json={
                        "api_key": self.tavily_api_key,
                        "query": query,
                        "search_depth": "advanced",
                        "include_answer": False,
                        "include_raw_content": False,
                        "max_results": 5,
                    },
                    timeout=30.0,
                )
                response.raise_for_status()
                data = response.json()

                sources = []
                for result in data.get("results", []):
                    url = result.get("url", "")
                    domain = url.split("/")[2] if url.startswith("http") else url
                    sources.append(
                        Source(
                            url=url,
                            title=result.get("title", ""),
                            domain=domain,
                            snippet=result.get("content", "")[:300],
                        )
                    )
                return sources
            except Exception as e:
                print(f"Search error: {e}")
                return []

    async def generate_response(
        self, messages: list[dict], user_message: str
    ) -> AsyncGenerator[dict, None]:
        """Generate a streaming response with tool use."""
        # Build conversation history
        conversation = []
        for msg in messages:
            conversation.append({"role": msg["role"], "content": msg["content"]})
        conversation.append({"role": "user", "content": user_message})

        thinking_steps: list[ThinkingStep] = []
        all_sources: list[Source] = []
        final_content = ""

        # Initial thinking step
        yield {
            "type": "thinking",
            "step": ThinkingStep(
                title="Analyzing question",
                content="Understanding what information is needed...",
                status="in_progress",
            ).model_dump(),
        }

        try:
            # First API call - may include tool use
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                system=self.system_prompt,
                tools=self.tools,
                messages=conversation,
            )

            # Update thinking step
            yield {
                "type": "thinking",
                "step": ThinkingStep(
                    title="Analyzing question",
                    content="Understanding what information is needed...",
                    status="complete",
                ).model_dump(),
            }

            # Process response - handle tool use
            while response.stop_reason == "tool_use":
                # Find tool use blocks
                tool_uses = [
                    block for block in response.content if block.type == "tool_use"
                ]

                for tool_use in tool_uses:
                    if tool_use.name == "web_search":
                        query = tool_use.input.get("query", "")

                        # Emit tool call event
                        yield {"type": "tool_call", "tool": "web_search", "query": query}

                        # Emit thinking step for search
                        yield {
                            "type": "thinking",
                            "step": ThinkingStep(
                                title="Searching the web",
                                content=f'Looking up: "{query}"',
                                status="in_progress",
                            ).model_dump(),
                        }

                        # Execute search
                        sources = await self.search_web(query)
                        all_sources.extend(sources)

                        # Emit tool result
                        yield {
                            "type": "tool_result",
                            "results": [s.model_dump() for s in sources],
                        }

                        # Update thinking step
                        yield {
                            "type": "thinking",
                            "step": ThinkingStep(
                                title="Searching the web",
                                content=f'Found {len(sources)} results for "{query}"',
                                status="complete",
                            ).model_dump(),
                        }

                        # Build tool result for Claude
                        tool_result_content = json.dumps(
                            [
                                {
                                    "title": s.title,
                                    "url": s.url,
                                    "content": s.snippet,
                                }
                                for s in sources
                            ]
                        )

                        # Continue conversation with tool result
                        conversation.append(
                            {"role": "assistant", "content": response.content}
                        )
                        conversation.append(
                            {
                                "role": "user",
                                "content": [
                                    {
                                        "type": "tool_result",
                                        "tool_use_id": tool_use.id,
                                        "content": tool_result_content,
                                    }
                                ],
                            }
                        )

                # Continue with next response
                response = await self.client.messages.create(
                    model=self.model,
                    max_tokens=4096,
                    system=self.system_prompt,
                    tools=self.tools,
                    messages=conversation,
                )

            # Emit thinking step for composing answer
            yield {
                "type": "thinking",
                "step": ThinkingStep(
                    title="Composing answer",
                    content="Synthesizing information...",
                    status="in_progress",
                ).model_dump(),
            }

            # Extract final text content
            for block in response.content:
                if hasattr(block, "text"):
                    final_content = block.text
                    break

            # Update thinking step
            yield {
                "type": "thinking",
                "step": ThinkingStep(
                    title="Composing answer",
                    content="Synthesizing information...",
                    status="complete",
                ).model_dump(),
            }

            # Stream content in chunks for typing effect
            chunk_size = 20
            for i in range(0, len(final_content), chunk_size):
                chunk = final_content[i : i + chunk_size]
                yield {"type": "content", "delta": chunk}

            # Emit sources if any
            if all_sources:
                yield {"type": "sources", "sources": [s.model_dump() for s in all_sources]}

            # Emit complete event
            yield {
                "type": "complete",
                "content": final_content,
                "thinking_steps": [s.model_dump() for s in thinking_steps],
                "sources": [s.model_dump() for s in all_sources],
            }

        except Exception as e:
            yield {"type": "error", "message": str(e)}
