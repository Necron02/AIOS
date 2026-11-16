"""
NEXUS Version API

Version information endpoint.
"""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class VersionResponse(BaseModel):
    """Version information response schema."""

    version: str
    name: str
    description: str


@router.get("", response_model=VersionResponse)
async def get_version() -> VersionResponse:
    """Get application version information."""
    return VersionResponse(
        version="0.1.0",
        name="NEXUS",
        description="Personal AI Development Environment — Local-first management dashboard",
    )
