MINIMAL_PROJECT = {
    "project": {
        "id": "project-test",
        "name": "Test",
        "version": "1.0",
        "unit": "mm",
        "room": {"widthMm": 3000, "lengthMm": 3000, "heightMm": 2700},
        "items": [],
        "materials": [],
        "metadata": {
            "createdAt": "2026-03-09T00:00:00Z",
            "updatedAt": "2026-03-09T00:00:00Z",
        },
    }
}


def test_validate_returns_200_with_valid_project(client) -> None:
    response = client.post("/api/v1/projects/validate", json=MINIMAL_PROJECT)

    assert response.status_code == 200
    body = response.json()
    assert body["ok"] is True
    assert body["issues"] == []
    assert body["traceId"]


def test_validate_returns_422_with_invalid_body(client) -> None:
    response = client.post("/api/v1/projects/validate", json={})

    assert response.status_code == 422
    body = response.json()
    assert body["code"] == "REQUEST_VALIDATION_ERROR"
    assert body["traceId"]


def test_specification_returns_200_with_valid_project(client) -> None:
    response = client.post("/api/v1/projects/specification", json=MINIMAL_PROJECT)

    assert response.status_code == 200
    body = response.json()
    assert body["rows"] == []
    assert body["traceId"]


def test_export_returns_200_with_valid_project(client) -> None:
    payload = {
        **MINIMAL_PROJECT,
        "formats": ["project.json"],
    }
    response = client.post("/api/v1/projects/export", json=payload)

    assert response.status_code == 200
    body = response.json()
    assert len(body["jobs"]) == 1
    assert body["jobs"][0]["format"] == "project.json"
    assert body["jobs"][0]["status"] == "ready"
    assert body["jobs"][0]["inlineContent"]
    assert body["traceId"]


def test_project_endpoints_include_trace_id_header(client) -> None:
    response = client.post("/api/v1/projects/validate", json=MINIMAL_PROJECT)
    assert response.headers["X-Trace-Id"]
