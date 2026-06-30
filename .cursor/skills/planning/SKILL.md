# Skill: Feature Planning

## Purpose
Produce a concrete, reviewable implementation plan before writing any code. Planning prevents incorrect rendering strategy choices, missed cache invalidation, and architectural layer violations.

## When to Use
- Adding a new page or route
- Adding a new data-fetching flow
- Integrating a new mutation (RTK Query via `tmsFetch`)
- Any change touching more than 3 files

---

## Workflow

### 1. Understand the Requirement
- What does the feature do and who uses it?
- Is authentication required?
- What are the acceptance criteria and edge cases?

### 2. Choose the Rendering Strategy First

| Scenario | Strategy |
|----------|----------|
| Public data, rarely changes | Static RSC + `cache: 'force-cache'` |
| Data changes on a schedule | ISR + `next: { revalidate: N, tags: ['tag'] }` |
| User-specific or sensitive data | Dynamic RSC + `cache: 'no-store'` + Bearer from cookie |
| Post-load reads/mutations with cache | Client Component + RTK Query hook → `tmsFetch` |
| Form with optimistic update + cache invalidation | Client Component + RTK Query mutation |
| Login / logout | `useLoginMutation` + `setAuthCookieAction` / `logoutAction` |
| Route protection | `AuthWrapper` async RSC in per-feature `layout.tsx` |
| Shared interactive state (user object) | Redux slice — never store token |

### 3. Map the Impact Area

| Layer | File(s) |
|-------|---------|
| API paths | `src/constants/api-endpoints.ts` |
| Types + Zod schemas | `src/types/[feature].ts` |
| Global interceptor | `src/lib/tms-fetch.ts` (rarely changed) |
| RTK Query service | `src/services/[feature]-api.ts` |
| Cookie helpers (server-only) | `src/lib/cookies.ts` |
| Cookie Server Actions | `src/actions/auth-actions.ts` |
| Route guard | `src/components/AuthWrapper/index.tsx` |
| Server Components | `src/components/[Feature]/Server*.tsx` |
| Client Components | `src/components/[Feature]/index.tsx` |
| Page | `src/app/[route]/page.tsx` |
| Feature layout (auth) | `src/app/[feature]/layout.tsx` with `<AuthWrapper>` |
| Loading UI | `src/app/[route]/loading.tsx` |
| Error UI | `src/app/[route]/error.tsx` |
| Redux slice (UI state) | `src/lib/store/[feature]Slice.ts` |
| Store | `src/lib/store/index.ts` |
| SCSS module | Co-located `.module.scss` |

### 4. Draft a Numbered Task List (in dependency order)

```
1. Create/update `src/constants/api-endpoints.ts`
2. Define types + Zod schemas in `src/types/[feature].ts`
3. Create RTK Query service `src/services/[feature]-api.ts` (injectEndpoints on baseApi)
4. Add side-effect import in `src/lib/store/index.ts`
5. Create Redux slice if client UI state needed (user only — never token)
6. Build Client Component(s) — RTK Query hooks for API calls
7. Build Server Component(s) if needed — async fetch with Bearer from cookie
8. Create AuthWrapper + feature layout if route protection needed
9. Create page with metadata export
10. Add loading.tsx and error.tsx
```

### 5. Call Out Risks

- **Client boundary expansion**: Will adding `'use client'` unnecessarily enlarge the client bundle?
- **Cache invalidation**: Which RTK Query `invalidatesTags` are needed after mutations?
- **Auth**: Token in `httpOnly` cookie via `src/lib/cookies.ts` — read by `tmsFetch` only. Route guard in feature `layout.tsx`, not root layout.
- **Double network hop**: Client → Next.js server (`tmsFetch`) → backend API. Acceptable for server-side auth.
- **FormData**: File uploads via RTK Query pass FormData through Server Action boundary — verify in target Next.js version.
- **Redirect loop**: Login page (`/`) must not be inside `<AuthWrapper>`.
- **Bundle size**: Does this pull in a large library? Consider `dynamic()`.

### 6. Wait for Approval
Do not write any implementation code until the plan is confirmed.

---

## Output Template

```markdown
## Plan: [Feature Name]

### Rendering Strategy
[Static RSC | ISR | Dynamic RSC | Client CC + RTK Query | Mixed — describe boundary]

### Affected Files
- `src/constants/api-endpoints.ts` — API paths
- `src/services/[feature]-api.ts` — RTK Query endpoints
- `src/lib/store/index.ts` — side-effect import
- `src/components/[Feature]/` — components
- `src/app/[route]/page.tsx` — page + metadata

### Steps
1. ...
2. ...

### Risks / Open Questions
- Cache invalidation tags for mutations?
- Auth: httpOnly cookie + per-feature AuthWrapper layout?
- FormData through tmsFetch Server Action boundary?
```

---

## Constraints
- Follow existing patterns — `LoginForm`, `auth-api.ts`, `ticket-api.ts`, and `CreateTicketForm` are the templates
- No new libraries without justification
- RSC by default — justify every `'use client'`
- All client API calls via RTK Query → `tmsFetch` — browser never calls backend directly
- Auth token in `httpOnly` cookie only — never client-accessible
- `injectEndpoints` on `baseApi` — one service file per feature
