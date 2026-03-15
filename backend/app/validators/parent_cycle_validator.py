from uuid import uuid4

from app.schemas.domain import Project, ValidationCode, ValidationIssue, ValidationSeverity
from app.validators.base import ProjectValidator


class ParentCycleValidator(ProjectValidator):
    def validate(self, project: Project) -> list[ValidationIssue]:
        item_map = {item.id: item for item in project.items}
        issues: list[ValidationIssue] = []
        reported: set[str] = set()

        for item in project.items:
            visited: set[str] = set()
            current: str | None = item.id

            while current is not None:
                if current in visited:
                    if current not in reported:
                        reported.add(current)
                        issues.append(ValidationIssue(
                            id=str(uuid4()),
                            severity=ValidationSeverity.ERROR,
                            code=ValidationCode.PARENT_CYCLE_DETECTED,
                            message=f'Circular parentId chain detected at item "{current}".',
                            itemIds=[current],
                        ))
                    break
                visited.add(current)
                parent = item_map.get(current)
                current = parent.parentId if parent else None

        return issues
