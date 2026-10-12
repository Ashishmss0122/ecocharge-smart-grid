# ECOCHARGE — Smart EV Charging Station Management System

**Charge Smarter. Drive Greener.**

A full-stack EV charging platform: station discovery, charger reservation, QR
check-in, charging-session simulation, simulated payments, analytics, plus
owner and admin consoles.

Live app : https://ecocharge-smart-grid.vercel.app

---

## 1. Technology stack (as actually built)

| Layer      | Technology                                                          |
| ---------- | ------------------------------------------------------------------- |
| Frontend   | React 19, Vite 8, Tailwind CSS 4, Framer Motion, Lucide, Recharts     |
| Routing    | TanStack Router (file-based routes in `src/routes/`)                  |
| Backend    | TanStack Start server functions + server routes (SSR via Nitro)       |
| Database   | PostgreSQL (managed), SQL migrations in `supabase/migrations/`        |
| Auth       | JWT-based sessions, bcrypt-hashed passwords (managed auth service)    |
| Tests      | Vitest                                                                |
| CI         | GitHub Actions                                                        |
| Containers | Docker (multi-stage) + Docker Compose (app + Postgres)                |

> **Honest note on the original spec.** The brief asked for Express + MySQL.
> This project runs on TanStack Start server functions and **PostgreSQL**.
> The server functions are the REST/RPC layer (typed, validated, authenticated)
> and Postgres holds the same relational schema — primary keys, foreign keys,
> indexes, constraints, timestamps and status fields. Shipping a MySQL container
> that nothing connects to would be decoration, so Compose runs Postgres.

### Architecture

```text
                 ┌──────────────────────────────┐
   Browser  ───▶ │  React 19 SPA + SSR (Vite)   │
                 │  TanStack Router routes      │
                 └──────────────┬───────────────┘
                                │ typed server functions / api routes
                 ┌──────────────▼───────────────┐
                 │  Nitro server (Node or Edge) │
                 │  auth middleware, validation │
                 │  /api/public/health          │
                 └──────────────┬───────────────┘
                                │ SQL (row-level security)
                 ┌──────────────▼───────────────┐
                 │        PostgreSQL            │
                 │ users, vehicles, stations,   │
                 │ chargers, bookings, sessions,│
                 │ payments, reviews, complaints│
                 └──────────────────────────────┘
```

---

## 2. Local setup

