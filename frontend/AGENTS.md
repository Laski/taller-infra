# Frontend — contexto para el agente

React + Vite (TypeScript). Parte del taller introductorio de infra.

## Stack

- **React + Vite** (TypeScript) — build estático, sin SSR
- El Dockerfile es multistage: primera etapa `node` corre `vite build`,
  segunda etapa `nginx:alpine` sirve el `dist/` resultante

---

## Comunicación con el backend

Las llamadas HTTP usan la variable de entorno `VITE_API_URL`
(en local apunta a `http://localhost:8000`, en prod a la URL del servicio Cloud Run).

No hay WebSockets.

---

## Flujo de la app

Al entrar, el frontend consulta `GET /question`:

- **Sin pregunta** → mostrar formulario para crear la pregunta (vista Presenter setup)
- **Con pregunta abierta** → mostrar el formulario de votación (vista Voter)
- **Con pregunta cerrada** → mostrar pantalla de espera (vista Wait)

Una vez que el presentador submitea la pregunta (`POST /question`), navega
automáticamente a la vista de resultados.

---

## Páginas y componentes

```
frontend/src/
  pages/
    Setup.tsx      ← formulario para crear la pregunta (texto libre)
    Voter.tsx      ← muestra la pregunta y permite votar del 1 al 5
    Wait.tsx       ← pantalla de espera post-voto (o encuesta cerrada)
    Results.tsx    ← resultados: conteo por valor + botón refresh + botón cerrar
  api.ts           ← llamadas HTTP al backend
  App.tsx          ← lógica de routing inicial (consulta GET /question al montar)
```

### Detalle de cada página

**Setup** — campo de texto para la pregunta + botón "Lanzar encuesta".
Al submitear llama `POST /question` y navega a Results.

**Voter** — muestra el texto de la pregunta y 5 botones (valores 1 a 5).
Al votar llama `POST /votes` y navega a Wait.

**Wait** — pantalla estática que dice "¡Gracias por votar!" (o similar).
No hace polling.

**Results** — muestra cuántos votos recibió cada valor (1 a 5).
Tiene dos botones:
- "Actualizar" → llama `GET /votes/summary` y re-renderiza
- "Cerrar encuesta" → llama `PATCH /question/close` y redirige a Wait
