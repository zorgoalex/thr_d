from uuid import uuid4

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import Settings
from app.constants import MAX_API_BODY_SIZE_MB


class TraceIdMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, settings: Settings):
        super().__init__(app)
        self._settings = settings

    async def dispatch(self, request: Request, call_next):
        trace_id = request.headers.get(self._settings.trace_header_name) or str(uuid4())
        request.state.trace_id = trace_id
        response: Response = await call_next(request)
        response.headers[self._settings.trace_header_name] = trace_id
        return response


class BodySizeLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > MAX_API_BODY_SIZE_MB * 1024 * 1024:
            trace_id = getattr(request.state, "trace_id", "unknown")
            return JSONResponse(
                status_code=413,
                content={
                    "code": "BODY_TOO_LARGE",
                    "message": f"Request body exceeds {MAX_API_BODY_SIZE_MB}MB limit.",
                    "traceId": trace_id,
                },
            )
        return await call_next(request)
