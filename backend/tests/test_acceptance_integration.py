"""Etap 15: Full project lifecycle integration test."""

MINIMAL_PROJECT_BODY = {
    "project": {
        "id": "acceptance-test",
        "name": "Acceptance",
        "version": "1.0",
        "unit": "mm",
        "room": {"widthMm": 3000, "lengthMm": 3000, "heightMm": 2700},
        "items": [
            {
                "id": "panel-1",
                "type": "panel",
                "subtype": "side_panel",
                "name": "Side Panel",
                "sortIndex": 0,
                "dimensions": {"widthMm": 600, "heightMm": 720, "depthMm": 16, "thicknessMm": 16},
                "transform": {"xMm": 0, "yMm": 0, "zMm": 0, "rotationYDeg": 0},
            }
        ],
        "materials": [],
        "metadata": {
            "createdAt": "2026-03-16T00:00:00Z",
            "updatedAt": "2026-03-16T00:00:00Z",
        },
    }
}


def test_full_project_lifecycle(client) -> None:
    # 1. Health
    r = client.get("/api/v1/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"

    # 2. Catalog
    r = client.get("/api/v1/templates")
    assert r.status_code == 200
    assert len(r.json()["items"]) >= 4

    r = client.get("/api/v1/materials")
    assert r.status_code == 200
    assert len(r.json()["items"]) >= 8

    r = client.get("/api/v1/modules")
    assert r.status_code == 200
    assert len(r.json()["items"]) >= 10

    # 3. Validate valid project
    r = client.post("/api/v1/projects/validate", json=MINIMAL_PROJECT_BODY)
    assert r.status_code == 200
    assert r.json()["ok"] is True
    assert r.json()["traceId"]
    assert r.headers["X-Trace-Id"]

    # 4. Specification
    r = client.post("/api/v1/projects/specification", json=MINIMAL_PROJECT_BODY)
    assert r.status_code == 200
    rows = r.json()["rows"]
    assert len(rows) == 1
    assert rows[0]["quantity"] == 1

    # 5. Export JSON
    r = client.post(
        "/api/v1/projects/export",
        json={**MINIMAL_PROJECT_BODY, "formats": ["project.json"]},
    )
    assert r.status_code == 200
    jobs = r.json()["jobs"]
    assert len(jobs) == 1
    assert jobs[0]["status"] == "ready"
    assert jobs[0]["inlineContent"]

    # 6. Export CSV
    r = client.post(
        "/api/v1/projects/export",
        json={**MINIMAL_PROJECT_BODY, "formats": ["specification.csv"]},
    )
    assert r.status_code == 200
    csv_content = r.json()["jobs"][0]["inlineContent"]
    assert ";" in csv_content
    assert "side_panel" in csv_content


def test_feature_flags_default_off(client) -> None:
    for endpoint in [
        "/api/v1/integrations/materials/sync",
        "/api/v1/integrations/templates/sync",
        "/api/v1/integrations/modules/sync",
    ]:
        r = client.get(endpoint)
        assert r.status_code == 501
        assert r.json()["code"] == "NOT_IMPLEMENTED"


def test_error_boundary_api_validation(client) -> None:
    # Invalid item (outside room)
    body = {
        "project": {
            **MINIMAL_PROJECT_BODY["project"],
            "items": [
                {
                    "id": "far-away",
                    "type": "panel",
                    "subtype": "test",
                    "name": "Far Away",
                    "sortIndex": 0,
                    "dimensions": {
                        "widthMm": 600,
                        "heightMm": 720,
                        "depthMm": 400,
                        "thicknessMm": 16,
                    },
                    "transform": {
                        "xMm": 5000,
                        "yMm": 0,
                        "zMm": 0,
                        "rotationYDeg": 0,
                    },
                }
            ],
        }
    }
    r = client.post("/api/v1/projects/validate", json=body)
    assert r.status_code == 200
    assert r.json()["ok"] is False
    codes = [i["code"] for i in r.json()["issues"]]
    assert "ROOM_BOUNDS_EXCEEDED" in codes
