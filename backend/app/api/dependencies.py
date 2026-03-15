from fastapi import Depends, Request
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.db import get_db_session
from app.integrations.sync_service import IntegrationSyncService
from app.providers.local_materials_provider import LocalMaterialsProvider
from app.providers.local_modules_provider import LocalModulesProvider
from app.providers.local_templates_provider import LocalTemplatesProvider
from app.repositories.export_job_repository import ExportJobRepository
from app.services.catalog_service import CatalogService
from app.services.export_service import ExportJobService
from app.services.project_service import ProjectService
from app.validators.composite_validator import CompositeProjectValidator
from app.validators.dimensions_validator import DimensionsValidator
from app.validators.intersections_validator import IntersectionsValidator
from app.validators.project_limits_validator import ProjectLimitsValidator
from app.validators.room_bounds_validator import RoomBoundsValidator
from app.validators.rotation_validator import RotationValidator
from app.validators.world_range_validator import WorldRangeValidator


def get_trace_id(request: Request) -> str:
    return getattr(request.state, "trace_id", "unknown-trace-id")


def get_project_service(
    session: Session = Depends(get_db_session),
) -> ProjectService:
    validator = CompositeProjectValidator([
        RotationValidator(),
        DimensionsValidator(),
        RoomBoundsValidator(),
        WorldRangeValidator(),
        IntersectionsValidator(),
        ProjectLimitsValidator(),
    ])
    export_svc = ExportJobService(repository=ExportJobRepository(session))
    return ProjectService(validator=validator, export_job_service=export_svc)


def get_catalog_service(
    settings: Settings = Depends(get_settings),
) -> CatalogService:
    return CatalogService(
        materials_provider=LocalMaterialsProvider(),
        templates_provider=LocalTemplatesProvider(),
        modules_provider=LocalModulesProvider(),
    )


def get_export_job_service(
    session: Session = Depends(get_db_session),
) -> ExportJobService:
    return ExportJobService(repository=ExportJobRepository(session))


def get_sync_service() -> IntegrationSyncService:
    return IntegrationSyncService()
