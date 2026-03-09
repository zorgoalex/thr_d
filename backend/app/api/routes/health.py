from fastapi import APIRouter

from app.db import check_database_connection

router = APIRouter(tags=["health"])


@router.get("/health")
def healthcheck() -> dict[str, object]:
    return {
        "status": "ok",
        "database": "ok" if check_database_connection() else "unavailable",
    }
