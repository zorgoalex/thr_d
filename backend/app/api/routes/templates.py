from fastapi import APIRouter, Depends

from app.api.dependencies import get_catalog_service, get_trace_id
from app.errors import ApiError
from app.schemas.api import TemplateDetailResponse, TemplatesResponse
from app.services.catalog_service import CatalogService

router = APIRouter(prefix="/templates", tags=["templates"])


@router.get("", response_model=TemplatesResponse)
def list_templates(
    trace_id: str = Depends(get_trace_id),
    service: CatalogService = Depends(get_catalog_service),
) -> TemplatesResponse:
    return TemplatesResponse(items=service.get_templates(), traceId=trace_id)


@router.get("/{template_id}", response_model=TemplateDetailResponse)
def get_template(
    template_id: str,
    trace_id: str = Depends(get_trace_id),
    service: CatalogService = Depends(get_catalog_service),
) -> TemplateDetailResponse:
    template = service.get_template_by_id(template_id)
    if template is None:
        raise ApiError(
            code="TEMPLATE_NOT_FOUND",
            message=f"Template '{template_id}' not found.",
            status_code=404,
        )
    return TemplateDetailResponse(item=template, traceId=trace_id)
