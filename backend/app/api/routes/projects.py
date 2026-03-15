from fastapi import APIRouter, Depends

from app.api.dependencies import get_project_service, get_trace_id
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


@router.post("/validate", response_model=ValidateProjectResponse)
def validate_project(
    body: ValidateProjectRequest,
    trace_id: str = Depends(get_trace_id),
    service: ProjectService = Depends(get_project_service),
) -> ValidateProjectResponse:
    return service.validate(body.project, trace_id)


@router.post("/specification", response_model=GenerateSpecificationResponse)
def generate_specification(
    body: GenerateSpecificationRequest,
    trace_id: str = Depends(get_trace_id),
    service: ProjectService = Depends(get_project_service),
) -> GenerateSpecificationResponse:
    return service.generate_specification(body.project, trace_id)


@router.post("/export", response_model=ExportProjectResponse)
def export_project(
    body: ExportProjectRequest,
    trace_id: str = Depends(get_trace_id),
    service: ProjectService = Depends(get_project_service),
) -> ExportProjectResponse:
    return service.export(body.project, body.formats, trace_id)
