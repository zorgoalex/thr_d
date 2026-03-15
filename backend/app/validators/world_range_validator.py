from uuid import uuid4

from app.schemas.domain import Project, ValidationCode, ValidationIssue, ValidationSeverity
from app.validators.base import ProjectValidator
from app.validators.constants import WORLD_RANGE_LIMIT
from app.validators.geometry import compute_world_aabb, resolve_world_transform


class WorldRangeValidator(ProjectValidator):
    def validate(self, project: Project) -> list[ValidationIssue]:
        issues: list[ValidationIssue] = []
        for item in project.items:
            try:
                wt = resolve_world_transform(item.id, project.items)
                aabb = compute_world_aabb(item.dimensions, wt)
            except ValueError:
                continue

            coords = [aabb.min_x, aabb.max_x, aabb.min_y, aabb.max_y, aabb.min_z, aabb.max_z]
            if any(abs(c) > WORLD_RANGE_LIMIT for c in coords):
                issues.append(ValidationIssue(
                    id=str(uuid4()),
                    severity=ValidationSeverity.ERROR,
                    code=ValidationCode.OUT_OF_ALLOWED_WORLD_RANGE,
                    message=f'Item "{item.name}" has coordinates exceeding world range.',
                    itemIds=[item.id],
                ))
        return issues
