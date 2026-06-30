# Skill: Feature Planning

## Purpose
Produce a concrete, reviewable implementation plan before writing any code. Planning prevents incorrect rendering strategy choices, missed cache invalidation, and architectural layer violations.

## When to Use
- Adding a new page or route
- Adding a new data-fetching flow
- Integrating a new mutation (RTK Query or Server Action)
- Any change touching more than 3 files

---

## Workflow

### 1. Understand the Requirement
- What does the feature do and who uses it?
- Is authentication required?
- What are the acceptance criteria and edge cases?

### 2. Choose the Rendering Strategy First

This is the most impactful decision — get it right before writing any files.

| Scenario | Strategy |
|----------|----------|
| Public data, rarely changes | Static RSC + `cache: 'force-cache'` |
| Data changes on a schedule | ISR + `next: { revalidate: N, tags: ['tag'] }` |
| User-specific or sensitive data | Dynamic RSC + `cache: 'no-store'` + Bearer from cookie |
| Needs real-time interaction | Client Component + Server Action or RTK Query (legacy) |
| Form with server-side validation + backend call | Server Action (server-to-server fetch, no CORS) |
| Login / logout | Server Action + httpOnly cookie — never RTK Query or `document.cookie` |
| Route protection | `AuthWrapper` async RSC in per-feature `layout.tsx` |
| Shared interactive state (user object) | Redux slice — never store token |
| Form with optimistic update (legacy tickets) | Client Component + RTK Query mutation |

### 3. Map the Impact Area

| Layer | File(s) |
|-------|---------|
| API paths | `src/constants/api-endpoints.ts` |
| Types + Zod schemas | `src/types/[feature].ts` |
| Cookie helpers (server-only) | `src/lib/cookies.ts` |
| Server Action (backend proxy) | `src/actions/[feature]-actions.ts` |
| RTK Query (legacy client) | `src/services/[feature]Api.ts` |
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

> No Route Handlers (`src/app/api/**`) for backend proxying — Server Actions replace that layer.

### 4. Draft a Numbered Task List (in dependency order)

```
1. Create/update `src/constants/api-endpoints.ts`
2. Define types + Zod schemas in `src/types/[feature].ts`
3. Create server-only helpers (`src/lib/cookies.ts` for auth)
4. Create Server Action(s) in `src/actions/[feature]-actions.ts`
5. Create Redux slice if client UI state needed (user only — never token)
6. Wire store in `src/lib/store/index.ts`
7. Build Client Component(s) — forms call Server Actions directly
8. Build Server Component(s) — async fetch with Bearer from cookie
9. Create AuthWrapper + feature layout if route protection needed
10. Create page with metadata export
11. Add loading.tsx and error.tsx
```

### 5. Call Out Risks

- **Client boundary expansion**: Will adding `'use client'` to this component unnecessarily enlarge the client bundle?
- **Cache invalidation**: Which `revalidateTag(...)` calls are needed after mutations?
- **Streaming**: Is there a slow data fetch that blocks the page? Add `<Suspense>`.
- **Auth**: Token in `httpOnly` cookie via `src/lib/cookies.ts` — never client-accessible. Route guard in feature `layout.tsx`, not root layout.
- **CORS**: Browser must not call backend directly — Server Actions proxy all calls server-to-server.
- **Redirect loop**: Login page (`/`) must not be inside `<AuthWrapper>`.
- **Legacy RTK Query**: `baseApi.ts` reads `document.cookie` — httpOnly cookies are invisible; migrate ticket calls to Server Actions.
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
- `src/constants/api-endpoints.ts` — API paths (if new backend endpoints)
- `src/types/[feature].ts` — interfaces + Zod schemas
- `src/lib/cookies.ts` — server-only cookie helpers (auth features)
- `src/actions/[feature]-actions.ts` — Server Actions (backend proxy)
- `src/components/AuthWrapper/` — route guard (if protected feature)
- `src/app/[feature]/layout.tsx` — wraps children in `<AuthWrapper>`
- `src/components/[Feature]/` — components
- `src/app/[route]/page.tsx` — page + metadata
- `src/app/[route]/loading.tsx` — skeleton
- `src/app/[route]/error.tsx` — error boundary

### Steps
1. ...
2. ...

### Risks / Open Questions
- CORS: all backend calls via Server Actions?
- Auth: httpOnly cookie + per-feature AuthWrapper layout?
- Redirect loop: login page outside AuthWrapper?
- Legacy RTK Query: ticket calls need Server Action migration?
- Client boundary: is 'use client' on [X] justified?
- Streaming: wrap [Y] in <Suspense>?
```

---

## Constraints
- Follow existing patterns — `LoginForm`, `auth-actions.ts`, and `CreateTicketForm` are the templates
- No new libraries without justification
- RSC by default — justify every `'use client'`
- All new backend calls via Server Actions — not direct browser fetch, not Route Handlers
- Auth token in `httpOnly` cookie only — see `.cursor/plans/login_page_+_route_guard_f355fa26.plan.md`
- `injectEndpoints` on `baseApi` for legacy RTK Query only — prefer Server Actions for new work
