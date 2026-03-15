from app.providers.base import ModulesProvider
from app.schemas.domain import Template


class LocalModulesProvider(ModulesProvider):
    """Returns empty catalog. Seed data is added in Stage 3."""

    def get_all(self) -> list[Template]:
        return []
