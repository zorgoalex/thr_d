def test_list_materials_returns_200(client) -> None:
    response = client.get("/api/v1/materials")

    assert response.status_code == 200
    body = response.json()
    assert body["items"] == []
    assert body["traceId"]


def test_get_material_not_found_returns_404(client) -> None:
    response = client.get("/api/v1/materials/nonexistent")

    assert response.status_code == 404
    body = response.json()
    assert body["code"] == "MATERIAL_NOT_FOUND"
    assert body["traceId"]
