---
description: SDLC Phase 3 — implement a feature end-to-end (page, components, services, actions, forms, metadata, figma)
---

@.cursor/prompts/personas/implementer.md
@.cursor/skills/implementation/SKILL.md

# /build — Implementation

Implement the approved work below. Follow `rules/*.mdc` exactly (they hold the code patterns); this prompt is the procedure. Build one file at a time, no TODOs.

## What to Build
[DESCRIBE THE APPROVED FEATURE / ARTIFACT]

## Implementation Order (full feature)
1. **API endpoints** `src/constants/api-endpoints.ts` — `API_ENDPOINTS` as const (if new backend paths).
2. **Types** `src/types/[feature].ts` — `interface`, Zod schemas, no `any`, reuse existing (`Ticket`, `AuthUser`, …).
3. **RTK Query service** `src/services/[feature]-api.ts` — `injectEndpoints` on `baseApi`; `providesTags`/`invalidatesTags`; use `API_ENDPOINTS`.
4. **Store** `src/lib/store/index.ts` — side-effect import for new feature service; `baseApi` reducer/middleware.
5. **Cookie helpers** `src/lib/cookies.ts` — server-only (auth features): `setAuthCookie`, `getAuthCookie`, `removeAuthCookie`.
6. **Cookie actions** `src/actions/auth-actions.ts` — `setAuthCookieAction`, `logoutAction` (cookie management only).
7. **Redux slice** `src/lib/store/[feature]Slice.ts` — UI state only (user object, never token).
8. **Client Component(s)** `src/components/[Feature]/` — `'use client'` line 1, RTK Query hooks, co-located `.module.scss`, MUI via `Controller`.
9. **AuthWrapper + layout** — `src/components/AuthWrapper/` (async RSC) + `src/app/[feature]/layout.tsx` (NOT root layout).
10. **Server Component(s)** — `async`, `fetch()` with Bearer from cookie, throw to `error.tsx`.
11. **Page** `src/app/[route]/page.tsx` — default export, `metadata`, compose RSC/CC, wrap slow RSC in `<Suspense>`.
12. **loading.tsx** (skeleton) + **error.tsx** (`'use client'` with `reset`).

## Modes (build only what's asked)
- **Page** — steps 9–10 (+ component in `src/components/`); choose cache by data type.
- **Server Component** — step 8 + a `*Skeleton` for the Suspense fallback.
- **Client Component** — step 6 (Server Action for mutations, handle loading + error).
- **Server Action** — steps 1–4 (action) + wire in a Client form (`onSubmit` calls action directly).
- **Auth / Login** — steps 1, 5–9: endpoints, cookies, `auth-api.ts` + `authSlice`, `LoginForm` with `useLoginMutation`, `src/app/page.tsx`, `AuthWrapper` in `src/app/tickets/layout.tsx`.
- **Route guard** — step 9 only: `AuthWrapper` + feature `layout.tsx`.
- **Form** — Client Component: `useForm` + `zodResolver`, `Controller` for MUI, `noValidate`; submit via RTK Query mutation (routes through `tmsFetch`).
- **API Service** — `src/services/[feature]-api.ts` via `injectEndpoints` on `baseApi`; register in store.
- **Metadata** — export `metadata` (static) or `generateMetadata` (dynamic); title with site suffix; `robots:{index:false}` for auth-only pages.
- **Figma → code** — pull design via Figma MCP; map tokens to SCSS abstracts; RSC unless interactive; `next/image` for images.

## Quality Gates
- [ ] No `any`, no `console.log`, no dead code/unused imports.
- [ ] `'use client'` only where needed and on line 1; props RSC→CC serializable.
- [ ] No `@use 'abstracts'` in `.module.scss`; MUI inputs in `Controller`; error spans `role="alert"`.
- [ ] No token in Redux, Server Action returns, or client storage; `cookies.ts` not in CCs.
- [ ] `AuthWrapper` in feature `layout.tsx` only — root layout public.
- [ ] Page exports `metadata`/`generateMetadata`.
- [ ] `npx tsc --noEmit` and `npm run lint` pass; feature works in `npm run dev`.
