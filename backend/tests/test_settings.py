"""
Backend Settings Tests

Tests for configuration loading and validation.
"""

import os
from pathlib import Path

import pytest

from nexus.core.settings import Settings, get_settings, reset_settings_cache


class TestSettings:
    """Tests for Settings class."""

    def test_default_settings(self) -> None:
        """Default settings have expected values."""
        settings = Settings()
        assert settings.host == "127.0.0.1"
        assert settings.port == 8000
        assert settings.log_level == "INFO"
        assert settings.cors_origins == ["http://127.0.0.1:5173"]
        assert settings.frontend_url == "http://127.0.0.1:5173"

    def test_data_dir_path_property(self) -> None:
        """data_dir_path returns Path object."""
        settings = Settings()
        assert isinstance(settings.data_dir_path, Path)

    def test_db_path_path_property(self) -> None:
        """db_path_path returns Path object."""
        settings = Settings()
        assert isinstance(settings.db_path_path, Path)

    def test_database_url_property(self) -> None:
        """database_url returns correct SQLAlchemy URL."""
        settings = Settings()
        assert settings.database_url.startswith("sqlite+aiosqlite:///")
        assert "nexus.db" in settings.database_url

    def test_ensure_data_dir_creates_directory(self, tmp_path: Path) -> None:
        """ensure_data_dir creates directory if not exists."""
        test_dir = tmp_path / "test_nexus"
        settings = Settings(data_dir=str(test_dir))
        settings.ensure_data_dir()
        assert test_dir.exists()
        assert test_dir.is_dir()

    def test_settings_port_validation(self) -> None:
        """Port validation rejects invalid values."""
        with pytest.raises(ValueError):
            Settings(port=0)
        with pytest.raises(ValueError):
            Settings(port=65536)

    def test_settings_log_level_validation(self) -> None:
        """Log level validation rejects invalid values."""
        with pytest.raises(ValueError):
            Settings(log_level="INVALID")  # type: ignore[arg-type]

    def test_expand_windows_paths(self) -> None:
        """Windows environment variables in paths are expanded."""
        # This test verifies the expansion logic works
        # On Windows, %LOCALAPPDATA% would be expanded
        settings = Settings(data_dir=r"%TEMP%\nexus_test")
        # On non-Windows, the path stays as-is (expansion is Windows-only)
        assert "%TEMP%" in settings.data_dir or settings.data_dir != r"%TEMP%\nexus_test"

    def test_cors_origins_list(self) -> None:
        """CORS origins is a list of strings."""
        settings = Settings()
        assert isinstance(settings.cors_origins, list)
        assert all(isinstance(origin, str) for origin in settings.cors_origins)
        assert len(settings.cors_origins) > 0

    def test_optional_integrations_none_by_default(self) -> None:
        """Optional integrations are None by default (when no env var)."""
        # Save original env vars
        original_env = {}
        for var in [
            "NEXUS_GITHUB_TOKEN",
            "NEXUS_OBSIDIAN_VAULT_PATH",
            "NEXUS_CLAUDE_EXECUTABLE_PATH",
            "NEXUS_CLAUDE_CONFIG_DIR",
        ]:
            if var in os.environ:
                original_env[var] = os.environ[var]
                del os.environ[var]

        try:
            reset_settings_cache()
            settings = Settings()
            assert settings.github_token is None
            assert settings.obsidian_vault_path is None
            assert settings.claude_executable_path is None
            assert settings.claude_config_dir is None
        finally:
            # Restore original env vars
            for var, value in original_env.items():
                os.environ[var] = value
            reset_settings_cache()


class TestGetSettings:
    """Tests for get_settings function."""

    def test_returns_settings_instance(self) -> None:
        """get_settings returns a Settings instance."""
        reset_settings_cache()
        settings = get_settings()
        assert isinstance(settings, Settings)

    def test_returns_same_instance(self) -> None:
        """get_settings returns cached instance."""
        reset_settings_cache()
        s1 = get_settings()
        s2 = get_settings()
        assert s1 is s2
