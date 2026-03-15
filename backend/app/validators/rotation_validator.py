from uuid import uuid4

from app.schemas.domain import Project, ValidationCode, ValidationIssue, ValidationSeverity
from app.validators.base import ProjectValidator
from app.validators.constants import ALLOWED_ROTATIONS


class RotationValidator(ProjectValidator):
    def validate(self, project: Project) -> list[ValidationIssue]:
        issues: list[ValidationIssue] = []
        for item in project.items:
            if item.transform.rotationYDeg not in ALLOWED_ROTATIONS:
                issues.append(ValidationIssue(
                    id=str(uuid4()),
                    severity=ValidationSeverity.ERROR,
                    code=ValidationCode.INVALID_ROTATION,
                    message=f'Item "{item.name}" has invalid rotation'
                    f" {item.transform.rotationYDeg}°.",
                    itemIds=[item.id],
                ))
        return issues