Prerequisites: [Bun](https://bun.sh) (or Node 22 + npm) and optionally Docker.

```sh
git clone <this-repository-url>
cd <repository-name>
cp .env.example .env      # fill in the values
bun install
bun run dev               # http://localhost:8080
```

### Scripts

| Script                  | Purpose                              |
| ----------------------- | ------------------------------------ |
| `bun run dev`           | Dev server with HMR                  |
| `bun run build`         | Production build                     |
| `bun run test`          | Vitest in watch mode                 |
| `bun run test:run`      | Single test run (used by CI)         |
| `bun run test:coverage` | Coverage report (v8, lcov + text)    |
| `bun run typecheck`     | `tsc --noEmit`                       |
| `bun run lint`          | ESLint + Prettier                    |
| `bun run format`        | Prettier write                       |

---

## 3. Environment variables

All values live in `.env` (never committed). See `.env.example`.

| Variable                        | Scope  | Description                                     |
| ------------------------------- | ------ | ----------------------------------------------- |
| `VITE_SUPABASE_URL`             | client | Backend API base URL (inlined at build time)     |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | client | Publishable (public) API key                     |
| `VITE_SUPABASE_PROJECT_ID`      | client | Backend project identifier                       |
| `SUPABASE_URL`                  | server | Backend API base URL for server functions        |
| `SUPABASE_PUBLISHABLE_KEY`      | server | Publishable key for server-side public reads     |
| `SUPABASE_SERVICE_ROLE_KEY`     | server | Privileged key — **secret**, server only         |
| `POSTGRES_USER/PASSWORD/DB`     | server | Local Compose Postgres credentials               |
| `DATABASE_URL`                  | server | Postgres connection string                       |
| `PORT` / `APP_PORT`             | server | HTTP port (container default `3000`)             |

No database password or JWT secret is hardcoded anywhere in source.

---

## 4. DevOps implementation

### 4.1 Automated tests (Vitest)

`tests/` contains real assertions against real application logic:

- `geo.test.ts` — Haversine distance, bounding boxes, map projection
- `recommend.test.ts` — station scoring, energy/cost estimation, wait-time model
- `bookings.test.ts` — booking quote pricing and double-booking conflict errors
- `format.test.ts` — currency (₹), distance and duration formatting
- `logger.test.ts` — JSON log shape and secret redaction

```sh
bun run test:run
bun run test:coverage
```

### 4.2 Continuous Integration — `.github/workflows/ci.yml`

Runs on every push and pull request to `main`:

1. Checkout repository
2. Setup Bun + restore dependency cache
3. `bun install --frozen-lockfile`
4. `bun run test:run`
5. `bun run lint`
6. `bun run typecheck`
7. `bun run build` and verify the build output exists
8. Second job: build the Docker image with Buildx layer caching

Public config is supplied via repository secrets with safe CI placeholders as
fallback, so forks can run the pipeline without credentials.

### 4.3 Docker

`Dockerfile` is a multi-stage build:

- **Stage 1 (`oven/bun:1.2-alpine`)** installs deps from the lockfile and builds
  with `DOCKER_NITRO_PRESET=node-server`, producing a plain Node server bundle.
- **Stage 2 (`node:22-alpine`)** copies only `.output`, runs as a non-root user,
  exposes `3000` and declares a `HEALTHCHECK` hitting `/api/public/health`.

```sh
docker build -t ecocharge:local \
  --build-arg VITE_SUPABASE_URL=... \
  --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=... \
  --build-arg VITE_SUPABASE_PROJECT_ID=... .
docker run --rm -p 3000:3000 --env-file .env ecocharge:local
```

### 4.4 Docker Compose

```sh
cp .env.example .env
docker compose up --build
# app  → http://localhost:3000
# db   → localhost:5432
```

- `db`: `postgres:16-alpine` with a named volume and `pg_isready` healthcheck.
  `supabase/migrations/` is mounted into `/docker-entrypoint-initdb.d`, so the
  schema is applied in filename order on first boot.
- `app`: built from the Dockerfile, starts only after the database is healthy.

### 4.5 Health checks

`GET /api/public/health` returns:

```json
{ "status": "ok", "uptime": 12.34, "checks": { "server": "ok", "database": "ok" } }
```

`200` when healthy, `503` when the database is unreachable. Used by Docker,
Compose and any external uptime monitor.

### 4.6 Structured logging

`src/lib/logger.ts` emits single-line JSON (`level`, `event`, `time`, context)
so Docker or platform log drains can parse it, and automatically redacts keys
containing `password`, `token`, `secret`, `key`, `authorization`.

### 4.7 Continuous Deployment

**Lovable (current production).** Push to `main` syncs to the project; clicking
Publish deploys the frontend. Backend changes deploy immediately.

**Vercel (alternative).**

1. Import the GitHub repository in Vercel.
2. Framework preset: **Other**. Build command `bun run build`, output `.output`.
3. Add the environment variables from section 3 for Preview and Production.
4. Every push to `main` deploys to production; pull requests get preview URLs.
   Protect `main` with a required status check on the CI `verify` job so only
   green commits can deploy.

**Self-hosted (Docker).** Build the image in CI, push it to a registry, then
`docker compose pull && docker compose up -d` on the host.

---

## 5. Application surface

Server functions and routes back these operations:

- **Auth** — register, login, current session, role-based access control
- **Stations** — list, detail, create, update, delete (owner-scoped)
- **Chargers** — list per station, create, update price/status/maintenance
- **Bookings** — create (overlap-protected), list, detail, cancel
- **Charging** — start, progress update, stop with final summary
- **Payments** — simulated checkout and receipt retrieval
- **Recommendations** — multi-factor scoring (distance, price, speed,
  availability, rating, estimated wait) with human-readable reasons
- **Admin** — platform metrics, user management, station approval, complaints

Roles: **EV User**, **Station Owner**, **Admin**. Admin is never selectable in
public registration. Every table is protected by row-level security policies.

Seed data covers Hyderabad stations: EcoCharge Gachibowli, GreenVolt Hitech
City, ChargeHub Madhapur, EV Power Banjara Hills, RapidCharge Secunderabad —
each with coordinates, hours, amenities, ratings and mixed AC/DC chargers.

---

## 6. Team split (git-friendly)

| Member | Area                                            |
| ------ | ----------------------------------------------- |
| 1      | Frontend / UX — routes, components, theming     |
| 2      | Auth & API layer — server functions, validation |
| 3      | Database, booking and charging logic            |
| 4      | Owner/Admin consoles, DevOps, testing           |

Built with [Lovable](https://lovable.dev) — continue in the
[editor](https://lovable.dev/projects/3424edfa-7e54-4c40-9ef4-582d60d3a008).
