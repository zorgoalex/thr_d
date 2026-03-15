from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import build_api_router
from app.config import get_settings
from app.db import init_database
from app.errors import register_exception_handlers
from app.logging_config import configure_logging
from app.middleware import BodySizeLimitMiddleware, TraceIdMiddleware

settings = get_settings()
configure_logging(settings.log_level)


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_database()
    yield


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name, debug=settings.debug, lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(BodySizeLimitMiddleware)
    app.add_middleware(TraceIdMiddleware, settings=settings)
    app.include_router(build_api_router(), prefix=settings.api_v1_prefix)
    register_exception_handlers(app)
    return app


app = create_app()
