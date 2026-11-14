"""
NEXUS Database Models

SQLAlchemy 2.x models for core tables.
"""

import uuid
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import JSON, DateTime, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from nexus.db.base import Base, IdMixin, TimestampMixin


def generate_uuid() -> str:
    """Generate a UUID string."""
    return str(uuid.uuid4())


def utc_now() -> datetime:
    """Get current UTC datetime."""
    return datetime.now(UTC)


class ResourceType(Base, TimestampMixin):
    """Resource type registry (built-in + user-defined)."""

    __tablename__ = "resource_types"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    key: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    label: Mapped[str] = mapped_column(String(200), nullable=False)
    is_builtin: Mapped[bool] = mapped_column(default=False, nullable=False)

    def __repr__(self) -> str:
        return f"<ResourceType(key={self.key})>"


class Resource(Base, TimestampMixin):
    """Central identity for every resource."""

    __tablename__ = "resources"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    resource_type_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    source_kind: Mapped[str] = mapped_column(String(50), nullable=False)
    source_path: Mapped[str | None] = mapped_column(String(1000), nullable=True, index=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index("idx_resources_name", "name"),
        Index("idx_resources_status", "status"),
        Index("idx_resources_source_path", "source_path"),
    )

    def __repr__(self) -> str:
        return f"<Resource(id={self.id}, name={self.name})>"


class Setting(Base):
    """Application settings (no secrets)."""

    __tablename__ = "settings"

    key: Mapped[str] = mapped_column(String(200), primary_key=True)
    value_json: Mapped[Any] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    def __repr__(self) -> str:
        return f"<Setting(key={self.key})>"


class ActivityEvent(Base, TimestampMixin, IdMixin):
    """Append-only activity event log."""

    __tablename__ = "activity_events"

    id: Mapped[int] = mapped_column(primary_key=False, nullable=True)
    uuid: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    resource_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False, index=True
    )
    actor: Mapped[str] = mapped_column(String(50), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    payload_json: Mapped[Any | None] = mapped_column(JSON, nullable=True)
    schema_version: Mapped[int] = mapped_column(default=1, nullable=False)

    __table_args__ = (
        Index("idx_activity_events_type", "event_type"),
        Index("idx_activity_events_resource", "resource_id"),
        Index("idx_activity_events_occurred", "occurred_at"),
    )

    def __repr__(self) -> str:
        return f"<ActivityEvent(type={self.event_type}, resource={self.resource_id})>"


class ObsidianSyncOutbox(Base, TimestampMixin, IdMixin):
    """Obsidian sync outbox for retryable writes."""

    __tablename__ = "obsidian_sync_outbox"

    id: Mapped[int] = mapped_column(primary_key=False, nullable=True)
    uuid: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    event_id: Mapped[str] = mapped_column(String(36), unique=True, nullable=False)
    target_path: Mapped[str] = mapped_column(String(500), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False, index=True)
    attempt_count: Mapped[int] = mapped_column(default=0, nullable=False)
    next_attempt_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, index=True
    )
    last_error: Mapped[str | None] = mapped_column(Text, nullable=True)
    synced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index("idx_outbox_status", "status"),
        Index("idx_outbox_next_attempt", "next_attempt_at"),
    )

    def __repr__(self) -> str:
        return f"<ObsidianSyncOutbox(event_id={self.event_id}, status={self.status})>"


class MigrationSanityCheck(Base, IdMixin, TimestampMixin):
    """Simple table to verify migrations work."""

    __tablename__ = "migration_sanity_check"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    applied_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )

    def __repr__(self) -> str:
        return f"<MigrationSanityCheck(description={self.description})>"
