"""Tests for exporter stubs."""

from app.exporters.fcstd_exporter import FcstdExporter
from app.exporters.step_exporter import StepExporter
from tests.test_validators.conftest import make_project


def test_step_exporter_returns_failed() -> None:
    project = make_project()
    job = StepExporter().export(project, "trace-1")
    assert job.status.value == "failed"
    assert "not implemented" in job.error.lower()
    assert job.format.value == "step"


def test_fcstd_exporter_returns_failed() -> None:
    project = make_project()
    job = FcstdExporter().export(project, "trace-1")
    assert job.status.value == "failed"
    assert "not implemented" in job.error.lower()
    assert job.format.value == "fcstd"
