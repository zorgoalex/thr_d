from app.schemas.domain import Project, ValidationIssue
from app.validators.base import ProjectValidator


class StubProjectValidator(ProjectValidator):
    """Returns no issues. Real validators plug in at later stages."""

    def validate(self, project: Project) -> list[ValidationIssue]:
        return []
