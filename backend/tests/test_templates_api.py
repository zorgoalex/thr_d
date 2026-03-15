def test_list_templates_returns_200(client) -> None:
    response = client.get("/api/v1/templates")

    assert response.status_code == 200
    body = response.json()
    assert len(body["items"]) == 4
    assert body["traceId"]


def test_get_template_not_found_returns_404(client) -> None:
    response = client.get("/api/v1/templates/nonexistent")

    assert response.status_code == 404
    body = response.json()
    assert body["code"] == "TEMPLATE_NOT_FOUND"
    assert body["traceId"]
