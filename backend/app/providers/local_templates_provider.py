from app.providers.base import TemplatesProvider
from app.schemas.domain import Template


class LocalTemplatesProvider(TemplatesProvider):
    """Returns empty catalog. Seed data is added in Stage 3."""

    def get_all(self) -> list[Template]:
        return []

    def get_by_id(self, template_id: str) -> Template | None:
        return None
