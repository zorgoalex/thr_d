from app.providers.base import TemplatesProvider
from app.providers.seeds import SEED_TEMPLATES
from app.schemas.domain import Template


class LocalTemplatesProvider(TemplatesProvider):
    def __init__(self) -> None:
        self._templates = {t.id: t for t in SEED_TEMPLATES}

    def get_all(self) -> list[Template]:
        return list(self._templates.values())

    def get_by_id(self, template_id: str) -> Template | None:
        return self._templates.get(template_id)
