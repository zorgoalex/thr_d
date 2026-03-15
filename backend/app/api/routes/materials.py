from fastapi import APIRouter, Depends

from app.api.dependencies import get_catalog_service, get_trace_id
from app.errors import ApiError
from app.schemas.api import MaterialDetailResponse, MaterialsResponse
from app.services.catalog_service import CatalogService

router = APIRouter(prefix="/materials", tags=["materials"])


@router.get("", response_model=MaterialsResponse)
def list_materials(
    trace_id: str = Depends(get_trace_id),
    service: CatalogService = Depends(get_catalog_service),
) -> MaterialsResponse:
    return MaterialsResponse(items=service.get_materials(), traceId=trace_id)


@router.get("/{material_id}", response_model=MaterialDetailResponse)
def get_material(
    material_id: str,
    trace_id: str = Depends(get_trace_id),
    service: CatalogService = Depends(get_catalog_service),
) -> MaterialDetailResponse:
    material = service.get_material_by_id(material_id)
    if material is None:
        raise ApiError(
            code="MATERIAL_NOT_FOUND",
            message=f"Material '{material_id}' not found.",
            status_code=404,
        )
    return MaterialDetailResponse(item=material, traceId=trace_id)
