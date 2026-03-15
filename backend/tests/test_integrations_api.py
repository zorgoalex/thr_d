from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient

from app.config import get_settings
from app.main import create_app


@pytest.fixture()
def client_with_integrations() -> Generator[TestClient, None, None]:
    """Client with features_integration_endpoints=True."""
    import os

    os.environ["FEATURES_INTEGRATION_ENDPOINTS"] = "true"
    get_settings.cache_clear()
    with TestClient(create_app()) as tc:
        yield tc
    os.environ.pop("FEATURES_INTEGRATION_ENDPOINTS", None)
    get_settings.cache_clear()


def test_sync_materials_returns_501_when_flag_off(client) -> None:
    response = client.get("/api/v1/integrations/materials/sync")

    assert response.status_code == 501
    body = response.json()
    assert body["code"] == "NOT_IMPLEMENTED"
    assert body["traceId"]


def test_sync_templates_returns_501_when_flag_off(client) -> None:
    response = client.get("/api/v1/integrations/templates/sync")
    assert response.status_code == 501


def test_sync_modules_returns_501_when_flag_off(client) -> None:
    response = client.get("/api/v1/integrations/modules/sync")
    assert response.status_code == 501


def test_sync_materials_returns_200_when_flag_on(client_with_integrations) -> None:
    response = client_with_integrations.get("/api/v1/integrations/materials/sync")

    assert response.status_code == 200
    body = response.json()
    assert body["provider"] == "materials"
    assert body["traceId"]


def test_sync_templates_returns_200_when_flag_on(client_with_integrations) -> None:
    response = client_with_integrations.get("/api/v1/integrations/templates/sync")

    assert response.status_code == 200
    assert response.json()["provider"] == "templates"


def test_sync_modules_returns_200_when_flag_on(client_with_integrations) -> None:
    response = client_with_integrations.get("/api/v1/integrations/modules/sync")

    assert response.status_code == 200
    assert response.json()["provider"] == "modules"
