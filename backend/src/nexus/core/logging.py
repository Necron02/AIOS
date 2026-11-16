"""
NEXUS Logging Module

Structured logging configuration with JSON formatting for production,
human-readable for development.
"""

import logging
import sys

from .settings import get_settings


class NexusFormatter(logging.Formatter):
    """Custom formatter with structured output."""

    def format(self, record: logging.LogRecord) -> str:
        # Add extra fields to the log record
        log_data = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Add extra attributes if present
        for key, value in record.__dict__.items():
            if key not in {
                "name",
                "msg",
                "args",
                "created",
                "filename",
                "funcName",
                "levelname",
                "levelno",
                "lineno",
                "module",
                "msecs",
                "message",
                "pathname",
                "process",
                "processName",
                "relativeCreated",
                "thread",
                "threadName",
                "exc_info",
                "exc_text",
                "stack_info",
                "getMessage",
            }:
                log_data[key] = value

        # Format as key=value pairs for readability
        parts = [f"{k}={v!r}" for k, v in log_data.items()]
        return " ".join(parts)


def setup_logging(level: str | None = None) -> None:
    """Configure application logging."""
    settings = get_settings()
    log_level = level or settings.log_level

    # Clear existing handlers
    root_logger = logging.getLogger()
    root_logger.handlers.clear()

    # Set level
    root_logger.setLevel(getattr(logging, log_level))

    # Console handler with custom formatter
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, log_level))
    console_handler.setFormatter(NexusFormatter())
    root_logger.addHandler(console_handler)

    # Reduce noise from third-party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("watchdog").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance."""
    return logging.getLogger(name)
