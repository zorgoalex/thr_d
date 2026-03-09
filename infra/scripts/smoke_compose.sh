#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../.."

docker compose up --build -d
trap 'docker compose down -v' EXIT

curl --fail --silent http://127.0.0.1:8000/api/v1/health >/dev/null
curl --fail --silent http://127.0.0.1:5173 >/dev/null
docker compose exec -T postgres pg_isready -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-thr_d}" >/dev/null
