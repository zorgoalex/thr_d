def test_list_modules_returns_200(client) -> None:
    response = client.get("/api/v1/modules")

    assert response.status_code == 200
    body = response.json()
    assert body["items"] == []
    assert body["traceId"]
