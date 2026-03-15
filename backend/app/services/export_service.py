from datetime import UTC, datetime

from app.models import ExportJobRecord
from app.repositories.export_job_repository import ExportJobRepository
from app.schemas.domain import ExportJob, ExportJobStatus


class ExportJobService:
    def __init__(self, repository: ExportJobRepository) -> None:
        self._repo = repository

    def get_job(self, job_id: str) -> ExportJob | None:
        record = self._repo.find_by_id(job_id)
        if record is None:
            return None

        # Check expiration
        status = ExportJobStatus(record.status)
        if record.expires_at < datetime.now(UTC) and status != ExportJobStatus.EXPIRED:
            status = ExportJobStatus.EXPIRED

        return ExportJob(
            id=record.id,
            format=record.format,
            status=status,
            createdAt=record.created_at,
            expiresAt=record.expires_at,
            downloadUrl=record.download_url,
            error=record.error,
            traceId=record.trace_id,
        )

    def create_job(self, job: ExportJob) -> None:
        record = ExportJobRecord(
            id=job.id,
            format=job.format.value if hasattr(job.format, 'value') else str(job.format),
            status=job.status.value if hasattr(job.status, 'value') else str(job.status),
            created_at=job.createdAt,
            expires_at=job.expiresAt,
            download_url=job.downloadUrl,
            error=job.error,
            trace_id=job.traceId,
        )
        self._repo.create(record)

    def delete_job(self, job_id: str) -> bool:
        return self._repo.delete_by_id(job_id)

    def cleanup_expired_jobs(self) -> int:
        return self._repo.delete_expired()
