# Backend — contexto para el agente

FastAPI + SQLAlchemy 2.0 async + PostgreSQL. Parte del taller introductorio de infra.

## Stack

- **Python 3.14+** con **uv** como gestor de dependencias y entornos
- **FastAPI** — HTTP REST
- **PostgreSQL** — base de datos principal
- **SQLAlchemy 2.0** (async) + **asyncpg** como driver
- **Alembic** para migraciones

---

## Descripción funcional

La app maneja una única encuesta a la vez. No hay sesiones, no hay usuarios,
no hay códigos de acceso.

Flujo:
1. El primer visitante ve un formulario para escribir la pregunta.
2. Al submitear la pregunta, ese visitante pasa a la página de resultados.
3. Los demás visitantes ven la pregunta y pueden votar con un valor del 1 al 5.
4. Al votar, el votante pasa a una pantalla de espera.
5. El presentador puede refrescar los resultados manualmente con un botón,
   o cerrar la encuesta con otro botón.

No hay WebSockets. No hay autenticación. No hay voter token.

---

## Modelo de datos

```
question
  id         uuid PK
  text       text
  is_open    boolean   ← false = encuesta cerrada, no se puede votar
  created_at timestamptz

vote
  id          uuid PK
  question_id uuid FK → question.id
  value       int      ← debe ser entre 1 y 5 (validado en la capa de API)
  created_at  timestamptz
```

Solo existe una `question` a la vez. No hay constraint en la DB para esto;
el backend simplemente devuelve la única pregunta existente.

---

## Endpoints

```
GET    /question          → devuelve la pregunta actual, 404 si no existe
POST   /question          → crea la pregunta; 409 si ya existe una
PATCH  /question/close    → cierra la encuesta (is_open = false)
POST   /votes             → registra un voto (value 1-5); 409 si is_open = false
GET    /votes/summary     → devuelve conteo de votos agrupado por value
```

---

## Estructura de carpetas

```
backend/
  Dockerfile
  src/mentyx/
    main.py
    database.py          ← engine lazy, get_session
    models.py            ← Question, Vote
    schemas.py           ← schemas Pydantic
    routers/
      question.py
      votes.py
    services/
      vote_service.py    ← lógica de conteo
  tests/
    conftest.py          ← fixture override_db (SQLite in-memory)
    test_question_api.py
    test_votes_api.py
  pyproject.toml
```

---

## Convenciones

- Usar `uuid` como PK en todas las tablas (no serial/int)
- Todas las operaciones de DB son async (`async with session`)
- Los schemas Pydantic se separan en `*Create`, `*Read` por recurso
- Los errores HTTP usan `HTTPException` con códigos estándar
- Validar que `value` esté entre 1 y 5 en el schema Pydantic (no en la DB)
- Los tests usan `httpx.AsyncClient` + `@pytest.mark.anyio` + fixture `override_db`
  que inyecta SQLite in-memory via `app.dependency_overrides`

---

## Lo que ya existe

El esqueleto del proyecto está creado con `uv`, incluyendo:
- `src/mentyx/main.py`, `database.py`, `models.py`, `schemas.py`
- `src/mentyx/routers/` y `services/`
- `tests/conftest.py` con el fixture `override_db`
- Dependencias: fastapi, sqlalchemy, greenlet, httpx, pytest, pytest-anyio, aiosqlite

Antes de generar código nuevo, leé los archivos existentes para no pisar trabajo hecho.
