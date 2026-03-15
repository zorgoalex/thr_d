"""Tests for repository CRUD operations."""

from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db import Base
from app.models import ExportJobRecord, MaterialRecord
from app.repositories.export_job_repository import ExportJobRepository
from app.repositories.material_repository import MaterialRepository


@pytest.fixture()
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    session = sessionmaker(bind=engine)()
    yield session
    session.close()


def test_material_find_all_empty(db_session) -> None:
    repo = MaterialRepository(db_session)
    assert repo.find_all() == []


def test_material_find_all_after_insert(db_session) -> None:
    db_session.add(MaterialRecord(
        id="m1", code="C1", name="Mat 1", color="#fff",
        thickness_mm_default=16, category="laminate",
    ))
    db_session.commit()
    repo = MaterialRepository(db_session)
    assert len(repo.find_all()) == 1


def test_material_find_by_id(db_session) -> None:
    db_session.add(MaterialRecord(
        id="m1", code="C1", name="Mat 1", color="#fff",
        thickness_mm_default=16, category="laminate",
    ))
    db_session.commit()
    repo = MaterialRepository(db_session)
    assert repo.find_by_id("m1") is not None
    assert repo.find_by_id("missing") is None


def test_export_job_create_and_find(db_session) -> None:
    repo = ExportJobRepository(db_session)
    now = datetime.now(UTC)
    record = ExportJobRecord(
        id="job-1", format="project.json", status="ready",
        created_at=now, expires_at=now + timedelta(minutes=15),
        trace_id="t1",
    )
    repo.create(record)
    found = repo.find_by_id("job-1")
    assert found is not None
    assert found.id == "job-1"


def test_export_job_delete(db_session) -> None:
    repo = ExportJobRepository(db_session)
    now = datetime.now(UTC)
    record = ExportJobRecord(
        id="job-1", format="project.json", status="ready",
        created_at=now, expires_at=now + timedelta(minutes=15),
        trace_id="t1",
    )
    repo.create(record)
    assert repo.delete_by_id("job-1") is True
    assert repo.delete_by_id("job-1") is False


def test_export_job_delete_expired(db_session) -> None:
    repo = ExportJobRepository(db_session)
    now = datetime.now(UTC)

    # Expired job
    repo.create(ExportJobRecord(
        id="old", format="project.json", status="ready",
        created_at=now - timedelta(hours=1),
        expires_at=now - timedelta(minutes=30),
        trace_id="t1",
    ))
    # Fresh job
    repo.create(ExportJobRecord(
        id="fresh", format="project.json", status="ready",
        created_at=now,
        expires_at=now + timedelta(minutes=15),
        trace_id="t2",
    ))

    deleted = repo.delete_expired()
    assert deleted == 1
    assert repo.find_by_id("old") is None
    assert repo.find_by_id("fresh") is not None
