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
# Payment-related Enums (keep in sync with pricing_config.py tier_ids)
# ---------------------------------------------------------------------------

class PricingTierEnum(str, enum.Enum):
    starter  = "starter"
    standard = "standard"
    premium  = "premium"


class AccessStatus(str, enum.Enum):
    free_trial = "free_trial"
    unlocked   = "unlocked"
    expired    = "expired"


class PaymentStatus(str, enum.Enum):
    pending  = "pending"
    success  = "success"
    failed   = "failed"
    refunded = "refunded"


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

    Monetization fields:
        is_free          → True means users can chat without paying
        pricing_tier     → The platform preset selected by the mentor (see pricing_config.py)
        unlock_price     → Final price in ₹ (may differ from tier default within allowed band)
        credits_per_pack → Number of credits a user receives upon unlock
        voice_enabled    → Whether ElevenLabs/Sarvam TTS is enabled for this bot
        subscription_enabled → Future: allow recurring monthly subscription unlocks
    """

    __tablename__ = "bots"
    __table_args__ = (Index("bots_owner_id_idx", "owner_id"),)

    id             = Column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    owner_id       = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name           = Column(Text, nullable=False)
    description    = Column(Text)
    persona_config = Column(JSONB, nullable=False, default=dict)
    status         = Column(Enum(BotStatus), nullable=False, default=BotStatus.draft)
    voice_gender   = Column(Text, nullable=False, default="female")

    # --- Monetization ---
    is_free              = Column(Boolean, nullable=False, default=True)
    pricing_tier         = Column(Enum(PricingTierEnum), nullable=True)       # NULL when is_free=True
    unlock_price         = Column(Integer, nullable=True)                      # ₹ amount; NULL when free
    credits_per_pack     = Column(Integer, nullable=True)                      # Credits granted on unlock
    voice_enabled        = Column(Boolean, nullable=False, default=False)
    subscription_enabled = Column(Boolean, nullable=False, default=False)

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


# Model: Message

class Message(Base):
    """
    Stores persistent chat history between a user and a bot.
    Used for context window memory in LLM prompts.
    """

    __tablename__ = "messages"
    __table_args__ = (
        Index("messages_user_bot_idx", "user_id", "bot_id", "created_at"),
    )

    id         = Column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    bot_id     = Column(UUID(as_uuid=True), ForeignKey("bots.id", ondelete="CASCADE"), nullable=False)
    role       = Column(Enum(MessageRole), nullable=False)
    content    = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


# ---------------------------------------------------------------------------
# Model: UserMonthlyExploration
# ---------------------------------------------------------------------------

class UserMonthlyExploration(Base):
    """
    Tracks how many distinct mentor bots a user has explored in a calendar month.

    Free exploration rules (see payments/pricing_config.py → FREE_EXPLORATION):
      - Users may explore up to FREE_EXPLORATION.max_mentors_per_month bots/month.
      - Each explored bot gets FREE_EXPLORATION.free_credits_per_mentor credits
        automatically via a UserBotAccess row created with status=free_trial.

    One row per (user_id, month) pair.  `month` is stored as 'YYYY-MM' string.
    """

    __tablename__ = "user_monthly_explorations"
    __table_args__ = (
        Index("ume_user_month_idx", "user_id", "month", unique=True),
    )

    id               = Column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    user_id          = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    month            = Column(Text, nullable=False)         # 'YYYY-MM'
    mentors_explored = Column(JSONB, nullable=False, default=list)  # list of bot_id strings
    created_at       = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at       = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


# ---------------------------------------------------------------------------
# Model: UserBotAccess
# ---------------------------------------------------------------------------

class UserBotAccess(Base):
    """
    Tracks a user's credit-based access to a specific mentor bot.

    Lifecycle:
      1. Free trial  → created automatically on first exploration (status=free_trial)
      2. Unlocked    → created/updated on successful Cashfree payment  (status=unlocked)
      3. Expired     → access_expires_at has passed  (status=expired)

    Credit semantics:
      `credits_allowed` = number of credits granted (from pricing_config.py)
      `credits_used`    = running total of credits consumed

    Credit costs per action type are defined in CREDIT_COSTS (pricing_config.py).
    E.g., one voice_session turn consumes 5 credits, one text_message consumes 1.

    access_expires_at:
      Set at unlock time based on tier expiry_days.
      For free_trial rows, expiry is also set so trials don't accumulate indefinitely.
    """

    __tablename__ = "user_bot_access"
    __table_args__ = (
        Index("uba_user_bot_idx", "user_id", "bot_id", unique=True),
        Index("uba_status_idx",   "status"),
    )

    id                = Column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    user_id           = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    bot_id            = Column(UUID(as_uuid=True), ForeignKey("bots.id", ondelete="CASCADE"), nullable=False)
    status            = Column(Enum(AccessStatus), nullable=False, default=AccessStatus.free_trial)
    credits_allowed   = Column(Integer, nullable=False)
    credits_used      = Column(Integer, nullable=False, default=0)
    access_expires_at = Column(DateTime(timezone=True), nullable=True)   # NULL = no expiry (internal/test use)
    created_at        = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at        = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


# ---------------------------------------------------------------------------
# Model: PaymentTransaction
# ---------------------------------------------------------------------------

class PaymentTransaction(Base):
    """
    Stores every Cashfree payment attempt and its outcome.

    Security rules:
      - `status` is ONLY set to 'success' by the webhook handler after
        cryptographic signature verification via cashfree.verify_webhook_signature().
      - Frontend callbacks must NEVER directly trigger access grants.
      - `verified_at` is the timestamp of webhook-based verification.

    `order_id` is our internal UUID-based string sent to Cashfree as their order_id.
    `cf_order_id` is Cashfree's own identifier (populated on order creation response).
    `cf_payment_id` is populated by the webhook payload.
    """

    __tablename__ = "payment_transactions"
    __table_args__ = (
        Index("pt_user_id_idx",  "user_id"),
        Index("pt_bot_id_idx",   "bot_id"),
        Index("pt_order_id_idx", "order_id", unique=True),
        Index("pt_status_idx",   "status"),
    )

    id               = Column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    order_id         = Column(Text, unique=True, nullable=False)    # Our internal ID sent to Cashfree
    cf_order_id      = Column(Text, nullable=True)                  # Cashfree's cf_order_id (from creation response)
    cf_payment_id    = Column(Text, nullable=True)                  # Cashfree's payment_id (from webhook)
    payment_provider = Column(Text, nullable=False, default="cashfree")
    user_id          = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    bot_id           = Column(UUID(as_uuid=True), ForeignKey("bots.id", ondelete="SET NULL"), nullable=True)
    amount           = Column(Integer, nullable=False)              # ₹ (integer)
    currency         = Column(Text, nullable=False, default="INR")
    status           = Column(Enum(PaymentStatus), nullable=False, default=PaymentStatus.pending)
    webhook_payload  = Column(JSONB, nullable=True)                 # Full Cashfree webhook body for audit
    verified_at      = Column(DateTime(timezone=True), nullable=True)  # Set only after sig verification
    created_at       = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at       = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

# ---------------------------------------------------------------------------
# New Enums for Wallet System
# ---------------------------------------------------------------------------

class WalletTxnType(str, enum.Enum):
    """Type of wallet transaction."""
    topup          = "topup"
    unlock_spend   = "unlock_spend"
    refund         = "refund"
    mentor_earning = "mentor_earning"
    withdrawal     = "withdrawal"
    platform_fee   = "platform_fee"


class WithdrawalStatus(str, enum.Enum):
    pending    = "pending"
    processing = "processing"
    completed  = "completed"
    failed     = "failed"


# ---------------------------------------------------------------------------
# Model: UserWallet
# ---------------------------------------------------------------------------

class UserWallet(Base):
    """
    Each user has a single wallet holding their deposited INR balance.
    All amounts stored in PAISE (100 paise = 1 INR) for integer precision.
    """

    __tablename__ = "user_wallets"
    __table_args__ = (
        Index("uw_user_id_idx", "user_id", unique=True),
    )

    id                    = Column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    user_id               = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    balance_paise         = Column(BigInteger, nullable=False, default=0)
    lifetime_topup_paise  = Column(BigInteger, nullable=False, default=0)
    lifetime_spend_paise  = Column(BigInteger, nullable=False, default=0)
    created_at            = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at            = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


# ---------------------------------------------------------------------------
# Model: MentorWallet
# ---------------------------------------------------------------------------

class MentorWallet(Base):
    """
    Tracks a mentor's accumulated earnings from bot unlocks.
    Mentor gets 70% of each unlock price; platform keeps 30%.
    Withdrawal is allowed once pending_paise >= 50000 (Rs 500).
    """

    __tablename__ = "mentor_wallets"
    __table_args__ = (
        Index("mw_mentor_id_idx", "mentor_id", unique=True),
    )

    id                     = Column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    mentor_id              = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    pending_paise          = Column(BigInteger, nullable=False, default=0)
    total_earned_paise     = Column(BigInteger, nullable=False, default=0)
    total_withdrawn_paise  = Column(BigInteger, nullable=False, default=0)
    bank_account_number    = Column(Text, nullable=True)
    bank_ifsc              = Column(Text, nullable=True)
    bank_account_name      = Column(Text, nullable=True)
    created_at             = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at             = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


# ---------------------------------------------------------------------------
# Model: WalletTransaction
# ---------------------------------------------------------------------------

class WalletTransaction(Base):
    """
    Immutable ledger of every wallet event. Never updated, only inserted.
    amount_paise: Positive = money IN, Negative = money OUT.
    """

    __tablename__ = "wallet_transactions"
    __table_args__ = (
        Index("wt_user_id_idx", "user_id"),
        Index("wt_type_idx",    "txn_type"),
        Index("wt_created_idx", "created_at"),
    )

    id            = Column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    user_id       = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    txn_type      = Column(Enum(WalletTxnType), nullable=False)
    amount_paise  = Column(BigInteger, nullable=False)
    description   = Column(Text, nullable=True)
    reference_id  = Column(Text, nullable=True)
    meta          = Column(JSONB, nullable=True)
    created_at    = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
