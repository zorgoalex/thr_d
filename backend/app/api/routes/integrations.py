from fastapi import APIRouter, Depends

from app.api.dependencies import get_sync_service, get_trace_id
from app.config import Settings, get_settings
from app.errors import ApiError
from app.integrations.sync_service import IntegrationSyncService
from app.schemas.api import IntegrationSyncResponse

router = APIRouter(prefix="/integrations", tags=["integrations"])


def require_integration_endpoints(
    settings: Settings = Depends(get_settings),
) -> None:
    if not settings.features_integration_endpoints:
        raise ApiError(
            code="NOT_IMPLEMENTED",
            message="Integration endpoints are not enabled.",
            status_code=501,
        )


@router.get(
    "/materials/sync",
    response_model=IntegrationSyncResponse,
    dependencies=[Depends(require_integration_endpoints)],
)
def sync_materials(
    trace_id: str = Depends(get_trace_id),
    service: IntegrationSyncService = Depends(get_sync_service),
) -> IntegrationSyncResponse:
    return service.sync_materials(trace_id)


@router.get(
    "/templates/sync",
    response_model=IntegrationSyncResponse,
    dependencies=[Depends(require_integration_endpoints)],
)
def sync_templates(
    trace_id: str = Depends(get_trace_id),
    service: IntegrationSyncService = Depends(get_sync_service),
) -> IntegrationSyncResponse:
    return service.sync_templates(trace_id)


@router.get(
    "/modules/sync",
    response_model=IntegrationSyncResponse,
    dependencies=[Depends(require_integration_endpoints)],
)
def sync_modules(
    trace_id: str = Depends(get_trace_id),
    service: IntegrationSyncService = Depends(get_sync_service),
) -> IntegrationSyncResponse:
    return service.sync_modules(trace_id)
