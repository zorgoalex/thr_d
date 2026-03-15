from app.repositories.export_job_repository import ExportJobRepository
from app.schemas.domain import ExportJob, ExportJobStatus


class ExportJobService:
    def __init__(self, repository: ExportJobRepository) -> None:
        self._repo = repository

    def get_job(self, job_id: str) -> ExportJob | None:
        record = self._repo.find_by_id(job_id)
        if record is None:
            return None
        return ExportJob(
            id=record.id,
            format=record.format,
            status=ExportJobStatus(record.status),
            createdAt=record.created_at,
            expiresAt=record.expires_at,
            downloadUrl=record.download_url,
            error=record.error,
            traceId=record.trace_id,
        )

    def delete_job(self, job_id: str) -> bool:
        return self._repo.delete_by_id(job_id)
