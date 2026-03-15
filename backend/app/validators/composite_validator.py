from app.schemas.domain import Project, ValidationIssue
from app.validators.base import ProjectValidator


class CompositeProjectValidator(ProjectValidator):
    def __init__(self, validators: list[ProjectValidator]) -> None:
        self._validators = validators

    def validate(self, project: Project) -> list[ValidationIssue]:
        issues: list[ValidationIssue] = []
        for v in self._validators:
            issues.extend(v.validate(project))
        return issues
