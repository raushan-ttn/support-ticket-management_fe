# Support Ticket Management — Frontend

Next.js 16 App Router frontend for the support ticket management system.

## Stack

| Concern | Tool |
|---------|------|
| Framework | Next.js 16 App Router · React 19 |
| Language | TypeScript (strict) |
| UI | MUI v9 + `@mui/material-nextjs` |
| State | Redux Toolkit + RTK Query (client) |
| Forms | react-hook-form + Zod |
| Styles | SCSS Modules + Tailwind v4 |

## Getting Started

```bash
npm install
npm run dev    # http://localhost:8082
```

Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local` (see `.env.example` if present).

## Architecture

### Data fetching

All client-side API calls flow through RTK Query → `tmsFetch`:

```
Client Component (RTK Query hook)
  → baseApi (custom baseQueryFn)
  → tmsFetch ('use server' Server Action)
  → getAuthCookie() → Authorization: Bearer
  → Backend API
```

- **`src/lib/tms-fetch.ts`** — global `'use server'` interceptor; handles GET/POST/PATCH/DELETE + FormData; reads auth from httpOnly cookie.
- **`src/services/baseApi.ts`** — RTK Query `createApi` with custom `baseQueryFn` that calls `tmsFetch`.
- **Per-feature services** — `auth-api.ts`, `ticket-api.ts`, `comment-api.ts` inject endpoints into `baseApi`.

### Auth

- JWT stored in **httpOnly cookie** via `src/lib/cookies.ts` (server-only).
- Login: `useLoginMutation` from `auth-api.ts` → `tmsFetch` (skipAuth) → `setAuthCookieAction` on success.
- Logout: `logoutAction` Server Action clears cookie.
- User object in Redux `authSlice` only — never the token.
- Route guard: `AuthWrapper` async RSC in `src/app/tickets/layout.tsx`.

### Project structure

```
src/
  actions/          # Server Actions (cookie helpers: setAuthCookieAction, logoutAction)
  app/              # App Router pages and layouts
  components/       # React components (RSC by default; 'use client' when needed)
  constants/        # API_ENDPOINTS
  lib/
    tms-fetch.ts    # Global server-side HTTP interceptor
    cookies.ts      # httpOnly cookie helpers (server-only)
    store/          # Redux store + authSlice
  services/         # RTK Query feature APIs (injectEndpoints on baseApi)
  types/            # Shared TypeScript types + Zod schemas
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 8082) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |

## Conventions

- **RSC by default** — add `'use client'` only for hooks, events, or browser APIs.
- **API paths** — `src/constants/api-endpoints.ts` (`API_ENDPOINTS` as const).
- **New feature API** — add `src/services/[feature]-api.ts` via `baseApi.injectEndpoints`; import in `src/lib/store/index.ts`.
- **SCSS** — co-located `*.module.scss`; abstracts auto-injected (do not add `@use 'abstracts'`).

See `.cursor/rules/` and `.cursor/README.md` for full AI/coding conventions.
