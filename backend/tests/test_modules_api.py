def test_list_modules_returns_200(client) -> None:
    response = client.get("/api/v1/modules")

    assert response.status_code == 200
    body = response.json()
    assert len(body["items"]) == 10  # 4 modules + 6 parts
    assert body["traceId"]
