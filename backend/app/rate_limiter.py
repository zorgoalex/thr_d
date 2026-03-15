"""Simple in-memory per-IP rate limiter."""

import time

from fastapi import Request

from app.errors import ApiError


class RateLimiter:
    def __init__(self, max_requests: int, window_seconds: int = 60) -> None:
        self._max = max_requests
        self._window = window_seconds
        self._requests: dict[str, list[float]] = {}

    def check(self, ip: str) -> None:
        now = time.monotonic()
        timestamps = self._requests.get(ip, [])
        # Prune old timestamps
        cutoff = now - self._window
        timestamps = [t for t in timestamps if t > cutoff]
        if len(timestamps) >= self._max:
            raise ApiError(
                code="RATE_LIMIT_EXCEEDED",
                message="Too many requests. Please try again later.",
                status_code=429,
            )
        timestamps.append(now)
        self._requests[ip] = timestamps


# Singletons for different endpoint groups
_validate_limiter = RateLimiter(max_requests=30, window_seconds=60)
_export_limiter = RateLimiter(max_requests=10, window_seconds=60)


def rate_limit_validate(request: Request) -> None:
    ip = request.client.host if request.client else "unknown"
    _validate_limiter.check(ip)


def rate_limit_export(request: Request) -> None:
    ip = request.client.host if request.client else "unknown"
    _export_limiter.check(ip)
