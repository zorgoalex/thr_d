"""FreeCAD (FCStd) exporter stub — not implemented in MVP."""

from datetime import UTC, datetime, timedelta
from uuid import uuid4

from app.schemas.domain import ExportFormat, ExportJob, ExportJobStatus, Project

from .base import Exporter


class FcstdExporter(Exporter):
    def supported_format(self) -> ExportFormat:
        return ExportFormat.FCSTD

    def export(self, project: Project, trace_id: str) -> ExportJob:
        now = datetime.now(UTC)
        return ExportJob(
            id=str(uuid4()),
            format=ExportFormat.FCSTD,
            status=ExportJobStatus.FAILED,
            createdAt=now,
            expiresAt=now + timedelta(minutes=15),
            error="FreeCAD export is not implemented in MVP.",
            traceId=trace_id,
        )
