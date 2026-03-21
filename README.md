# thr_d — 3D Furniture Constructor

Web MVP for designing cabinet and modular furniture in 3D. Create projects from templates or from scratch, place modules and parts, configure materials, validate geometry, and export to JSON/CSV/GLB.

## Quick Start

```bash
cp .env.example .env
docker compose up --build -d --wait
```

Open http://localhost:5173

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind v4, React Three Fiber, Zustand, TanStack Query |
| Backend | Python 3.12, FastAPI, Pydantic, SQLAlchemy, PostgreSQL |
| Infra | Docker Compose with healthchecks |

## Features

- **Start screen**: new empty project, starter templates (wardrobe, nightstand, bookcase, kitchen), room size configuration, autosave restore
- **3D viewport**: 5 camera modes (perspective, front, left, right, top), orbit/pan/zoom, drag-to-move objects with snap
- **Library**: 7 tabs — templates, modules, parts, materials, custom panel form, project tree, validation issues
- **Property panel**: edit name, position, rotation (0/90/180/270), material, constrained dimensions
- **Validation**: real-time client + server validation with 9 error codes (room bounds, intersections, dimensions, rotation, cycles, limits)
- **Export**: project.json, specification.csv (semicolon, UTF-8 BOM), scene.glb (client-generated)
- **Import**: project.json with version check
- **Undo/redo**: 50-step snapshot history, Ctrl+Z / Ctrl+Y
- **Clone**: Ctrl+D, assembly cloning with ID remapping
- **Autosave**: IndexedDB with 1500ms debounce
- **Theme**: light/dark toggle with system preference detection
- **Security**: rate limiting, body size limit (5MB), parentId cycle detection, string length validation
- **Hotkeys**: 1-5 (camera), Escape (deselect), Delete, Ctrl+Z/Y/Shift+Z/D

## Seed Catalog

- 8 materials (ЛДСП, МДФ, ДВП, столешница)
- 4 project templates (шкаф, тумба, стеллаж, прямая кухня)
- 4 modules (нижний/верхний шкаф, открытый модуль, тумба с полкой)
- 6 parts (боковая панель, полка, дверца, перегородка, цоколь, столешница)

## API

Base URL: `/api/v1`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/projects/validate` | Validate project geometry |
| POST | `/projects/specification` | Generate cut-list specification |
| POST | `/projects/export` | Export project (JSON/CSV inline, GLB/STEP stubs) |
| GET | `/materials` | List materials catalog |
| GET | `/materials/{id}` | Get material by ID |
| GET | `/templates` | List project templates |
| GET | `/templates/{id}` | Get template by ID |
| GET | `/modules` | List modules and parts |
| GET | `/export-jobs/{id}` | Get export job status |
| DELETE | `/export-jobs/{id}` | Delete export job |

## Local Development

### Frontend

```bash
cd frontend
npm install
npm run dev      # dev server at :5173
npm test         # 107 tests
npx tsc -b       # type check
```

### Backend

```bash
cd backend
uv sync --dev
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
uv run pytest    # 100 tests
uv run ruff check app/ tests/
```

### Full Stack (Docker)

```bash
cp .env.example .env
docker compose up --build -d --wait
# Smoke test:
bash infra/scripts/smoke_compose.sh
```

## Tests

207 total tests:
- Backend: 100 (contracts, API, validators, geometry, specification, exporters, repositories, security, acceptance)
- Frontend: 107 (components, store, geometry, persistence, project I/O, acceptance scenarios)

## Project Structure

```
backend/
  app/
    api/routes/          # FastAPI route handlers
    schemas/             # Pydantic domain + API models
    services/            # Business logic (project, catalog, export, specification)
    providers/seeds/     # Seed catalog data
    validators/          # 7 validators + geometry + composite
    exporters/           # JSON, CSV, STEP/FCSTD stubs
    repositories/        # SQLAlchemy CRUD
    integrations/        # Sync service stub
  tests/

frontend/
  src/
    components/editor/   # Editor shell, viewport, library, properties, tree, validation
    components/start-screen/  # Start screen, room form, template grid
    hooks/               # Camera mode, drag-to-move, theme, editor hotkeys, etc.
    lib/geometry/        # Transforms, AABB, validation, snap (pure functions)
    lib/                 # API client, persistence, autosave, project I/O, clone, etc.
    store/               # Zustand store with history
    types/               # TypeScript domain types
```
