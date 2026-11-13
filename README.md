# Accelerator Project

A full-stack web application with a **React 19** frontend and a **NestJS 12** backend, using **PostgreSQL** via TypeORM, **Redis** for rate limiting, and **JWT** cookie-based authentication.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start — Docker (recommended)](#quick-start--docker-recommended)
- [Local Development (without Docker)](#local-development-without-docker)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Auth & Rate Limiting](#auth--rate-limiting)
- [Testing](#testing)
- [Code Quality](#code-quality)
- [Git Hooks (Husky)](#git-hooks-husky)
- [Scripts Reference](#scripts-reference)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript 6, Vite 8, Tailwind CSS v4 |
| Backend | NestJS 12, TypeScript 6, ESM |
| Database | PostgreSQL 17 via TypeORM |
| Cache / Rate limiting | Redis 7 via ioredis |
| Validation | class-validator + class-transformer |
| Auth | bcrypt, Passport JWT (httpOnly cookie) |
| API Docs | Swagger (`/api/docs`) |
| Design | Hallmark skill — Coral theme |
| Testing | Vitest, Supertest |
| Linting | oxlint (server), ESLint (client) |
| Formatting | Prettier (server) |
| Git Hooks | Husky + lint-staged + commitlint |
| Package Manager | pnpm |
| Containers | Docker + Docker Compose |

---

## Project Structure

```
accelerator-project/
├── client/                      # React frontend
│   ├── src/
│   │   ├── features/
│   │   │   ├── auth/            # Login page, API, types
│   │   │   └── dashboard/       # Dashboard page
│   │   ├── lib/                 # Base API fetcher
│   │   ├── tokens.css           # Hallmark Coral design tokens
│   │   ├── base.css             # Hallmark base resets
│   │   └── index.css            # Tailwind v4 entry
│   ├── Dockerfile
│   ├── nginx.conf               # SPA + API proxy for production
│   └── package.json
├── server/                      # NestJS backend
│   ├── src/
│   │   ├── auth/                # Login, logout, JWT strategy, rate limiter
│   │   ├── redis/               # Global Redis module (ioredis)
│   │   ├── users/               # UsersService (auth-internal only)
│   │   ├── config/              # database.config.ts
│   │   └── database/
│   │       ├── migrations/      # TypeORM migration files
│   │       ├── seeds/           # Database seeders
│   │       └── data-source.ts
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml           # Full stack (postgres + redis + server + client)
├── docker-compose.dev.yml       # Infrastructure only (postgres + redis)
├── CLAUDE.md
└── package.json
```

---

## Prerequisites

- **Docker & Docker Compose** — for the recommended quick-start
- **Node.js** >= 20 and **pnpm** >= 9 — for local development without Docker

---

## Quick Start — Docker (recommended)

The easiest way to run the full stack. No local Postgres or Redis needed.

### 1. Clone

```bash
git clone https://github.com/rahulkhanal-lf/accelerator-project.git
cd accelerator-project
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and set a real `JWT_SECRET`. Everything else works with the defaults.

### 3. Start all services

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Client | http://localhost:5173 |
| Server API | http://localhost:3000 |
| Swagger UI | http://localhost:3000/api/docs |

### 4. Run migrations & seed (first time)

```bash
docker compose exec server pnpm migration:run
docker compose exec server pnpm seed:users
```

### Stop

```bash
docker compose down          # stop containers, keep volumes
docker compose down -v       # stop and delete volumes (wipes DB + Redis)
```

---

## Local Development (without Docker)

Use `docker-compose.dev.yml` to run only Postgres and Redis, then run the app processes yourself.

### 1. Start infrastructure

```bash
docker compose -f docker-compose.dev.yml up -d
```

### 2. Install dependencies

```bash
cd server && pnpm install && cd ../client && pnpm install && cd ..
```

### 3. Configure environment

```bash
cp server/.env.example server/.env
# defaults already match the dev Docker services
```

### 4. Run migrations & seed

```bash
cd server
pnpm migration:run
pnpm seed:users   # optional — 15 Nepali-name test users (password: Password@123)
```

### 5. Start dev servers

```bash
# Terminal 1
cd server && pnpm start:dev

# Terminal 2
cd client && pnpm dev
```

| Service | URL |
|---|---|
| Client | http://localhost:5173 |
| Server API | http://localhost:3000 |
| Swagger UI | http://localhost:3000/api/docs |

### 6. Activate Git hooks (one-time)

```bash
pnpm dlx husky
```

---

## Environment Variables

All environment variables live in `server/.env`.

```bash
cp server/.env.example server/.env
```

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port the NestJS server listens on |
| `NODE_ENV` | `development` | `development` / `production` |
| `DATABASE_URL` | `postgresql://postgres:password@localhost:5432/accelerator-project` | PostgreSQL connection string |
| `DATABASE_SSL` | `false` | Set `true` for SSL-enabled hosted databases |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection string |
| `JWT_SECRET` | — | Long random string — **change before deploying** |
| `JWT_EXPIRES_IN` | `7d` | JWT token expiry |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin |

---

## Database

TypeORM manages the schema via migrations. Never enable `synchronize: true`.

### Migrations

```bash
cd server

# Generate from entity changes (PascalCase name)
pnpm migration:generate src/database/migrations/<MigrationName>

# Apply all pending migrations
pnpm migration:run

# Revert the last migration
pnpm migration:revert

# Show migration status
pnpm migration:show
```

### Seeding

```bash
cd server
pnpm seed:users   # idempotent — skips already-seeded emails
```

Seeded password for all users: `Password@123`

---

## Auth & Rate Limiting

### Login flow

`POST /api/v1/auth/login` — validates credentials, sets a signed JWT as an `httpOnly; SameSite=Strict` cookie (never readable from JS), returns user info.

`POST /api/v1/auth/logout` — clears the cookie.

### Login rate limiting (Redis)

Failed login attempts are tracked in Redis with a **5-minute fixed window**:

| Attempts | Behaviour |
|---|---|
| 1–4 | `401 Unauthorized — Invalid credentials` |
| 5+ | `429 Too Many Requests — Try again in N minutes` |

The counter resets automatically when the 5-minute TTL expires, or immediately on a successful login. Unknown email addresses are also counted to prevent user enumeration.

---

## Testing

```bash
cd server

pnpm test          # unit tests (Vitest)
pnpm test:watch    # watch mode
pnpm test:cov      # with coverage
pnpm test:e2e      # end-to-end (Supertest)
```

---

## Code Quality

```bash
# Server — oxlint
cd server && pnpm lint

# Server — Prettier
cd server && pnpm format

# Client — ESLint
cd client && pnpm lint
```

---

## Git Hooks (Husky)

| Hook | Trigger | Action |
|---|---|---|
| `pre-commit` | `git commit` | Runs lint-staged on staged files |
| `commit-msg` | `git commit` | Validates Conventional Commits format |

### Commit format

```
<type>(<scope>): <short summary>

Types: feat | fix | chore | refactor | test | docs | style | perf | ci
```

---

## Scripts Reference

### Server (`cd server`)

| Script | Description |
|---|---|
| `pnpm start:dev` | Dev mode with watch |
| `pnpm start:debug` | Dev mode with debugger |
| `pnpm start:prod` | Run compiled production build |
| `pnpm build` | Compile TypeScript to `dist/` |
| `pnpm lint` | Lint with oxlint |
| `pnpm format` | Format with Prettier |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm test:watch` | Unit tests in watch mode |
| `pnpm test:cov` | Unit tests with coverage |
| `pnpm test:e2e` | End-to-end tests |
| `pnpm migration:generate <path>` | Generate migration from entity diff |
| `pnpm migration:run` | Apply pending migrations |
| `pnpm migration:revert` | Revert last migration |
| `pnpm migration:show` | List all migrations and status |
| `pnpm seed:users` | Seed 15 Nepali-name users |

### Client (`cd client`)

| Script | Description |
|---|---|
| `pnpm dev` | Vite dev server |
| `pnpm build` | Production build |
| `pnpm preview` | Serve the production build |
| `pnpm lint` | ESLint |

### Docker

| Command | Description |
|---|---|
| `docker compose up --build` | Build and start all services |
| `docker compose up -d` | Start in background |
| `docker compose down` | Stop (keep volumes) |
| `docker compose down -v` | Stop and delete volumes |
| `docker compose -f docker-compose.dev.yml up -d` | Infra only (Postgres + Redis) |
| `docker compose exec server pnpm migration:run` | Run migrations inside container |
| `docker compose exec server pnpm seed:users` | Seed inside container |
