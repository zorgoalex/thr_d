from uuid import uuid4

from app.schemas.domain import Project, ValidationCode, ValidationIssue, ValidationSeverity
from app.validators.base import ProjectValidator
from app.validators.constants import MAX_PROJECT_ITEMS


class ProjectLimitsValidator(ProjectValidator):
    def validate(self, project: Project) -> list[ValidationIssue]:
        if len(project.items) > MAX_PROJECT_ITEMS:
            return [ValidationIssue(
                id=str(uuid4()),
                severity=ValidationSeverity.ERROR,
                code=ValidationCode.PROJECT_LIMIT_EXCEEDED,
                message=f"Project has {len(project.items)} items, max is {MAX_PROJECT_ITEMS}.",
                itemIds=[],
                details={"count": len(project.items), "limit": MAX_PROJECT_ITEMS},
            )]
        return []
