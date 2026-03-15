from uuid import uuid4

from app.schemas.domain import Project, ValidationCode, ValidationIssue, ValidationSeverity
from app.validators.base import ProjectValidator
from app.validators.constants import EPSILON, PENETRATION_THRESHOLD
from app.validators.geometry import (
    AABB,
    compute_aabb_overlap,
    compute_world_aabb,
    resolve_world_transform,
)


class IntersectionsValidator(ProjectValidator):
    def validate(self, project: Project) -> list[ValidationIssue]:
        items = project.items
        aabbs: dict[str, AABB] = {}

        for item in items:
            try:
                wt = resolve_world_transform(item.id, items)
                aabbs[item.id] = compute_world_aabb(item.dimensions, wt)
            except ValueError:
                continue

        issues: list[ValidationIssue] = []
        for i in range(len(items)):
            a = items[i]
            aabb_a = aabbs.get(a.id)
            if aabb_a is None:
                continue
            for j in range(i + 1, len(items)):
                b = items[j]
                # Skip parent-child pairs
                if a.parentId == b.id or b.parentId == a.id:
                    continue
                aabb_b = aabbs.get(b.id)
                if aabb_b is None:
                    continue
                overlap = compute_aabb_overlap(aabb_a, aabb_b)
                if overlap > PENETRATION_THRESHOLD + EPSILON:
                    issues.append(ValidationIssue(
                        id=str(uuid4()),
                        severity=ValidationSeverity.ERROR,
                        code=ValidationCode.ITEM_INTERSECTION,
                        message=f'Items "{a.name}" and "{b.name}" intersect ({overlap:.1f}mm).',
                        itemIds=[a.id, b.id],
                        details={"overlapMm": overlap},
                    ))
        return issues
