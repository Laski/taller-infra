# Taller introductorio de infra — monorepo

Este repo es la app de ejemplo para un taller introductorio de infraestructura
en una cooperativa de software. Es una encuesta simple de una sola pregunta,
diseñada para ser lo más sencilla posible mientras justifica tener un backend,
una base de datos y un frontend separados.

## Objetivo pedagógico

- Cómo se estructura un backend con FastAPI
- Cómo contenerizar servicios con Docker
- Cómo llevar una app a la nube con Terraform (Cloud Run + Cloud SQL)

---

## Stack general

| Capa       | Tecnología                                 |
| ---------- | ------------------------------------------ |
| Backend    | Python 3.14+, FastAPI, SQLAlchemy, uvicorn |
| Base datos | PostgreSQL 18                              |
| Frontend   | React + Vite (TypeScript)                  |
| Local      | docker-compose                             |
| Infra/nube | Terraform, Google Cloud Run, Cloud SQL     |

---

## Estructura del repo

```
backend/        ← API FastAPI (ver backend/AGENTS.md)
frontend/       ← SPA React/Vite (ver frontend/AGENTS.md)
infra/          ← Terraform (se construye durante el taller)
compose.yml
```

---

## compose.yml

Levanta tres servicios locales:

- `db` — postgres:18-alpine, puerto 5432
- `backend` — build: ./backend, puerto 8000, depende de db
- `frontend` — build: ./frontend, puerto 3000, depende de backend

---

## Infra (Terraform — se construye durante el taller)

El directorio `infra/` se completa durante el taller.
El objetivo es llevar la app a producción en Google Cloud con:

- Cloud Run para el backend
- Cloud Run para el frontend (imagen nginx)
- Cloud SQL PostgreSQL

No generes código Terraform salvo que se pida explícitamente.

---

## Convenciones generales

- Código claro y didáctico: priorizá legibilidad sobre optimización
- Comentá las decisiones no obvias
- No implementes nada que no esté en el MVP descrito en backend/AGENTS.md
  y frontend/AGENTS.md
- El código y los comentarios van en inglés
