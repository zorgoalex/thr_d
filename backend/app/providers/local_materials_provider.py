from app.providers.base import MaterialsProvider
from app.schemas.domain import Material


class LocalMaterialsProvider(MaterialsProvider):
    """Returns empty catalog. Seed data is added in Stage 3."""

    def get_all(self) -> list[Material]:
        return []

    def get_by_id(self, material_id: str) -> Material | None:
        return None
