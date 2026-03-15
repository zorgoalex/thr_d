from fastapi import APIRouter, Depends

from app.api.dependencies import get_catalog_service, get_trace_id
from app.schemas.api import ModulesResponse
from app.services.catalog_service import CatalogService

router = APIRouter(prefix="/modules", tags=["modules"])


@router.get("", response_model=ModulesResponse)
def list_modules(
    trace_id: str = Depends(get_trace_id),
    service: CatalogService = Depends(get_catalog_service),
) -> ModulesResponse:
    return ModulesResponse(items=service.get_modules(), traceId=trace_id)
