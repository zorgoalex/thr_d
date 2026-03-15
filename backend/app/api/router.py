from fastapi import APIRouter

from app.api.routes.export_jobs import router as export_jobs_router
from app.api.routes.health import router as health_router
from app.api.routes.integrations import router as integrations_router
from app.api.routes.materials import router as materials_router
from app.api.routes.modules import router as modules_router
from app.api.routes.projects import router as projects_router
from app.api.routes.templates import router as templates_router


def build_api_router() -> APIRouter:
    router = APIRouter()
    router.include_router(health_router)
    router.include_router(projects_router)
    router.include_router(materials_router)
    router.include_router(templates_router)
    router.include_router(modules_router)
    router.include_router(export_jobs_router)
    router.include_router(integrations_router)
    return router
