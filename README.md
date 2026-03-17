# taller-infra

Introductory infrastructure workshop project for [Eryx](https://eryx.coop). A minimal single-question survey app — simple enough to understand quickly, complex enough to justify a real three-tier stack.

## What it does

- A presenter creates a question at `/new`
- Participants visit `/` and vote on a scale of 1–5
- Results update in real time (polling) while the survey is open
- The presenter can close the survey and reset for a new round

No authentication, sessions, or WebSockets.

## Stack

| Layer     | Technology                                             |
| --------- | ------------------------------------------------------ |
| Backend   | Python 3.14 · FastAPI · SQLAlchemy 2.0 async · uvicorn |
| Database  | PostgreSQL 18                                          |
| Frontend  | React 19 · Vite · TypeScript · nginx                   |
| Local dev | Docker Compose · Task                                  |
| Cloud     | Google Cloud Run · Cloud SQL · Terraform               |

## Getting started

```bash
task init
prek install
task up
```

| Service     | URL                   |
| ----------- | --------------------- |
| Frontend    | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Postgres    | localhost:5432        |

Each sub-project can also be run independently:

```bash
cd backend && task up   # db + backend only
cd frontend && task up  # frontend only
```

## Task

```
task init              Set up env files + install deps
task sync              Install all dependencies (uv + pnpm)
task up                Build and start the full stack
task test              Run all backend tests (SQLite + Postgres)
task pre-commit        Lint + format (runs on git commit)
task pre-push          Full test suite (runs on git push)
task format-prettier   Format all files with prettier

task backend:test          Tests against SQLite in-memory
task backend:test-postgres Tests against real Postgres
task backend:lint          Ruff lint
task backend:format        Ruff format + isort
task backend:serve         Local dev server with hot reload
task backend:build         Build the Docker image
```

## Environment variables

Each sub-project has its own `.env.example`. `task init` copies them to `.env`.

| File            | Variables                           |
| --------------- | ----------------------------------- |
| `backend/.env`  | `DB_USER`, `DB_PASSWORD`, `DB_NAME` |
| `frontend/.env` | `VITE_API_URL`                      |

The root `compose.yml` reads each sub-project's `.env` via `include.env_file`.

For Cloud Run: `DATABASE_URL` goes into Secret Manager; `PORT` is injected by the platform; `VITE_API_URL` is set as a Terraform variable at build time.

## Backend

```
backend/src/mentyx/
  main.py          FastAPI app + lifespan (creates tables on startup)
  database.py      Async SQLAlchemy engine (lazy init)
  models.py        Question, Vote
  schemas.py       Pydantic schemas
  routers/
    question.py    GET/POST /question, PATCH /question/close, DELETE /question
    votes.py       POST /votes, GET /votes/summary
```

Tests use SQLite in-memory by default; `task backend:test-postgres` runs against a real Postgres container.

## Frontend

```
frontend/src/
  App.tsx          URL-based routing: /new → presenter, / → voter
  api.ts           Typed HTTP client
  pages/
    Setup.tsx      Create a question
    Voter.tsx      Cast a vote
    Wait.tsx       Post-vote holding screen + polls until survey closes
    Results.tsx    Live results (polls every 2s while open) + close/reset controls
```

## Project structure

```
taller-infra/
├── Taskfile.yml
├── compose.yml          includes backend/compose.yml + frontend/compose.yml
├── backend/
│   ├── compose.yml      db + backend services
│   ├── Taskfile.yml
│   └── src/mentyx/
├── frontend/
│   ├── compose.yml      frontend service
│   └── src/
└── infra/               Terraform — built during the workshop
```
