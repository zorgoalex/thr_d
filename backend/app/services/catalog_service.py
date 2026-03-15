from app.providers.base import MaterialsProvider, ModulesProvider, TemplatesProvider
from app.schemas.domain import Material, Template


class CatalogService:
    def __init__(
        self,
        materials_provider: MaterialsProvider,
        templates_provider: TemplatesProvider,
        modules_provider: ModulesProvider,
    ) -> None:
        self._materials = materials_provider
        self._templates = templates_provider
        self._modules = modules_provider

    def get_materials(self) -> list[Material]:
        return self._materials.get_all()

    def get_material_by_id(self, material_id: str) -> Material | None:
        return self._materials.get_by_id(material_id)

    def get_templates(self) -> list[Template]:
        return self._templates.get_all()

    def get_template_by_id(self, template_id: str) -> Template | None:
        return self._templates.get_by_id(template_id)

    def get_modules(self) -> list[Template]:
        return self._modules.get_all()
