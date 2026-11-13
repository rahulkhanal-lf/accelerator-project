# Accelerator Project — Claude Spec

## Monorepo Structure

```
accelerator-project/
  client/   # React 19 + Vite + TypeScript (see client/CLAUDE.md)
  server/   # NestJS 12 + TypeScript, ESM (see server/CLAUDE.md)
```

Each workspace has its own `CLAUDE.md` with detailed rules. This file covers cross-cutting concerns.

## Running the Project

```bash
# Server
cd server && pnpm install && pnpm start:dev

# Client
cd client && pnpm install && pnpm dev
```

## Cross-Cutting Rules

### Spec-Driven Development

Every feature starts with a spec before code is written:

1. **Define the contract first.** For any new endpoint or component, write the input/output types and validation schema before implementation.
2. **API contract is shared.** Types that cross the client/server boundary live in a shared spec or are duplicated deliberately — never infer the shape from the implementation.
3. **Validation is dual-layer.** The server validates all input regardless of what the client sends. The client validates for UX, not for security.
4. **No feature without tests.** A controller + service needs at least one unit test per service method and one e2e test per route. A React component needs at least a smoke test.

### Shared Conventions

- **TypeScript strict mode** everywhere; no `any`.
- **pnpm** for all package management.
- **Kebab-case** for filenames, **PascalCase** for React components and NestJS classes, **camelCase** for variables and functions.
- **No secrets in source.** All environment-specific values go in `.env` (gitignored). Provide `.env.example` with keys but no values.
- **No `console.log`** in committed code — use the framework logger.
- **Conventional Commits** for all commit messages: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`.

### Security (Full-Stack)

| Layer | Responsibility |
|---|---|
| Client | Input validation for UX; sanitise rendered HTML; store tokens in `httpOnly` cookies |
| Network | HTTPS only in production; CORS restricted to known origins |
| Server | Authoritative validation of all input; authentication; authorisation; rate limiting |
| Database | Parameterised queries only; least-privilege DB user |

**Never trust the client for security decisions.** All access control is enforced server-side.

### Authentication Flow

- Auth is handled by `@nestjs/authentication` on the server (strategy TBD: JWT or session).
- Tokens/cookies are set by the server with `httpOnly; Secure; SameSite=Strict`.
- The client never reads or stores raw tokens in JS-accessible storage.
- Protected routes on the client redirect to login when the server returns `401`.

### Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `VITE_API_URL` | client `.env` | Backend base URL for browser fetch |
| `PORT` | server `.env` | Port the NestJS server listens on |
| `DATABASE_URL` | server `.env` | DB connection string |
| `JWT_SECRET` | server `.env` | JWT signing secret |
| `OBSERVE_APP_KEY` | server `.env` | NestJS Observe key |
| `OBSERVE_APP_SECRET` | server `.env` | NestJS Observe secret |

## Design System (Client)

The **Hallmark** skill (`client/.claude/skills/hallmark/`) governs all visual output:

- Invoke `/hallmark` before building any new page or component.
- The Floor rules in `hallmark/SKILL.md` are non-negotiable.
- Run `sloplint --render` before marking UI work done.
- See `client/CLAUDE.md § Design (Hallmark Skill)` for the full workflow.

## Git Workflow

- Branch from `main`; short-lived feature branches (`feat/<name>`, `fix/<name>`).
- PRs require passing lint and tests before merge.
- Never force-push `main`.
- Commit attribution: end commit messages with `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`.

## What Not To Do (Global)

- Never commit `.env` files or any file containing secrets.
- Never bypass the server's validation/auth by trusting client-sent data.
- Never add a dependency without checking if NestJS or React already provides it natively.
- Never merge code with failing tests or lint errors.
- Never use `any` in TypeScript.
