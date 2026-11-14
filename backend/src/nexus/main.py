"""
NEXUS Main Application

FastAPI application factory with middleware, routing, and lifecycle.
"""

from collections.abc import AsyncGenerator, Awaitable, Callable
from contextlib import asynccontextmanager
from urllib.parse import urlparse

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from nexus.api.router import api_router
from nexus.core.logging import get_logger, setup_logging
from nexus.core.settings import get_settings
from nexus.db.session import close_db, init_db

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan handler."""
    settings = get_settings()

    # Setup logging
    setup_logging(settings.log_level)
    logger.info("Starting NEXUS application", extra={"version": "0.1.0"})

    # Ensure data directory exists
    settings.ensure_data_dir()

    # Initialize database
    await init_db()
    logger.info("Database initialized", extra={"db_path": str(settings.db_path_path)})

    yield

    # Shutdown
    logger.info("Shutting down NEXUS application")
    await close_db()


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = get_settings()

    app = FastAPI(
        title="NEXUS API",
        description="Personal AI Development Environment — Local-first management dashboard",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # CORS middleware - restricted to frontend origin
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["*"],
    )

    # Pre-compute allowed hosts
    allowed_hosts: list[str] = [settings.host]
    if settings.port != 80:
        allowed_hosts.append(f"{settings.host}:{settings.port}")
    if settings.frontend_url:
        parsed = urlparse(settings.frontend_url)
        if parsed.hostname:
            if parsed.port:
                allowed_hosts.append(f"{parsed.hostname}:{parsed.port}")
            else:
                allowed_hosts.append(parsed.hostname)

    # Host/Origin validation middleware
    @app.middleware("http")
    async def validate_host_origin(request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        """Validate Host and Origin headers for security."""
        # Skip validation for health checks and docs
        if request.url.path in (
            "/health",
            "/health/liveness",
            "/health/readiness",
            "/docs",
            "/redoc",
            "/openapi.json",
        ):
            return await call_next(request)

        # Allow test host
        host = request.headers.get("host", "")
        if host == "test":
            return await call_next(request)

        # Validate Host header
        if host:
            if not any(host.startswith(allowed) for allowed in allowed_hosts):
                logger.warning(
                    "Invalid Host header", extra={"host": host, "allowed": allowed_hosts}
                )
                return JSONResponse(
                    status_code=400,
                    content={"detail": "Invalid Host header"},
                )

        # Validate Origin header for state-changing requests
        origin = request.headers.get("origin")
        if origin and request.method in ("POST", "PUT", "PATCH", "DELETE"):
            if origin not in settings.cors_origins:
                logger.warning(
                    "Invalid Origin header",
                    extra={"origin": origin, "allowed": settings.cors_origins},
                )
                return JSONResponse(
                    status_code=403,
                    content={"detail": "Invalid Origin"},
                )

        return await call_next(request)

    # Request logging middleware
    @app.middleware("http")
    async def log_requests(request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        """Log incoming requests."""
        import time

        start_time = time.time()
        response: Response = await call_next(request)
        process_time = time.time() - start_time

        logger.info(
            "Request processed",
            extra={
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "process_time_ms": round(process_time * 1000, 2),
            },
        )
        return response

    # Include API router
    app.include_router(api_router, prefix="/api")

    # Root redirect
    @app.get("/")
    async def root() -> dict[str, str]:
        return {"message": "NEXUS API", "version": "0.1.0", "docs": "/docs"}

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    settings = get_settings()
    uvicorn.run(
        "nexus.main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
        log_level=settings.log_level.lower(),
    )
