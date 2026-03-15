from abc import ABC, abstractmethod

from app.schemas.domain import ExportFormat, ExportJob, Project


class Exporter(ABC):
    @abstractmethod
    def supported_format(self) -> ExportFormat: ...

    @abstractmethod
    def export(self, project: Project, trace_id: str) -> ExportJob: ...
