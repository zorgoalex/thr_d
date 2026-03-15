from abc import ABC, abstractmethod

from app.schemas.domain import Material, Template


class MaterialsProvider(ABC):
    @abstractmethod
    def get_all(self) -> list[Material]: ...

    @abstractmethod
    def get_by_id(self, material_id: str) -> Material | None: ...


class TemplatesProvider(ABC):
    @abstractmethod
    def get_all(self) -> list[Template]: ...

    @abstractmethod
    def get_by_id(self, template_id: str) -> Template | None: ...


class ModulesProvider(ABC):
    @abstractmethod
    def get_all(self) -> list[Template]: ...
