from sqlalchemy.orm import Session

from app.models import MaterialRecord


class MaterialRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def find_all(self) -> list[MaterialRecord]:
        return list(self._session.query(MaterialRecord).all())

    def find_by_id(self, material_id: str) -> MaterialRecord | None:
        return self._session.get(MaterialRecord, material_id)
