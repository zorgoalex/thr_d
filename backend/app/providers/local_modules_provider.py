from app.providers.base import ModulesProvider
from app.providers.seeds import SEED_MODULES
from app.schemas.domain import Template


class LocalModulesProvider(ModulesProvider):
    def __init__(self) -> None:
        self._modules = {m.id: m for m in SEED_MODULES}

    def get_all(self) -> list[Template]:
        return list(self._modules.values())
