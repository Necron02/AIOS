"""
NEXUS Settings Module

Pydantic Settings for validated configuration.
"""

import os
from pathlib import Path
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _expand_windows_path(path_str: str) -> str:
    """Expand Windows environment variables in a path string."""
    if path_str and "%" in path_str:
        return os.path.expandvars(path_str)
    return path_str


class Settings(BaseSettings):
    """Application settings with validation."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Server
    host: str = Field(default="127.0.0.1", description="Server bind address")
    port: int = Field(default=8000, ge=1, le=65535, description="Server port")

    # Data directory (runtime data - NOT in source control)
    data_dir: str = Field(
        default=r"%LOCALAPPDATA%\NEXUS",
        description="Runtime data directory (DB, logs, backups)",
    )

    # Database
    db_path: str = Field(
        default=r"%LOCALAPPDATA%\NEXUS\nexus.db",
        description="SQLite database path",
    )

    # Logging
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = Field(
        default="INFO", description="Log level"
    )

    # CORS
    cors_origins: list[str] = Field(
        default=["http://127.0.0.1:5173"],
        description="Allowed CORS origins (Vite dev server)",
    )

    # Frontend
    frontend_url: str = Field(
        default="http://127.0.0.1:5173",
        description="Frontend URL for dev proxy",
    )

    # Optional integrations
    github_token: str | None = Field(
        default=None, description="GitHub API token (use OS credential manager in prod)"
    )
    obsidian_vault_path: str | None = Field(
        default=None, description="Obsidian vault path for sync"
    )
    claude_executable_path: str | None = Field(
        default=None, description="Custom Claude Code executable path"
    )
    claude_config_dir: str | None = Field(
        default=None, description="CLAUDE_CONFIG_DIR override", alias="NEXUS_CLAUDE_CONFIG_DIR"
    )

    @field_validator("data_dir", "db_path", mode="before")
    @classmethod
    def expand_paths(cls, v: str) -> str:
        """Expand Windows environment variables in paths."""
        return _expand_windows_path(v)

    @property
    def data_dir_path(self) -> Path:
        """Data directory as Path object."""
        return Path(self.data_dir)

    @property
    def db_path_path(self) -> Path:
        """Database path as Path object."""
        return Path(self.db_path)

    @property
    def database_url(self) -> str:
        """SQLAlchemy database URL for SQLite."""
        return f"sqlite+aiosqlite:///{self.db_path_path}"

    def ensure_data_dir(self) -> None:
        """Create data directory if it doesn't exist."""
        self.data_dir_path.mkdir(parents=True, exist_ok=True)


_settings_cache: Settings | None = None


def get_settings() -> Settings:
    """Get cached settings instance."""
    global _settings_cache
    if _settings_cache is None:
        _settings_cache = Settings()
    return _settings_cache


def reset_settings_cache() -> None:
    """Reset the cached settings instance (for testing)."""
    global _settings_cache
    _settings_cache = None
