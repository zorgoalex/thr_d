import logging
from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


class ApiError(Exception):
    def __init__(
        self,
        *,
        code: str,
        message: str,
        status_code: int,
        details: Any | None = None,
    ) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details


def _trace_id_from_request(request: Request) -> str:
    return getattr(request.state, "trace_id", "unknown-trace-id")


def _error_payload(
    *,
    request: Request,
    code: str,
    message: str,
    details: Any | None = None,
) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "code": code,
        "message": message,
        "traceId": _trace_id_from_request(request),
    }
    if details is not None:
        payload["details"] = details
    return payload


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(ApiError)
    async def handle_api_error(request: Request, exc: ApiError) -> JSONResponse:
        logger.warning("api_error code=%s traceId=%s", exc.code, _trace_id_from_request(request))
        return JSONResponse(
            status_code=exc.status_code,
            content=_error_payload(
                request=request,
                code=exc.code,
                message=exc.message,
                details=exc.details,
            ),
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=422,
            content=_error_payload(
                request=request,
                code="REQUEST_VALIDATION_ERROR",
                message="Request validation failed.",
                details=exc.errors(),
            ),
        )

    @app.exception_handler(Exception)
    async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
        logger.exception(
            "unexpected_error traceId=%s",
            _trace_id_from_request(request),
            exc_info=exc,
        )
        return JSONResponse(
            status_code=500,
            content=_error_payload(
                request=request,
                code="INTERNAL_SERVER_ERROR",
                message="Internal server error.",
            ),
        )
