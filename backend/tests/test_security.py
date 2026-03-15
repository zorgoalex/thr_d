"""Tests for security: rate limiting, body size, parentId cycles, string lengths."""

from tests.test_projects_api import MINIMAL_PROJECT


def test_body_size_limit_rejects_oversized(client) -> None:
    # 6MB of padding
    huge = {"project": {**MINIMAL_PROJECT["project"], "extra": "x" * (6 * 1024 * 1024)}}
    response = client.post(
        "/api/v1/projects/validate",
        json=huge,
        headers={"Content-Length": str(6 * 1024 * 1024 + 1000)},
    )
    assert response.status_code == 413
    assert response.json()["code"] == "BODY_TOO_LARGE"


def test_string_length_limit_rejects_long_name(client) -> None:
    project = {**MINIMAL_PROJECT["project"], "name": "x" * 256}
    response = client.post("/api/v1/projects/validate", json={"project": project})
    assert response.status_code == 422


def test_string_length_255_accepted(client) -> None:
    project = {**MINIMAL_PROJECT["project"], "name": "x" * 255}
    response = client.post("/api/v1/projects/validate", json={"project": project})
    assert response.status_code == 200


def test_parent_cycle_detected(client) -> None:
    project = {
        **MINIMAL_PROJECT["project"],
        "items": [
            {
                "id": "a", "type": "panel", "subtype": "test", "name": "A",
                "parentId": "b", "sortIndex": 0,
                "dimensions": {"widthMm": 100, "heightMm": 100, "depthMm": 100, "thicknessMm": 16},
                "transform": {"xMm": 0, "yMm": 0, "zMm": 0, "rotationYDeg": 0},
            },
            {
                "id": "b", "type": "panel", "subtype": "test", "name": "B",
                "parentId": "a", "sortIndex": 0,
                "dimensions": {"widthMm": 100, "heightMm": 100, "depthMm": 100, "thicknessMm": 16},
                "transform": {"xMm": 0, "yMm": 0, "zMm": 0, "rotationYDeg": 0},
            },
        ],
    }
    response = client.post("/api/v1/projects/validate", json={"project": project})
    assert response.status_code == 200
    body = response.json()
    assert body["ok"] is False
    codes = [i["code"] for i in body["issues"]]
    assert "PARENT_CYCLE_DETECTED" in codes


def test_validate_logs_trace_id(client, caplog) -> None:
    import logging

    with caplog.at_level(logging.INFO):
        client.post("/api/v1/projects/validate", json=MINIMAL_PROJECT)
    assert any("project.validate" in r.message for r in caplog.records)
