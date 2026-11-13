# Client — Claude Spec

## Stack

- **Framework:** React 19 + TypeScript 6 + Vite 8
- **Styling:** CSS custom properties (tokens at `:root`); no CSS-in-JS
- **Linting:** typescript-eslint, eslint-plugin-react-hooks, eslint-plugin-react-refresh
- **Package manager:** pnpm

## Architecture

```
src/
  features/        # one folder per domain (auth, dashboard, …)
    <feature>/
      components/  # feature-local UI
      hooks/       # feature-local hooks
      api.ts       # all fetch calls for this feature
      types.ts     # TypeScript types/interfaces
      index.ts     # public re-exports only
  components/      # shared, feature-agnostic UI
  hooks/           # shared hooks
  lib/             # pure utilities (no React)
  types/           # global types and branded primitives
  App.tsx
  main.tsx
```

**Rules:**
- Features import from `components/`, `hooks/`, `lib/` — never from each other's internals.
- Cross-feature data flows through state lifted to `App.tsx` or a shared context, not through prop drilling across feature boundaries.
- `index.ts` is the only public surface of a feature; never import from internal paths directly.

## Component Rules

- One component per file; filename matches the export name in PascalCase.
- Prefer function components with explicit return types: `export function Foo(): React.ReactElement`.
- Keep components under ~150 lines. Split when they grow larger.
- No `React.FC` — it hides the return type and complicates generics.
- Extract custom hooks for any stateful logic beyond a single `useState`.
- Never pass more than 5 props; group related ones into an object.

## State Management

- Local UI state: `useState` / `useReducer`.
- Server state: React Query (`@tanstack/react-query`) when added — not `useEffect` + `fetch`.
- Global client state: React Context with a custom hook wrapper; avoid prop drilling beyond 2 levels.
- Never store derived data in state; compute it.

## Data Fetching

- All API calls live in `features/<name>/api.ts` or `lib/api.ts`; never inline `fetch` in components.
- Base URL from `import.meta.env.VITE_API_URL`; never hard-code.
- Use `AbortController` / `signal` for cancellable requests.

## TypeScript

- `strict: true` always; never `any` — use `unknown` and narrow.
- Prefer interfaces for object shapes, `type` for unions and primitives.
- Use branded types for IDs: `type UserId = string & { readonly __brand: 'UserId' }`.
- Avoid type assertions (`as T`) except at validated API boundaries.

## Styling

- All design tokens (colour, spacing, typography, radius, shadow) are CSS custom properties declared at `:root`.
- Never use a literal colour or `font-family` outside the token block — this is enforced by the Hallmark skill.
- Component styles live in a co-located `.css` file or a `<style>` block; no global style pollution.
- Responsive breakpoints use `min-width` (mobile-first).
- `overflow-x: clip` on `html` and `body`; never `overflow-x: hidden` or `width: 100vw`.

## Design (Hallmark Skill)

The Hallmark skill governs all UI/visual work. Before building or redesigning any page or component:

1. Run `/hallmark` (or invoke the `hallmark` skill) to get a dealt design direction.
2. Follow The Floor rules in `SKILL.md` without exception — they are non-negotiable.
3. Stamp every CSS file with the Hallmark stamp as the first non-empty line.
4. Run `node .agents/skills/hallmark/scripts/sloplint.mjs <output> --render` before handing back; fix every `FAIL`.

## Testing

- Unit tests with Vitest (`vitest`) when added; co-locate as `<name>.test.ts`.
- Test behaviour, not implementation; never test internal state.
- Avoid mocking modules you own — test the real thing; mock only network and third-party SDKs.

## File & Import Rules

- Relative imports for files in the same feature; path aliases (`@/`) for cross-feature imports.
- No barrel re-exports inside a feature except `index.ts`.
- Import order: external packages → `@/` aliases → relative paths.

## Validation (Frontend)

- Validate all user input at the form level before submission — never rely solely on backend errors.
- Use a schema library (Zod preferred) for form validation; define schemas in `lib/schemas/` or co-located with the form.
- Never trust data from the server — validate and type-narrow API responses at the boundary (`lib/api.ts`).
- Use controlled inputs; never read raw `innerHTML` or `document.querySelector` values.
- Sanitise any user-supplied HTML before rendering (use `DOMPurify` if `dangerouslySetInnerHTML` is unavoidable — prefer not using it).

## Security (Frontend)

- **XSS:** Never use `dangerouslySetInnerHTML` with unsanitised strings. If unavoidable, run through DOMPurify first.
- **CSRF:** Use `SameSite=Strict` or `SameSite=Lax` cookies; include a CSRF token header on mutating requests when using cookies for auth.
- **Auth tokens:** Store JWT/session tokens in `httpOnly` cookies, not `localStorage` or `sessionStorage`.
- **Environment variables:** Only `VITE_`-prefixed vars are exposed to the browser — never put secrets in them.
- **Dependency hygiene:** Run `pnpm audit` before releasing; keep dependencies up to date.
- **Content-Security-Policy:** Set a `<meta http-equiv="Content-Security-Policy">` or server-side header; avoid `unsafe-inline` scripts.
- **Open redirect:** Never redirect to a URL taken directly from query params without validating it is a same-origin path.
- **Rate limiting:** Debounce search inputs and expensive form submissions; don't fire uncapped requests on every keystroke.

## What Not To Do

- No `useEffect` for data fetching (use a query library).
- No CSS `transition: all`.
- No `any`, no non-null assertions (`!`) without a comment explaining why it is safe.
- No `console.log` left in committed code.
- No default exports from feature internals — only from `index.ts`.
- Never commit `.env` files.
