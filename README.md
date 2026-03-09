# thr_d

Foundation workspace for the MVP v0.5 3D furniture constructor.

## Stack

- `frontend`: React + TypeScript + Vite
- `backend`: FastAPI + Pydantic + SQLAlchemy
- `database`: PostgreSQL
- `local orchestration`: Docker Compose

## Local development

### Frontend

```bash
cd frontend
npm install
npm run dev
npm run test
```

### Backend

```bash
cd backend
uv sync --group dev
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
uv run pytest
```

### Full stack

```bash
cp .env.example .env
docker compose up --build
```

## Current implementation scope

- Stage 0: project scaffold, Docker, Compose, env templates, logging, CORS, trace IDs, smoke tests
- Stage 1: canonical domain contracts and API DTOs with unit coverage
