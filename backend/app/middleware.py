from uuid import uuid4

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import Settings


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
