from app.schemas.api import (
    ExportProjectResponse,
    GenerateSpecificationResponse,
    ValidateProjectResponse,
)
from app.schemas.domain import ExportFormat, Project
from app.validators.base import ProjectValidator


class ProjectService:
    def __init__(self, validator: ProjectValidator) -> None:
        self._validator = validator

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
        return GenerateSpecificationResponse(rows=[], issues=[], traceId=trace_id)

    def export(
        self, project: Project, formats: list[ExportFormat], trace_id: str
    ) -> ExportProjectResponse:
        return ExportProjectResponse(jobs=[], traceId=trace_id)
