from uuid import UUID
from typing import Optional
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.database import Chat, Message


class ChatService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_chat(self, title: Optional[str] = None) -> Chat:
        """Create a new chat."""
        chat = Chat(title=title)
        self.db.add(chat)
        await self.db.flush()
        await self.db.refresh(chat)
        return chat

    async def get_chat(self, chat_id: UUID) -> Optional[Chat]:
        """Get a chat by ID with all messages."""
        result = await self.db.execute(
            select(Chat)
            .options(selectinload(Chat.messages))
            .where(Chat.id == chat_id)
        )
        return result.scalar_one_or_none()

    async def list_chats(self) -> list[Chat]:
        """List all chats ordered by updated_at descending."""
        result = await self.db.execute(
            select(Chat).order_by(desc(Chat.updated_at))
        )
        return list(result.scalars().all())

    async def delete_chat(self, chat_id: UUID) -> bool:
        """Delete a chat by ID."""
        chat = await self.get_chat(chat_id)
        if not chat:
            return False
        await self.db.delete(chat)
        await self.db.flush()
        return True

    async def delete_all_chats(self) -> int:
        """Delete all chats and return count of deleted chats."""
        result = await self.db.execute(select(Chat))
        chats = list(result.scalars().all())
        count = len(chats)
        for chat in chats:
            await self.db.delete(chat)
        await self.db.flush()
        return count

    async def update_chat_title(self, chat_id: UUID, title: str) -> Optional[Chat]:
        """Update a chat's title."""
        chat = await self.get_chat(chat_id)
        if not chat:
            return None
        chat.title = title
        await self.db.flush()
        await self.db.refresh(chat)
        return chat

    async def add_message(
        self,
        chat_id: UUID,
        role: str,
        content: str,
        thinking_steps: list = None,
        sources: list = None,
    ) -> Message:
        """Add a message to a chat."""
        message = Message(
            chat_id=chat_id,
            role=role,
            content=content,
            thinking_steps=thinking_steps or [],
            sources=sources or [],
        )
        self.db.add(message)
        await self.db.flush()
        await self.db.refresh(message)
        return message

    async def get_chat_messages(self, chat_id: UUID) -> list[Message]:
        """Get all messages for a chat."""
        result = await self.db.execute(
            select(Message)
            .where(Message.chat_id == chat_id)
            .order_by(Message.sequence_num)
        )
        return list(result.scalars().all())
