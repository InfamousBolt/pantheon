import json
from uuid import UUID
from typing import AsyncGenerator
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.chat_service import ChatService
from app.agents.research_agent import ResearchAgent
from app.models.schemas import (
    ChatCreate,
    ChatResponse,
    ChatListResponse,
    MessageCreate,
    MessageResponse,
)

router = APIRouter(prefix="/api")


@router.post("/chats", response_model=ChatResponse)
async def create_chat(
    chat_data: ChatCreate = None,
    db: AsyncSession = Depends(get_db),
):
    """Create a new chat."""
    service = ChatService(db)
    title = chat_data.title if chat_data else None
    chat = await service.create_chat(title=title)
    return ChatResponse(
        id=chat.id,
        title=chat.title,
        created_at=chat.created_at,
        updated_at=chat.updated_at,
        messages=[],
    )


@router.get("/chats", response_model=list[ChatListResponse])
async def list_chats(db: AsyncSession = Depends(get_db)):
    """List all chats."""
    service = ChatService(db)
    chats = await service.list_chats()
    return [
        ChatListResponse(
            id=chat.id,
            title=chat.title,
            created_at=chat.created_at,
            updated_at=chat.updated_at,
        )
        for chat in chats
    ]


@router.get("/chats/{chat_id}", response_model=ChatResponse)
async def get_chat(chat_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get a chat with all messages."""
    service = ChatService(db)
    chat = await service.get_chat(chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    messages = [
        MessageResponse(
            id=msg.id,
            chat_id=msg.chat_id,
            role=msg.role,
            content=msg.content,
            thinking_steps=msg.thinking_steps or [],
            sources=msg.sources or [],
            created_at=msg.created_at,
        )
        for msg in chat.messages
    ]

    return ChatResponse(
        id=chat.id,
        title=chat.title,
        created_at=chat.created_at,
        updated_at=chat.updated_at,
        messages=messages,
    )


@router.delete("/chats/{chat_id}")
async def delete_chat(chat_id: UUID, db: AsyncSession = Depends(get_db)):
    """Delete a chat."""
    service = ChatService(db)
    deleted = await service.delete_chat(chat_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Chat not found")
    return {"status": "deleted"}


@router.delete("/chats")
async def delete_all_chats(db: AsyncSession = Depends(get_db)):
    """Delete all chats."""
    service = ChatService(db)
    count = await service.delete_all_chats()
    await db.commit()
    return {"status": "deleted", "count": count}


@router.patch("/chats/{chat_id}/title")
async def update_chat_title(
    chat_id: UUID,
    title: str,
    db: AsyncSession = Depends(get_db),
):
    """Update a chat's title."""
    service = ChatService(db)
    chat = await service.update_chat_title(chat_id, title)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return {"status": "updated", "title": chat.title}


async def generate_sse_events(
    chat_id: UUID,
    user_message: str,
    db: AsyncSession,
) -> AsyncGenerator[str, None]:
    """Generate SSE events for a chat message."""
    service = ChatService(db)
    agent = ResearchAgent()

    # Get existing messages for context
    messages = await service.get_chat_messages(chat_id)
    message_history = [
        {"role": msg.role, "content": msg.content}
        for msg in messages
    ]

    # Save user message
    await service.add_message(chat_id, "user", user_message)
    await db.commit()

    # Track response data
    final_content = ""
    all_thinking_steps = []
    all_sources = []

    try:
        async for event in agent.generate_response(message_history, user_message):
            event_type = event.get("type")

            if event_type == "thinking":
                all_thinking_steps.append(event["step"])
                yield f"event: thinking\ndata: {json.dumps(event)}\n\n"

            elif event_type == "tool_call":
                yield f"event: tool_call\ndata: {json.dumps(event)}\n\n"

            elif event_type == "tool_result":
                yield f"event: tool_result\ndata: {json.dumps(event)}\n\n"

            elif event_type == "content":
                yield f"event: content\ndata: {json.dumps(event)}\n\n"

            elif event_type == "sources":
                all_sources = event["sources"]
                yield f"event: sources\ndata: {json.dumps(event)}\n\n"

            elif event_type == "complete":
                final_content = event["content"]
                # Save assistant message
                assistant_msg = await service.add_message(
                    chat_id,
                    "assistant",
                    final_content,
                    thinking_steps=all_thinking_steps,
                    sources=all_sources,
                )
                await db.commit()

                # Auto-generate title if this is the first exchange
                if len(messages) == 0:
                    # Use first 50 chars of user message as title
                    title = user_message[:50] + ("..." if len(user_message) > 50 else "")
                    await service.update_chat_title(chat_id, title)
                    await db.commit()

                yield f"event: complete\ndata: {json.dumps({'message_id': str(assistant_msg.id)})}\n\n"

            elif event_type == "error":
                yield f"event: error\ndata: {json.dumps(event)}\n\n"

    except Exception as e:
        yield f"event: error\ndata: {json.dumps({'message': str(e)})}\n\n"


@router.post("/chats/{chat_id}/messages")
async def send_message(
    chat_id: UUID,
    message: MessageCreate,
    db: AsyncSession = Depends(get_db),
):
    """Send a message and stream the response via SSE."""
    service = ChatService(db)
    chat = await service.get_chat(chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    return StreamingResponse(
        generate_sse_events(chat_id, message.content, db),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
