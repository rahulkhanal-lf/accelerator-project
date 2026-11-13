# Accelerator Project

A full-stack web application with a **React 19** frontend and a **NestJS 12** backend, using **PostgreSQL** via TypeORM.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Database](#database)
- [Testing](#testing)
- [Code Quality](#code-quality)
- [Git Hooks (Husky)](#git-hooks-husky)
- [Scripts Reference](#scripts-reference)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript 6, Vite 8 |
| Backend | NestJS 12, TypeScript 6, ESM |
| Database | PostgreSQL via TypeORM |
| Validation | class-validator + class-transformer |
| Auth | bcrypt, Passport JWT (planned) |
| API Docs | Swagger (`/api/docs`) |
| Styling | CSS custom properties + Tailwind CSS |
| Testing | Vitest, Supertest |
| Linting | oxlint (server), ESLint (client) |
| Formatting | Prettier (server) |
| Git Hooks | Husky + lint-staged |
| Package Manager | pnpm |

---

## Project Structure

```
accelerator-project/
├── client/                   # React frontend
│   ├── src/
│   │   ├── features/         # Domain-scoped feature modules
│   │   ├── components/       # Shared UI components
│   │   ├── hooks/            # Shared hooks
│   │   ├── lib/              # Pure utilities, API client
│   │   └── types/            # Global TypeScript types
│   ├── .claude/skills/       # Hallmark design skill
│   ├── CLAUDE.md             # Client architecture spec
│   └── package.json
├── server/                   # NestJS backend
│   ├── src/
│   │   ├── common/           # Shared pipes, filters, guards
│   │   ├── config/           # Database and app config
│   │   ├── database/
│   │   │   ├── migrations/   # TypeORM migration files
│   │   │   ├── seeds/        # Database seeders
│   │   │   └── data-source.ts
│   │   └── users/            # Users feature module
│   ├── CLAUDE.md             # Server architecture spec
│   └── package.json
├── .husky/                   # Git hooks
├── CLAUDE.md                 # Root project spec
└── package.json              # Root (husky + lint-staged)
```

---

## Prerequisites

- **Node.js** >= 20
- **pnpm** >= 9 — `npm install -g pnpm`
- **PostgreSQL** >= 15 running locally (or via Docker)

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/rahulkhanal-lf/accelerator-project.git
cd accelerator-project
```

Install dependencies for all workspaces:

```bash
cd server && pnpm install && cd ../client && pnpm install && cd ..
```

### 2. Set up environment variables

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and fill in your values (see [Environment Variables](#environment-variables)).

### 3. Set up the database

Create the PostgreSQL database:

```bash
psql -U postgres -c "CREATE DATABASE \"accelerator-project\";"
```

Run migrations:

```bash
cd server && pnpm migration:run
```

(Optional) Seed 15 users with Nepali names:

```bash
cd server && pnpm seed:users
```

### 4. Activate Git hooks

```bash
pnpm dlx husky
```

---

## Environment Variables

All environment variables live in `server/.env`. Copy from the example:

```bash
cp server/.env.example server/.env
```

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port the NestJS server listens on |
| `NODE_ENV` | `development` | `development` / `production` |
| `DATABASE_URL` | `postgresql://postgres:password@localhost:5432/accelerator-project` | Full PostgreSQL connection string |
| `DATABASE_SSL` | `false` | Set `true` for SSL-enabled hosted databases |
| `JWT_SECRET` | — | Long random string for JWT signing — **change before deploying** |
| `JWT_EXPIRES_IN` | `7d` | JWT token expiry |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin (client dev server) |

---

## Running the Project

### Server (NestJS)

```bash
cd server

# Development (watch mode)
pnpm start:dev

# Debug mode
pnpm start:debug

# Production (build first)
pnpm build
pnpm start:prod
```

Server runs at `http://localhost:3000`
Swagger UI at `http://localhost:3000/api/docs`

### Client (React + Vite)

```bash
cd client

# Development server
pnpm dev

# Production build
pnpm build

# Preview production build
pnpm preview
```

Client runs at `http://localhost:5173`

---

## Database

TypeORM is used with PostgreSQL. The CLI is wrapped via pnpm scripts in `server/`.

### Migrations

```bash
cd server

# Generate a migration from entity changes
pnpm migration:generate src/database/migrations/<MigrationName>

# Apply all pending migrations
pnpm migration:run

# Revert the last migration
pnpm migration:revert

# Show all migrations and their status
pnpm migration:show
```

> Migration files are TypeScript and live in `server/src/database/migrations/`.

### Seeding

```bash
cd server

# Seed 15 users with Nepali names (idempotent — skips existing emails)
pnpm seed:users
```

Default seeded password for all users: `Password@123`
Admin user: `prakash.bhattarai@example.com`

---

## Testing

### Server

```bash
cd server

# Run all unit tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:cov

# End-to-end tests
pnpm test:e2e

# Debug tests
pnpm test:debug
```

Tests use **Vitest** and **Supertest**. Unit test files are co-located (`*.spec.ts`). E2e tests live in `server/test/`.

### Client

No test runner configured yet. Add Vitest when the first component tests are written.

---

## Code Quality

### Server linting (oxlint)

```bash
cd server
pnpm lint
```

### Server formatting (Prettier)

```bash
cd server
pnpm format
```

### Client linting (ESLint)

```bash
cd client
pnpm lint
```

---

## Git Hooks (Husky)

Husky runs checks automatically on git events.

### Setup (one-time, after cloning)

```bash
pnpm dlx husky
```

### Hooks

| Hook | Trigger | What it does |
|---|---|---|
| `pre-commit` | `git commit` | Runs lint-staged on staged files |
| `commit-msg` | `git commit` | Validates commit message format with commitlint |

### lint-staged

On every commit, only staged files are linted:

- `server/src/**/*.ts` → `oxlint`
- `client/src/**/*.{ts,tsx}` → `eslint`

### Commit message format

This project follows **Conventional Commits**:

```
<type>(<scope>): <short summary>

Types: feat | fix | chore | refactor | test | docs | style | perf | ci
```

Examples:
```
feat(users): add password reset endpoint
fix(auth): handle expired JWT gracefully
chore(deps): update NestJS to 12.1
docs(readme): add migration instructions
```

---

## Scripts Reference

### Server (`cd server`)

| Script | Description |
|---|---|
| `pnpm start:dev` | Start in watch/dev mode |
| `pnpm start:debug` | Start with debugger attached |
| `pnpm start:prod` | Start compiled production build |
| `pnpm build` | Compile TypeScript to `dist/` |
| `pnpm lint` | Lint with oxlint |
| `pnpm format` | Format with Prettier |
| `pnpm test` | Run unit tests (Vitest) |
| `pnpm test:watch` | Unit tests in watch mode |
| `pnpm test:cov` | Unit tests with coverage |
| `pnpm test:e2e` | Run e2e tests |
| `pnpm migration:generate <path>` | Generate migration from entity diff |
| `pnpm migration:run` | Apply pending migrations |
| `pnpm migration:revert` | Revert last migration |
| `pnpm migration:show` | List all migrations and status |
| `pnpm seed:users` | Seed database with 15 Nepali-name users |

### Client (`cd client`)

| Script | Description |
|---|---|
| `pnpm dev` | Start Vite dev server |
| `pnpm build` | Production build |
| `pnpm preview` | Serve the production build locally |
| `pnpm lint` | Lint with ESLint |
