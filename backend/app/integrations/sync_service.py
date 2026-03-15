from app.schemas.api import IntegrationSyncResponse


class IntegrationSyncService:
    """Stub sync service. Real sync logic comes in later stages."""

    def sync_materials(self, trace_id: str) -> IntegrationSyncResponse:
        return IntegrationSyncResponse(
            provider="materials", status="not_implemented", traceId=trace_id
        )

    def sync_templates(self, trace_id: str) -> IntegrationSyncResponse:
        return IntegrationSyncResponse(
            provider="templates", status="not_implemented", traceId=trace_id
        )

    def sync_modules(self, trace_id: str) -> IntegrationSyncResponse:
        return IntegrationSyncResponse(
            provider="modules", status="not_implemented", traceId=trace_id
        )
