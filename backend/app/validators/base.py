from abc import ABC, abstractmethod

from app.schemas.domain import Project, ValidationIssue


class ProjectValidator(ABC):
    @abstractmethod
    def validate(self, project: Project) -> list[ValidationIssue]: ...
