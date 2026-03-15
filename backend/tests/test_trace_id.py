def test_custom_trace_id_is_echoed(client) -> None:
    response = client.get(
        "/api/v1/health", headers={"X-Trace-Id": "my-custom-trace"}
    )

    assert response.headers["X-Trace-Id"] == "my-custom-trace"


def test_error_responses_include_trace_id_in_body(client) -> None:
    response = client.get("/api/v1/materials/nonexistent")

    assert response.status_code == 404
    assert "traceId" in response.json()


def test_trace_id_header_present_on_success(client) -> None:
    response = client.get("/api/v1/materials")

    assert response.status_code == 200
    assert response.headers.get("X-Trace-Id")
