from app.providers.base import MaterialsProvider
from app.providers.seeds import SEED_MATERIALS
from app.schemas.domain import Material


class LocalMaterialsProvider(MaterialsProvider):
    def __init__(self) -> None:
        self._materials = {m.id: m for m in SEED_MATERIALS}

    def get_all(self) -> list[Material]:
        return list(self._materials.values())

    def get_by_id(self, material_id: str) -> Material | None:
        return self._materials.get(material_id)
