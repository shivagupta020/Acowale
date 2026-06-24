# Acowale Pulse

A lightweight customer feedback platform built for the Acowale CRM machine test. Customers can submit categorized feedback from a public form, while the team can securely review responses and analytics in an admin dashboard.

## What is included

- Public feedback form with category, 1–5 rating, comments, and optional contact details
- Field-level server validation and accessible client feedback
- Password-protected admin dashboard
- Total responses, average rating, weekly volume, leading category, and category distribution
- Recent submissions with search, category filtering, and pagination
- Persistent file-backed data store with atomic writes
- Structured request and error logging
- Health-check endpoint and production configuration checks
- Responsive layouts for desktop, tablet, and mobile

Per the candidate scope, unit tests, monitoring, rate limiting, CI/CD, and observability integrations are intentionally excluded.

## Stack and structure

```text
frontend/                 React 19 + Vite client
  src/App.jsx             Public form, sign-in, and dashboard
  src/App.css             Responsive product design
backend/                  Node.js + Express API
  src/index.js            Routes and HTTP middleware
  src/auth.js             Signed admin sessions
  src/validation.js       Feedback validation
  src/store.js            Atomic JSON persistence
  src/logger.js           Structured application logs
  data/feedback.json      Runtime data (created automatically)
```

The app uses only its existing dependencies. The backend relies on Node's built-in crypto and file-system modules for authentication and persistence, keeping local setup and deployment small.

## Run locally

Requirements: Node.js 20 or newer and npm.

1. Configure and start the API:

   ```bash
   cd backend
   cp .env.example .env
   npm install
   npm run dev
   ```

2. In a second terminal, configure and start the web app:

   ```bash
   cd frontend
   cp .env.example .env
   npm install
   npm run dev
   ```

3. Open `http://localhost:5173`. Use the `ADMIN_PASSWORD` value from `backend/.env` to enter the dashboard.

The API runs at `http://localhost:5001` by default. Port 5001 avoids the macOS AirPlay Receiver service, which commonly occupies port 5000. On its first start it creates a small seed dataset in `backend/data/feedback.json` so the dashboard is immediately useful.

## Environment variables

Backend:

| Variable | Purpose | Default |
| --- | --- | --- |
| `PORT` | API listening port | `5001` |
| `NODE_ENV` | Runtime environment | `development` |
| `ALLOWED_ORIGINS` | Comma-separated web origins allowed by CORS | `http://localhost:5173` |
| `ADMIN_PASSWORD` | Dashboard password | Local placeholder only |
| `SESSION_SECRET` | HMAC signing secret for admin sessions | Local placeholder only |
| `SESSION_HOURS` | Admin session lifetime | `8` |
| `DATA_FILE` | JSON data path; point this at a persistent disk in production | `backend/data/feedback.json` |

Frontend:

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_API_URL` | Public URL of the deployed API | `http://localhost:5001` |

Production startup fails when placeholder admin credentials are used. Generate a strong, unique password and session secret before deployment.

## API

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | Service health and uptime |
| `GET` | `/api/categories` | Public | Supported feedback categories |
| `POST` | `/api/feedback` | Public | Validate and store feedback |
| `POST` | `/api/auth/login` | Public | Exchange admin password for a signed session |
| `GET` | `/api/auth/me` | Admin | Validate the current session |
| `GET` | `/api/feedback` | Admin | Paginated, searchable, filterable submissions |
| `GET` | `/api/analytics/summary` | Admin | Dashboard analytics and recent feedback |

Protected requests use `Authorization: Bearer <token>`. API responses consistently return a `success` boolean and either `data` or a safe error `message`.

## Production deployment

Deploy `backend` as a Node web service with `npm start`. Attach a persistent volume and set `DATA_FILE` to a path on that volume. Configure `ADMIN_PASSWORD`, `SESSION_SECRET`, and `ALLOWED_ORIGINS` in the host's secret/environment manager.

Deploy `frontend` as a static Vite application using `npm run build`, serving the generated `dist` directory. Set `VITE_API_URL` at build time to the public backend URL. Both services can be deployed independently on platforms such as Render, Railway, Fly.io, or similar hosts.

For a larger production system, the file store should be migrated to PostgreSQL before horizontal API scaling. See [DECISIONS.md](./DECISIONS.md) for rationale and trade-offs.

## Validation commands

```bash
cd backend && npm run check
cd frontend && npm run lint && npm run build
```
