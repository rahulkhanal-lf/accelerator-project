# Server — Claude Spec

## Stack

- **Framework:** NestJS 12 (ESM, `@nestjs/platform-node`)
- **Language:** TypeScript 6, strict mode
- **Testing:** Vitest (unit + e2e), Supertest
- **Linting:** oxlint + oxlint-tsgolint
- **Formatting:** Prettier
- **Package manager:** pnpm
- **Observability:** NestJS Observe (`ObserveModule`)

> NestJS 12 is ESM-only. Relative imports end in `.js`. `__dirname` does not exist — use `import.meta.dirname`. Mocks are `vi.fn()`, not `jest.fn()`.

## Module Architecture

```
src/
  app.module.ts        # root module — imports all feature modules
  main.ts              # bootstrap only
  <feature>/
    <feature>.module.ts
    <feature>.controller.ts
    <feature>.service.ts
    <feature>.repository.ts   # only when persistence is needed
    dto/
      create-<feature>.dto.ts
      update-<feature>.dto.ts
    entities/
      <feature>.entity.ts
    guards/             # feature-local guards
    pipes/              # feature-local pipes
    <feature>.spec.ts   # unit tests
  common/
    filters/            # global exception filters
    guards/             # global guards (auth, roles)
    interceptors/       # logging, transform, timeout
    pipes/              # global validation pipe
    decorators/         # custom param and class decorators
    types/              # shared TypeScript types
```

**Rules:**
- Each feature is a self-contained NestJS module with its own `providers`, `controllers`, `imports`, and `exports`.
- Cross-feature dependencies are injected via the other module's exported providers — never import a service directly across module boundaries.
- `AppModule` only imports feature modules; it contains no business logic.

## Controller Rules

- Controllers handle HTTP only: validate input, call a service, return a response. No business logic.
- Use `@Body({ schema })` with a Standard Schema (Zod/Valibot/ArkType) for validation — not `class-validator` unless the codebase already uses it.
- Always type the return value; prefer specific DTOs over `any` or `object`.
- Use NestJS built-in decorators (`@Get`, `@Post`, `@Param`, `@Query`, `@Body`) — no raw express `req`/`res` unless streaming.
- Prefix routes consistently: `@Controller('feature-name')`.

## Service Rules

- Services contain all business logic; they are `@Injectable()` and stateless.
- Never import `Request` or `Response` from express inside a service.
- One public method per use case; keep private methods for internal steps.
- Side effects (email, events, queues) go in services, never controllers.
- Use NestJS first-party packages before adding third-party libraries (see `AGENTS.md`).

## Validation

- Use `StandardSchemaValidationPipe` with Standard Schema libraries (Zod preferred).
- Define schemas co-located with the DTO file: `create-user.schema.ts` next to `create-user.dto.ts`.
- Validate at the HTTP boundary only; never re-validate inside services.
- Strip unknown fields; reject with `400` on schema failure.

## Error Handling

- Throw NestJS built-in HTTP exceptions (`NotFoundException`, `BadRequestException`, etc.) from services.
- Use a global `AllExceptionsFilter` to catch unhandled errors and return a consistent error envelope.
- Never swallow errors silently; never `catch` and `return null`.
- Log errors with context (request ID, user ID when available) through the injected `Logger`.

## TypeScript

- `strict: true`, `noImplicitAny: true`, `exactOptionalPropertyTypes: true`.
- Never `any`; use `unknown` and narrow.
- Prefer interfaces for object shapes, `type` for unions.
- Avoid decorators outside of NestJS-idiomatic usage.
- Use branded types for domain IDs.

## Database (when added)

- Use `@nestjs/typeorm` or `@nestjs/drizzle` — no raw SQL strings outside a repository.
- Repositories are injectable classes; services never touch the ORM directly.
- Migrations are code-generated and committed; never alter schema by hand in production.
- Transactions wrap multi-step writes.

## Authentication & Authorization

- Use `@nestjs/authentication` for strategies (JWT, session).
- Use `@nestjs/authorization` with RBAC guards — never hardcode role checks in controllers.
- Attach the authenticated user to the request via a guard decorator, not middleware.

## Configuration

- All config via `@nestjs/config` backed by environment variables; never hard-code secrets or URLs.
- Validate the env schema at startup with a Zod schema passed to `ConfigModule.forRoot({ validate })`.
- Access config through the `ConfigService` — never `process.env` directly in business code.

## Testing

- Unit tests: mock only external services and repositories; test services and controllers in isolation.
- e2e tests: spin up the full NestJS app with Supertest; use a test database, not mocks.
- Tests live next to the file they cover (`<feature>.spec.ts`) or in `test/` for e2e.
- Vitest `vi.fn()` for mocks; `vi.spyOn()` for spying on real implementations.
- Aim for 80 % branch coverage on services; controllers need integration-level coverage.

## Observability

- `ObserveModule` is already wired in `app.module.ts` — do not remove it.
- Use `Logger` from `@nestjs/common` (not `console.log`); inject it per-class.
- Instrument slow or critical operations with custom spans when the Observe SDK supports it.
- In production, set `OBSERVE_APP_KEY` and `OBSERVE_APP_SECRET` in the environment.

## API Design

- RESTful resource naming: plural nouns, kebab-case (`/user-profiles/:id`).
- Use `@nestjs/swagger` for OpenAPI documentation when the API is consumer-facing.
- Version routes with URI versioning (`/v1/`) when breaking changes are anticipated.
- Return consistent response envelopes: `{ data, meta }` for lists, `{ data }` for single resources, `{ error, message }` for errors.

## Security

- Enable `helmet` and `cors` in `main.ts` for every environment.
- Use `@nestjs/throttler` for rate limiting on public endpoints.
- Never log sensitive fields (passwords, tokens, PII); use a log sanitiser.
- Validate and sanitise all user input before it reaches the database.
- Use parameterised queries / ORM methods — never string-concatenated SQL.

## What Not To Do

- No business logic in controllers.
- No `any` types.
- No `process.env` direct reads outside `ConfigService`.
- No `console.log` — use `Logger`.
- No cross-module imports that bypass the module's public `exports`.
- No synchronous file I/O on the request path.
- Never commit `.env` files or secrets.
- Never skip `StandardSchemaValidationPipe` on a controller that accepts user input.
