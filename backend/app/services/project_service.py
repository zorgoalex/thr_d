from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import TYPE_CHECKING
from uuid import uuid4

if TYPE_CHECKING:
    from app.services.export_service import ExportJobService

from app.exporters.csv_exporter import export_csv
from app.exporters.json_exporter import export_json
from app.schemas.api import (
    ExportProjectResponse,
    GenerateSpecificationResponse,
    ValidateProjectResponse,
)
from app.schemas.domain import ExportFormat, ExportJob, ExportJobStatus, Project
from app.services.specification import generate_spec_rows
from app.validators.base import ProjectValidator

EXPORT_TTL_MINUTES = 15


class ProjectService:
    def __init__(
        self,
        validator: ProjectValidator,
        export_job_service: ExportJobService | None = None,
    ) -> None:
        self._validator = validator
        self._export_job_service = export_job_service

    def validate(self, project: Project, trace_id: str) -> ValidateProjectResponse:
        issues = self._validator.validate(project)
        return ValidateProjectResponse(
            ok=len(issues) == 0,
            issues=issues,
            traceId=trace_id,
        )

    def generate_specification(
        self, project: Project, trace_id: str
    ) -> GenerateSpecificationResponse:
        rows = generate_spec_rows(project)
        return GenerateSpecificationResponse(rows=rows, issues=[], traceId=trace_id)

    def export(
        self, project: Project, formats: list[ExportFormat], trace_id: str
    ) -> ExportProjectResponse:
        now = datetime.now(UTC)
        expires = now + timedelta(minutes=EXPORT_TTL_MINUTES)
        jobs: list[ExportJob] = []

        for fmt in formats:
            job_id = str(uuid4())

            if fmt == ExportFormat.PROJECT_JSON:
                content = export_json(project)
                jobs.append(ExportJob(
                    id=job_id, format=fmt, status=ExportJobStatus.READY,
                    createdAt=now, expiresAt=expires,
                    inlineContent=content, traceId=trace_id,
                ))

            elif fmt == ExportFormat.SPECIFICATION_CSV:
                rows = generate_spec_rows(project)
                content = export_csv(rows)
                jobs.append(ExportJob(
                    id=job_id, format=fmt, status=ExportJobStatus.READY,
                    createdAt=now, expiresAt=expires,
                    inlineContent=content, traceId=trace_id,
                ))

            elif fmt == ExportFormat.SCENE_GLB:
                jobs.append(ExportJob(
                    id=job_id, format=fmt, status=ExportJobStatus.FAILED,
                    createdAt=now, expiresAt=expires,
                    error="GLB export is client-generated. Use the frontend export.",
                    traceId=trace_id,
                ))

            else:
                # STEP, FCSTD, OBJ — not implemented in MVP
                jobs.append(ExportJob(
                    id=job_id, format=fmt, status=ExportJobStatus.FAILED,
                    createdAt=now, expiresAt=expires,
                    error=f"Format '{fmt.value}' is not implemented in MVP.",
                    traceId=trace_id,
                ))

        # Persist jobs to DB
        if self._export_job_service:
            for job in jobs:
                try:
                    self._export_job_service.create_job(job)
                except Exception:
                    pass  # Don't fail export if DB write fails

        return ExportProjectResponse(jobs=jobs, traceId=trace_id)
