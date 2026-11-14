"""
NEXUS Health API

Health check endpoints for monitoring and load balancers.
"""

from datetime import UTC

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from nexus.core.settings import get_settings
from nexus.db.session import get_db
from nexus.domain.common import HealthStatus

router = APIRouter()


class HealthResponse(BaseModel):
    """Health check response schema."""

    status: HealthStatus
    version: str
    database: HealthStatus
    timestamp: str


@router.get("", response_model=HealthResponse)
async def health_check(db: AsyncSession = Depends(get_db)) -> HealthResponse:
    """
    Comprehensive health check.

    Returns overall status, version, and database connectivity.
    """
    from datetime import datetime

    settings = get_settings()
    db_status = HealthStatus.HEALTHY

    try:
        # Test database connectivity
        result = await db.execute(text("SELECT 1"))
        result.scalar_one()
    except Exception:
        db_status = HealthStatus.UNHEALTHY

    overall_status = (
        HealthStatus.HEALTHY if db_status == HealthStatus.HEALTHY else HealthStatus.UNHEALTHY
    )

    return HealthResponse(
        status=overall_status,
        version="0.1.0",
        database=db_status,
        timestamp=datetime.now(UTC).isoformat(),
    )


@router.get("/liveness", response_model=dict[str, str])
async def liveness() -> dict[str, str]:
    """
    Kubernetes-style liveness probe.

    Returns 200 if the process is alive, no dependency checks.
    """
    return {"status": "alive"}


@router.get("/readiness", response_model=dict[str, str])
async def readiness(db: AsyncSession = Depends(get_db)) -> dict[str, str]:
    """
    Kubernetes-style readiness probe.

    Returns 200 if ready to serve traffic (DB accessible).
    """
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "ready"}
    except Exception:
        raise HTTPException(status_code=503, detail="Not ready")
