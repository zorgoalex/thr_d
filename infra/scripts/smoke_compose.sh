#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../.."

echo "=== Building and starting services ==="
docker compose up --build -d --wait
trap 'docker compose down -v' EXIT

echo "=== Health checks ==="
curl --fail --silent http://127.0.0.1:8000/api/v1/health | grep -q '"status":"ok"'
echo "  Backend health: OK"

curl --fail --silent http://127.0.0.1:5173 >/dev/null
echo "  Frontend: OK"

docker compose exec -T postgres pg_isready -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-thr_d}" >/dev/null
echo "  Database: OK"

echo "=== Catalog endpoints ==="
curl --fail --silent http://127.0.0.1:8000/api/v1/templates | grep -q '"items"'
echo "  GET /templates: OK"

curl --fail --silent http://127.0.0.1:8000/api/v1/materials | grep -q '"items"'
echo "  GET /materials: OK"

curl --fail --silent http://127.0.0.1:8000/api/v1/modules | grep -q '"items"'
echo "  GET /modules: OK"

echo "=== Project operations ==="
PROJECT='{"project":{"id":"smoke","name":"Smoke","version":"1.0","unit":"mm","room":{"widthMm":3000,"lengthMm":3000,"heightMm":2700},"items":[],"materials":[],"metadata":{"createdAt":"2026-01-01T00:00:00Z","updatedAt":"2026-01-01T00:00:00Z"}}}'

curl --fail --silent -X POST http://127.0.0.1:8000/api/v1/projects/validate \
  -H 'Content-Type: application/json' -d "$PROJECT" | grep -q '"ok":true'
echo "  POST /validate: OK"

curl --fail --silent -X POST http://127.0.0.1:8000/api/v1/projects/specification \
  -H 'Content-Type: application/json' -d "$PROJECT" | grep -q '"rows"'
echo "  POST /specification: OK"

EXPORT_BODY="${PROJECT%\}},\"formats\":[\"project.json\"]}"
curl --fail --silent -X POST http://127.0.0.1:8000/api/v1/projects/export \
  -H 'Content-Type: application/json' -d "$EXPORT_BODY" | grep -q '"status":"ready"'
echo "  POST /export (JSON): OK"

echo ""
echo "=== ALL SMOKE CHECKS PASSED ==="
