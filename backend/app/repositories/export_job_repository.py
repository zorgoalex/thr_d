from sqlalchemy.orm import Session

from app.models import ExportJobRecord


class ExportJobRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def find_by_id(self, job_id: str) -> ExportJobRecord | None:
        return self._session.get(ExportJobRecord, job_id)

    def create(self, record: ExportJobRecord) -> ExportJobRecord:
        self._session.add(record)
        self._session.commit()
        self._session.refresh(record)
        return record

    def delete_by_id(self, job_id: str) -> bool:
        record = self.find_by_id(job_id)
        if record is None:
            return False
        self._session.delete(record)
        self._session.commit()
        return True
