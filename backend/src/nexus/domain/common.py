"""
NEXUS Domain Common Types

Shared enums and value objects.
"""

from enum import Enum


class HealthStatus(str, Enum):
    """Health check status values."""

    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    UNKNOWN = "unknown"


class ResourceStatus(str, Enum):
    """Generic resource status values."""

    ACTIVE = "active"
    INACTIVE = "inactive"
    ARCHIVED = "archived"
    ERROR = "error"
