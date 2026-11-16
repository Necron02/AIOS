"""
NEXUS API Router

Main API router with versioned endpoints.
"""

from fastapi import APIRouter, Request

from nexus.api.health import router as health_router
from nexus.api.version import router as version_router
from nexus.core.settings import get_settings

api_router = APIRouter()

# Include versioned routers
api_router.include_router(health_router, prefix="/health", tags=["health"])
api_router.include_router(version_router, prefix="/version", tags=["version"])


@api_router.get("/")
async def api_root(request: Request) -> dict[str, str]:
    """API root endpoint."""
    return {
        "name": "NEXUS API",
        "version": get_settings().__dict__.get("_version", "0.1.0"),
        "docs": request.url_for("swagger_ui_html")._url if hasattr(request, "url_for") else "/docs",
    }
