from uuid import uuid4

from app.schemas.domain import Project, ValidationCode, ValidationIssue, ValidationSeverity
from app.validators.base import ProjectValidator
from app.validators.geometry import (
    compute_world_aabb,
    is_below_floor,
    is_inside_room,
    resolve_world_transform,
)


class RoomBoundsValidator(ProjectValidator):
    def validate(self, project: Project) -> list[ValidationIssue]:
        issues: list[ValidationIssue] = []
        for item in project.items:
            try:
                wt = resolve_world_transform(item.id, project.items)
                aabb = compute_world_aabb(item.dimensions, wt)
            except ValueError:
                continue

            if not is_inside_room(aabb, project.room):
                issues.append(ValidationIssue(
                    id=str(uuid4()),
                    severity=ValidationSeverity.ERROR,
                    code=ValidationCode.ROOM_BOUNDS_EXCEEDED,
                    message=f'Item "{item.name}" extends outside room bounds.',
                    itemIds=[item.id],
                ))
            if is_below_floor(aabb):
                issues.append(ValidationIssue(
                    id=str(uuid4()),
                    severity=ValidationSeverity.ERROR,
                    code=ValidationCode.ITEM_BELOW_FLOOR,
                    message=f'Item "{item.name}" extends below floor.',
                    itemIds=[item.id],
                ))
        return issues
