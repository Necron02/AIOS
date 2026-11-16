"""
NEXUS Database Module

SQLAlchemy 2.x engine, session factory, base model, and migration support.
"""

from .base import Base
from .models import (
    ActivityEvent,
    MigrationSanityCheck,
    ObsidianSyncOutbox,
    Resource,
    ResourceType,
    Setting,
)
from .session import close_db, get_db, get_engine, get_session_factory, init_db

__all__ = [
    "Base",
    "get_engine",
    "get_session_factory",
    "get_db",
    "init_db",
    "close_db",
    "ResourceType",
    "Resource",
    "Setting",
    "ActivityEvent",
    "ObsidianSyncOutbox",
    "MigrationSanityCheck",
]
