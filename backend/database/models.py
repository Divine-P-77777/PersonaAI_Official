from __future__ import annotations

import enum
from typing import Optional

from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import declarative_base, relationship, Mapped
from sqlalchemy.sql import func

Base = declarative_base()


# ---------------------------------------------------------------------------
# Enums — keep in sync with supabase_schema.sql
# ---------------------------------------------------------------------------


class UserRole(str, enum.Enum):
    user   = "user"
    alumni = "alumni"


class BotStatus(str, enum.Enum):
    draft    = "draft"
    training = "training"
    ready    = "ready"
    failed   = "failed"


class SourceType(str, enum.Enum):
    pdf        = "pdf"
    image      = "image"
    long_text  = "long_text"
    web_link   = "web_link"
    video_link = "video_link"


class IngestionStatus(str, enum.Enum):
    pending    = "pending"
    processing = "processing"
    completed  = "completed"
    failed     = "failed"


class MessageRole(str, enum.Enum):
    user      = "user"
    assistant = "assistant"
    system    = "system"


# ---------------------------------------------------------------------------
# Model: User
# ---------------------------------------------------------------------------


class User(Base):
    """
    Mirrors auth.users — stores role-based onboarding data.

    `role` distinguishes a regular `user` from an `alumni` who can create bots.
    `onboarding_completed` is flipped once the signup multi-step form is done.
    """

    __tablename__ = "users"

    id                   = Column(UUID(as_uuid=True), primary_key=True)
    email                = Column(Text, unique=True, nullable=False)
    display_name         = Column(Text)
    avatar_url           = Column(Text)
    role                 = Column(Enum(UserRole), nullable=False, default=UserRole.user)
    onboarding_completed = Column(Boolean, nullable=False, default=False)
    created_at           = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at           = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    bots: Mapped[list[Bot]] = relationship("Bot", back_populates="owner", cascade="all, delete-orphan")


# ---------------------------------------------------------------------------
# Model: Bot
# ---------------------------------------------------------------------------


class Bot(Base):
    """
    Persona created by an alumni / professional.

    `persona_config` is a flexible JSON blob that stores the form data
    submitted during onboarding (greeting, tone, expertise, experience, etc.).
    """

    __tablename__ = "bots"
    __table_args__ = (Index("bots_owner_id_idx", "owner_id"),)

    id             = Column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    owner_id       = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name           = Column(Text, nullable=False)
    description    = Column(Text)
    persona_config = Column(JSONB, nullable=False, default=dict)
    status         = Column(Enum(BotStatus), nullable=False, default=BotStatus.draft)
    created_at     = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at     = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    owner: Mapped[User] = relationship("User", back_populates="bots")
    ingestion_batches: Mapped[list[IngestionBatch]] = relationship(
        "IngestionBatch", back_populates="bot", cascade="all, delete-orphan"
    )
    data_sources: Mapped[list[DataSource]] = relationship(
        "DataSource", back_populates="bot", cascade="all, delete-orphan"
    )


# ---------------------------------------------------------------------------
# Model: IngestionBatch
# ---------------------------------------------------------------------------


class IngestionBatch(Base):
    """
    Groups a set of DataSources submitted together in one dashboard upload.

    An alumni can upload N items (PDFs, links, text blocks) simultaneously —
    they all share the same batch_id for progress tracking.
    """

    __tablename__ = "ingestion_batches"
    __table_args__ = (Index("ingestion_batches_bot_id_idx", "bot_id"),)

    id              = Column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    bot_id          = Column(UUID(as_uuid=True), ForeignKey("bots.id", ondelete="CASCADE"), nullable=False)
    status          = Column(Enum(IngestionStatus), nullable=False, default=IngestionStatus.pending)
    total_files     = Column(Integer, nullable=False, default=0)
    processed_files = Column(Integer, nullable=False, default=0)
    error_log       = Column(JSONB, default=list)          # list of {"source_id": ..., "error": "..."}
    created_at      = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at      = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    bot: Mapped[Bot] = relationship("Bot", back_populates="ingestion_batches")
    data_sources: Mapped[list[DataSource]] = relationship("DataSource", back_populates="batch")


# ---------------------------------------------------------------------------
# Model: DataSource
# ---------------------------------------------------------------------------


class DataSource(Base):
    """
    Replaces the old `documents` table.

    One row per ingested item — PDF, image, raw text block, web URL, or video
    link. Multiple rows of the same `type` are allowed per bot (array of
    uploads). The `type` column drives which processor is invoked.

    Column semantics by type:
        pdf        → storage_path, file_size populated; content/url = NULL
        image      → storage_path, file_size populated; content/url = NULL
        long_text  → content populated; storage_path/url = NULL
        web_link   → url populated; storage_path/content = NULL
        video_link → url populated; storage_path/content = NULL (future)
    """

    __tablename__ = "data_sources"
    __table_args__ = (
        Index("data_sources_bot_id_idx",   "bot_id"),
        Index("data_sources_batch_id_idx", "batch_id"),
        Index("data_sources_status_idx",   "status"),
    )

    id            = Column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    bot_id        = Column(UUID(as_uuid=True), ForeignKey("bots.id", ondelete="CASCADE"), nullable=False)
    batch_id      = Column(UUID(as_uuid=True), ForeignKey("ingestion_batches.id", ondelete="SET NULL"), nullable=True)
    type          = Column(Enum(SourceType), nullable=False)
    title         = Column(Text, nullable=False)  # filename, URL, or first 80 chars of text
    content       = Column(Text)                  # for long_text
    url           = Column(Text)                  # for web_link / video_link
    storage_path  = Column(Text)                  # Supabase Storage path for pdf / image
    file_size     = Column(BigInteger)            # bytes
    status        = Column(Enum(IngestionStatus), nullable=False, default=IngestionStatus.pending)
    error_message = Column(Text)
    extra_metadata = Column("metadata", JSONB, nullable=False, default=dict)
    created_at    = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at    = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    bot: Mapped[Bot] = relationship("Bot", back_populates="data_sources")
    batch: Mapped[Optional[IngestionBatch]] = relationship("IngestionBatch", back_populates="data_sources")
    chunks: Mapped[list[DataChunk]] = relationship("DataChunk", back_populates="source", cascade="all, delete-orphan")


# Model: DataChunk

class DataChunk(Base):
    """
    Processed text chunk from any DataSource.

    The `embedding` column uses pgvector (Nomic V2-MoE, 768 dims).
    All similarity searches filter on `bot_id` for multi-tenant safety.
    """

    __tablename__ = "data_chunks"
    __table_args__ = (
        Index("data_chunks_bot_id_idx",        "bot_id"),
        Index("data_chunks_data_source_id_idx", "data_source_id"),
    )

    id             = Column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    data_source_id = Column(UUID(as_uuid=True), ForeignKey("data_sources.id", ondelete="CASCADE"), nullable=False)
    bot_id         = Column(UUID(as_uuid=True), ForeignKey("bots.id", ondelete="CASCADE"), nullable=False)
    chunk_index    = Column(Integer, nullable=False)
    content        = Column(Text, nullable=False)
    embedding      = Column(Vector(768))    # populated after embedding worker runs
    extra_metadata = Column("metadata", JSONB, nullable=False, default=dict)
    created_at     = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    source: Mapped[DataSource] = relationship("DataSource", back_populates="chunks")
