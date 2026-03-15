from fastapi import APIRouter, Depends

from app.api.dependencies import get_project_service, get_trace_id
from app.rate_limiter import rate_limit_export, rate_limit_validate
from app.schemas.api import (
    ExportProjectRequest,
    ExportProjectResponse,
    GenerateSpecificationRequest,
    GenerateSpecificationResponse,
    ValidateProjectRequest,
    ValidateProjectResponse,
)
from app.services.project_service import ProjectService

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post(
    "/validate",
    response_model=ValidateProjectResponse,
    dependencies=[Depends(rate_limit_validate)],
)
def validate_project(
    body: ValidateProjectRequest,
    trace_id: str = Depends(get_trace_id),
    service: ProjectService = Depends(get_project_service),
) -> ValidateProjectResponse:
    return service.validate(body.project, trace_id)


@router.post(
    "/specification",
    response_model=GenerateSpecificationResponse,
    dependencies=[Depends(rate_limit_validate)],
)
def generate_specification(
    body: GenerateSpecificationRequest,
    trace_id: str = Depends(get_trace_id),
    service: ProjectService = Depends(get_project_service),
) -> GenerateSpecificationResponse:
    return service.generate_specification(body.project, trace_id)


@router.post(
    "/export",
    response_model=ExportProjectResponse,
    dependencies=[Depends(rate_limit_export)],
)
def export_project(
    body: ExportProjectRequest,
    trace_id: str = Depends(get_trace_id),
    service: ProjectService = Depends(get_project_service),
) -> ExportProjectResponse:
    return service.export(body.project, body.formats, trace_id)
