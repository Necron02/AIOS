"""
Backend Health Endpoint Tests

Tests for /api/health and /api/version endpoints.
"""

import os
from collections.abc import AsyncGenerator

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text

from nexus.core.settings import reset_settings_cache
from nexus.db.session import close_db, get_db, init_db
from nexus.main import create_app


@pytest.fixture(scope="session")
def app() -> FastAPI:
    """Create test app with in-memory database."""
    reset_settings_cache()
    # Set env vars for test settings
    os.environ["NEXUS_DB_PATH"] = ":memory:"
    os.environ["NEXUS_DATA_DIR"] = ":memory:"

    app = create_app()
    return app


@pytest.fixture(scope="session")
async def client(app: FastAPI) -> AsyncGenerator[AsyncClient, None]:
    """Create test client."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client


@pytest.fixture(scope="function", autouse=True)
async def setup_db(app: FastAPI) -> AsyncGenerator[None, None]:
    """Set up database for each test."""
    await init_db()
    yield
    await close_db()


class TestHealthEndpoint:
    """Tests for /api/health endpoint."""

    async def test_health_returns_ok(self, client: AsyncClient) -> None:
        """Health endpoint returns 200 with healthy status."""
        response = await client.get("/api/health")
        assert response.status_code == 200

        data = response.json()
        assert data["status"] == "healthy"
        assert data["database"] == "healthy"
        assert "version" in data
        assert "timestamp" in data

    async def test_health_version_matches(self, client: AsyncClient) -> None:
        """Health endpoint version matches app version."""
        response = await client.get("/api/health")
        data = response.json()
        assert data["version"] == "0.1.0"

    async def test_liveness_endpoint(self, client: AsyncClient) -> None:
        """Liveness endpoint returns alive status."""
        response = await client.get("/api/health/liveness")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "alive"

    async def test_readiness_endpoint(self, client: AsyncClient) -> None:
        """Readiness endpoint returns ready when DB is accessible."""
        response = await client.get("/api/health/readiness")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ready"


class TestVersionEndpoint:
    """Tests for /api/version endpoint."""

    async def test_version_returns_info(self, client: AsyncClient) -> None:
        """Version endpoint returns version info."""
        response = await client.get("/api/version")
        assert response.status_code == 200

        data = response.json()
        assert data["version"] == "0.1.0"
        assert data["name"] == "NEXUS"
        assert "description" in data


class TestDatabaseConnectivity:
    """Tests for database connectivity."""

    async def test_db_session_works(self) -> None:
        """Database session can execute queries."""
        async for db in get_db():
            result = await db.execute(text("SELECT 1 as test"))
            row = result.fetchone()
            assert row is not None
            assert row.test == 1

    async def test_db_foreign_keys_enabled(self) -> None:
        """Foreign keys are enabled on SQLite connection."""
        async for db in get_db():
            result = await db.execute(text("PRAGMA foreign_keys"))
            row = result.fetchone()
            assert row is not None
            assert row[0] == 1

    async def test_db_wal_mode(self) -> None:
        """WAL mode is enabled."""
        async for db in get_db():
            result = await db.execute(text("PRAGMA journal_mode"))
            row = result.fetchone()
            assert row is not None
            assert row[0].lower() == "wal"
