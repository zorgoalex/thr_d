from uuid import uuid4

from app.schemas.domain import Project, ValidationCode, ValidationIssue, ValidationSeverity
from app.validators.base import ProjectValidator
from app.validators.constants import EPSILON


class DimensionsValidator(ProjectValidator):
    def validate(self, project: Project) -> list[ValidationIssue]:
        issues: list[ValidationIssue] = []
        for item in project.items:
            d = item.dimensions
            if d.widthMm <= EPSILON or d.heightMm <= EPSILON or d.depthMm <= EPSILON:
                issues.append(ValidationIssue(
                    id=str(uuid4()),
                    severity=ValidationSeverity.ERROR,
                    code=ValidationCode.INVALID_DIMENSIONS,
                    message=f'Item "{item.name}" has zero or negative dimensions.',
                    itemIds=[item.id],
                ))
            if d.thicknessMm <= EPSILON:
                issues.append(ValidationIssue(
                    id=str(uuid4()),
                    severity=ValidationSeverity.ERROR,
                    code=ValidationCode.INVALID_THICKNESS,
                    message=f'Item "{item.name}" has zero or negative thickness.',
                    itemIds=[item.id],
                ))
        return issues
