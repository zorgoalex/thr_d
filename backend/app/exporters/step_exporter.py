"""STEP exporter stub — not implemented in MVP."""

from datetime import UTC, datetime, timedelta
from uuid import uuid4

from app.schemas.domain import ExportFormat, ExportJob, ExportJobStatus, Project

from .base import Exporter


class StepExporter(Exporter):
    def supported_format(self) -> ExportFormat:
        return ExportFormat.STEP

    def export(self, project: Project, trace_id: str) -> ExportJob:
        now = datetime.now(UTC)
        return ExportJob(
            id=str(uuid4()),
            format=ExportFormat.STEP,
            status=ExportJobStatus.FAILED,
            createdAt=now,
            expiresAt=now + timedelta(minutes=15),
            error="STEP export is not implemented in MVP.",
            traceId=trace_id,
        )
