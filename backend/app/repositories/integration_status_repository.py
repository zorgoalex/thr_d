from sqlalchemy.orm import Session

from app.models import IntegrationStatusRecord


class IntegrationStatusRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def find_all(self) -> list[IntegrationStatusRecord]:
        return list(self._session.query(IntegrationStatusRecord).all())

    def find_by_provider(self, provider: str) -> IntegrationStatusRecord | None:
        return (
            self._session.query(IntegrationStatusRecord)
            .filter(IntegrationStatusRecord.provider == provider)
            .first()
        )
