import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, ForeignKey, Integer, CheckConstraint, Sequence
from sqlalchemy.dialects.postgresql import UUID, JSONB, TIMESTAMP
from sqlalchemy.orm import relationship
from app.database import Base


class Chat(Base):
    __tablename__ = "chats"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    updated_at = Column(TIMESTAMP(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    messages = relationship("Message", back_populates="chat", cascade="all, delete-orphan", order_by="Message.sequence_num")


# Sequence for message ordering
message_sequence = Sequence('messages_sequence_num_seq')


class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chat_id = Column(UUID(as_uuid=True), ForeignKey("chats.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    thinking_steps = Column(JSONB, default=list)
    sources = Column(JSONB, default=list)
    created_at = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    sequence_num = Column(Integer, message_sequence, server_default=message_sequence.next_value())

    chat = relationship("Chat", back_populates="messages")

    __table_args__ = (
        CheckConstraint("role IN ('user', 'assistant')", name="check_role"),
    )
