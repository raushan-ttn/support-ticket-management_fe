# Skill: Debugging

## Purpose
Systematically locate, understand, and fix bugs without guessing or making unrelated changes.

---

## Workflow

### 1. Reproduce First
- Confirm the exact steps to trigger the bug
- Note: browser, route, auth state (httpOnly cookie present?), whether error is in server terminal or browser console
- RSC errors appear in the **server terminal**, not the browser console — check both

### 2. Classify the Bug

| Symptom | Likely Layer | First Place to Look |
|---------|-------------|---------------------|
| "Hydration failed" in browser | RSC/CC | Browser API without guard; `Math.random()` or timestamp in RSC body |
| "Event handlers cannot be passed to Client Component props" | Props | Function prop passed from RSC to CC — receiver must be CC |
| Hook error ("Rules of Hooks" / "only for Client Components") | Missing directive | Add `'use client'` to the component |
| Blank page, RSC throws | Server render | **Server terminal** — RSC errors don't appear in browser console |
| 401 on every API request | Auth cookie | `getAuthCookie()` returns undefined; cookie not set after login |
| Login succeeds but /tickets redirects to / | Cookie timing | `setAuthCookieAction` not awaited in `onQueryStarted`; cookie options wrong |
| RTK Query returns stale data after mutation | Cache | `invalidatesTags` missing or wrong tag format; check Redux DevTools |
| RTK Query mutation fails silently | tmsFetch | Check server terminal for `tmsFetch` errors; verify `API_ENDPOINTS` path |
| FormData upload fails | Server Action boundary | FormData/File through `tmsFetch` — check Next.js version support |
| Server Action returns unexpected error | Server Action | Zod schema mismatch; check action return value |
| `window is not defined` | Server render | Browser API in RSC or at CC module level without guard |
| SCSS class not applied | SCSS module | Class name typo; wrong import path; duplicate `@use 'abstracts'` |
| Redirect loop | Routing | `AuthWrapper` on root layout or login page |

### 3. Trace the Data Flow

**Client path** (RTK Query → tmsFetch):
```
CC renders → useGetXxxQuery / useXxxMutation
  → baseApi baseQueryFn
  → tmsFetch (Server Action)
  → getAuthCookie() → Authorization: Bearer
  → fetch to backend API
  → RTK Query cache update → component re-renders
```
Check: Server terminal (tmsFetch errors), Redux DevTools (cache update).

**Auth path**:
```
LoginForm → useLoginMutation
  → tmsFetch (skipAuth) → POST /auth/login
  → onQueryStarted → setAuthCookieAction(token)
  → dispatch setCredentials(user) → router.push('/tickets')
  → AuthWrapper reads cookie → renders protected page
```
If 401: check DevTools → Application → Cookies → `token` (httpOnly — not readable by JS, but should be listed).

**Server path** (RSC):
```
Browser request → page.tsx (RSC, async)
  → fetch() with Bearer from getAuthCookie()
  → external API response → serializable props to CC children
```

### 4. Read Before Touching
Read the actual file at the actual line before changing anything.

### 5. Fix — Minimal
Change only what causes the bug. Do NOT refactor nearby code.

### 6. Verify
- [ ] Original reproduction steps no longer trigger the bug
- [ ] No new browser console or server terminal errors
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` passes
- [ ] Smoke-test the surrounding feature for regressions

---

## Known Gotchas in This Codebase

**RTK Query + tmsFetch:**
- All client API calls route through `tmsFetch` — errors may appear in server terminal, not browser Network tab (no direct backend call from browser)
- `injectEndpoints` shares `baseApi`'s reducer key — no separate reducer to register
- Feature services must be imported in `src/lib/store/index.ts` as side effects
- Cache tags must use `as const`: `{ type: 'Ticket' as const, id }`

**Auth & cookies:**
- Token in `httpOnly` cookie via `src/lib/cookies.ts` — invisible to `document.cookie` and client JS
- `tmsFetch` reads cookie server-side; login uses `skipAuth: true`
- `setAuthCookieAction` called in `auth-api` `onQueryStarted` — slight delay before cookie is available

**SCSS:**
- `sassOptions.additionalData` auto-injects `@use 'abstracts' as *;` — adding it manually causes parse error

**Next.js routing:**
- `params` and `searchParams` in page.tsx are `Promise<...>` in Next.js 16 — must `await` them
- `error.tsx` MUST be a `'use client'` component
