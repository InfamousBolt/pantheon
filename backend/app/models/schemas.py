from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field


class ThinkingStep(BaseModel):
    title: str
    content: str
    status: str = "complete"  # "pending", "in_progress", "complete"


class Source(BaseModel):
    url: str
    title: str
    domain: str
    snippet: Optional[str] = None


class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1)


class MessageResponse(BaseModel):
    id: UUID
    chat_id: UUID
    role: str
    content: str
    thinking_steps: list[ThinkingStep] = []
    sources: list[Source] = []
    created_at: datetime

    class Config:
        from_attributes = True


class ChatCreate(BaseModel):
    title: Optional[str] = None


class ChatResponse(BaseModel):
    id: UUID
    title: Optional[str]
    created_at: datetime
    updated_at: datetime
    messages: list[MessageResponse] = []

    class Config:
        from_attributes = True


class ChatListResponse(BaseModel):
    id: UUID
    title: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# SSE Event schemas
class SSEThinkingEvent(BaseModel):
    step: ThinkingStep


class SSEToolCallEvent(BaseModel):
    tool: str
    query: str


class SSEToolResultEvent(BaseModel):
    results: list[Source]


class SSEContentEvent(BaseModel):
    delta: str


class SSESourcesEvent(BaseModel):
    sources: list[Source]


class SSECompleteEvent(BaseModel):
    message_id: str


class SSEErrorEvent(BaseModel):
    message: str
