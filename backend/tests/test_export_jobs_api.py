def test_get_export_job_not_found_returns_404(client) -> None:
    response = client.get("/api/v1/export-jobs/nonexistent")

    assert response.status_code == 404
    body = response.json()
    assert body["code"] == "EXPORT_JOB_NOT_FOUND"
    assert body["traceId"]


def test_delete_export_job_not_found_returns_404(client) -> None:
    response = client.delete("/api/v1/export-jobs/nonexistent")

    assert response.status_code == 404
    body = response.json()
    assert body["code"] == "EXPORT_JOB_NOT_FOUND"
    assert body["traceId"]
