# taller-infra

Introductory infrastructure workshop project for [Eryx](https://eryx.coop). A minimal single-question survey app — simple enough to understand quickly, complex enough to justify a real three-tier stack.

## What it does

- A presenter creates a question at `/new`
- Participants visit `/` and vote on a scale of 1–5
- Results update in real time (polling) while the survey is open
- The presenter can close the survey and reset for a new round

No authentication, sessions, or WebSockets.

## Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.14 · FastAPI · SQLAlchemy 2.0 async · uvicorn |
| Database | PostgreSQL 18 |
| Frontend | React 19 · Vite · TypeScript · nginx |
| Local dev | Docker Compose |
| Cloud | Google Cloud Run · Cloud SQL · Terraform |

## Running locally

```bash
cp .env.example .env          # optional. defaults work out of the box
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Postgres | localhost:5432 |

## Environment variables

See [`.env.example`](.env.example). Compose reads `.env` automatically.

| Variable | Used by | Notes |
|---|---|---|
| `DB_USER` | compose → postgres + backend | default: `mentyx` |
| `DB_PASSWORD` | compose → postgres + backend | default: `mentyx` |
| `DB_NAME` | compose → postgres + backend | default: `mentyx` |
| `VITE_API_URL` | frontend build | URL the browser uses to reach the backend |

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

Run tests:

```bash
cd backend
uv run pytest
```

## Frontend

```
frontend/src/
  App.tsx          URL-based routing: /new → presenter, / → voter
  api.ts           Typed HTTP client
  pages/
    Setup.tsx      Create a question
    Voter.tsx      Cast a vote
    Wait.tsx       Post-vote holding screen
    Results.tsx    Live results + close/reset controls
```

## Project structure

```
taller-infra/
├── compose.yml
├── .env.example
├── backend/
├── frontend/
└── infra/          Terraform — built during the workshop
```
