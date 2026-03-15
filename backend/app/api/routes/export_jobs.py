from fastapi import APIRouter, Depends

from app.api.dependencies import get_export_job_service, get_trace_id
from app.errors import ApiError
from app.schemas.api import DeleteExportJobResponse, ExportJobResponse
from app.services.export_service import ExportJobService

router = APIRouter(prefix="/export-jobs", tags=["export-jobs"])


@router.get("/{job_id}", response_model=ExportJobResponse)
def get_export_job(
    job_id: str,
    trace_id: str = Depends(get_trace_id),
    service: ExportJobService = Depends(get_export_job_service),
) -> ExportJobResponse:
    job = service.get_job(job_id)
    if job is None:
        raise ApiError(
            code="EXPORT_JOB_NOT_FOUND",
            message=f"Export job '{job_id}' not found.",
            status_code=404,
        )
    if job.status == "expired":
        raise ApiError(
            code="EXPORT_EXPIRED",
            message="Export job has expired.",
            status_code=410,
        )
    return ExportJobResponse(item=job, traceId=trace_id)


@router.delete("/{job_id}", response_model=DeleteExportJobResponse)
def delete_export_job(
    job_id: str,
    trace_id: str = Depends(get_trace_id),
    service: ExportJobService = Depends(get_export_job_service),
) -> DeleteExportJobResponse:
    deleted = service.delete_job(job_id)
    if not deleted:
        raise ApiError(
            code="EXPORT_JOB_NOT_FOUND",
            message=f"Export job '{job_id}' not found.",
            status_code=404,
        )
    return DeleteExportJobResponse(id=job_id, deleted=True, traceId=trace_id)
