from fastapi import APIRouter

from app.errors import ApiError
from app.main import create_app


def test_api_errors_include_trace_id() -> None:
    app = create_app()
    router = APIRouter()

    @router.get("/boom")
    def boom() -> None:
        raise ApiError(code="TEST_ERROR", message="Broken.", status_code=418)

    app.include_router(router, prefix="/api/v1/test")

    from fastapi.testclient import TestClient

    with TestClient(app) as client:
        response = client.get("/api/v1/test/boom")

    assert response.status_code == 418
    assert response.json()["code"] == "TEST_ERROR"
    assert response.json()["message"] == "Broken."
    assert response.json()["traceId"]
    assert "details" not in response.json()
