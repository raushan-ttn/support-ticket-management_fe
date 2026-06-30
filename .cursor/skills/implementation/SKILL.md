# Skill: Feature Implementation

## Purpose
Implement a planned, approved feature correctly and consistently with the project architecture.

## Prerequisites
A plan has been reviewed and approved (see `../planning/SKILL.md`). Rendering strategy is decided.

---

## Step-by-Step Checklist

### 0. API Endpoints (`src/constants/api-endpoints.ts`) — when adding backend paths

```typescript
export const API_ENDPOINTS = {
  AUTH: { LOGIN: '/v1/auth/login', ME: '/v1/auth/me' },
  TICKETS: {
    LIST: '/v1/tickets',
    BY_ID: (id: number | string) => `/v1/tickets/${id}`,
    // ...
  },
} as const;
```

- Single source of truth — imported by all Server Actions
- Paths relative to `NEXT_PUBLIC_API_BASE_URL`

### 1. Types (`src/types/[feature].ts`)

```typescript
// ✅ Interface for every shape, no any
export interface Comment {
  id: number;
  ticketId: number;
  content: string;
  createdAt: string;
}

export interface CreateCommentPayload {
  ticketId: number;
  content: string;
}
```

- `interface` for object shapes, no `any`, export all names
- Include Zod schemas when used by Server Actions (e.g. `loginSchema`)
- Re-use existing types from `src/services/ticketApi.ts` where possible

### 2. Cookie Helpers (`src/lib/cookies.ts`) — auth features only

```typescript
import { cookies } from 'next/headers';

const COOKIE_NAME = 'token';
const COOKIE_OPTIONS = { httpOnly: true, path: '/', sameSite: 'strict' } as const;

export async function setAuthCookie(token: string): Promise<void> { /* ... */ }
export async function getAuthCookie(): Promise<string | undefined> { /* ... */ }
export async function removeAuthCookie(): Promise<void> { /* ... */ }
```

- Server-only — never import in Client Components
- Single place for cookie name and options

### 3. Server Action (preferred for all backend calls)

```typescript
// src/actions/[feature]-actions.ts
'use server';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { getAuthCookie, setAuthCookie } from '@/lib/cookies';

export async function loginAction(payload: LoginPayload): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) return { success: false, error: 'Invalid input' };

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed.data) }
  );
  if (!res.ok) return { success: false, error: '...' };

  const { data } = await res.json();
  await setAuthCookie(data.token);
  return { success: true, user: data.user }; // never return token
}
```

Key rules:
- Server-to-server `fetch()` — browser never calls backend directly
- Read token via `getAuthCookie()` for authenticated calls; inject `Authorization: Bearer`
- Zod validation before any API call
- Return `{ success, error?, user? }` — never throw; never return token

### 4. Redux Slice (client UI state only — auth example)

```typescript
// src/lib/store/authSlice.ts
const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null as AuthUser | null },
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthUser>) => { state.user = action.payload; },
    clearCredentials: (state) => { state.user = null; },
  },
});
```

- Store user object only — never the JWT token
- Wire in `src/lib/store/index.ts` as `authReducer`

### 5. RTK Query Service (legacy — prefer Server Actions for new work)

```typescript
// src/services/commentApi.ts
import { baseApi } from './baseApi';

export const commentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getComments: builder.query<Comment[], number>({
      query: (ticketId) => `/tickets/${ticketId}/comments`,
      providesTags: (_r, _e, id) => [{ type: 'Comment', id }],
    }),
    createComment: builder.mutation<Comment, CreateCommentPayload>({
      query: ({ ticketId, content }) => ({
        url: `/tickets/${ticketId}/comments`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: (_r, _e, { ticketId }) => [{ type: 'Comment', id: ticketId }],
    }),
  }),
});

export const { useGetCommentsQuery, useCreateCommentMutation } = commentApi;
```

Key rules:
- Always `injectEndpoints` on `baseApi` — never `createApi()`
- `providesTags` and `invalidatesTags` on every endpoint
- No store wiring needed for `injectEndpoints`
- Note: `baseApi.ts` reads `document.cookie` — httpOnly cookies are invisible; migrate to Server Actions

### 6. AuthWrapper + Feature Layout (route protection)

```typescript
// src/components/AuthWrapper/index.tsx — async Server Component
import { redirect } from 'next/navigation';
import { getAuthCookie } from '@/lib/cookies';

export default async function AuthWrapper({ children }: { children: React.ReactNode }) {
  const token = await getAuthCookie();
  if (!token) redirect('/');
  return <>{children}</>;
}

// src/app/tickets/layout.tsx — per-feature, NOT root layout
import AuthWrapper from '@/components/AuthWrapper';
export default function TicketsLayout({ children }: { children: React.ReactNode }) {
  return <AuthWrapper>{children}</AuthWrapper>;
}
```

### 7. Login Form Client Component

```typescript
// src/components/LoginForm/index.tsx
'use client';
const onSubmit = async (values: LoginPayload) => {
  const result = await loginAction(values);
  if (!result.success) { setError('root', { message: result.error }); return; }
  dispatch(setCredentials(result.user!));
  router.push('/tickets');
};
```

- Call Server Action directly — no RTK Query, no `document.cookie`
- Dispatch `setCredentials` with user object only

### 8. Server Component (async data fetching)

```typescript
// src/components/[Feature]/Server[Name].tsx  — NO 'use client'
export async function Server[Name]({ id }: { id: number }) {
  const res = await fetch(`${BASE}/resource/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load');
  const data = await res.json();
  return <div>{/* render data */}</div>;
}
```

- `async function` — no hooks, no events, no browser APIs
- Throw on failure — caught by `error.tsx`
- Props must be serializable
- For authenticated fetches: read token via `getAuthCookie()`, inject Bearer header

### 9. Client Component (interactivity)

```typescript
// src/components/[Feature]/[Name]/index.tsx
'use client';  // line 1

import { useState } from 'react';
import { Button, TextField } from '@mui/material';
import { useCreateCommentMutation } from '@/services/commentApi';
import styles from './[name].module.scss';

export function [Name]({ ticketId }: { ticketId: number }) {
  const [createComment, { isLoading }] = useCreateCommentMutation();
  ...
}
```

- `'use client'` on line 1 — before all imports
- Named export
- SCSS module co-located — no `@use 'abstracts'` (auto-injected)
- MUI inputs via `Controller` if inside a form
- Forms submit via Server Action — not RTK Query mutation (unless legacy ticket flow)

### 10. Page (`src/app/[route]/page.tsx`)

```typescript
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ServerComponent } from '@/components/Feature/ServerComponent';
import { ClientComponent } from '@/components/Feature/ClientComponent';
import { FeatureSkeleton } from '@/components/Feature/FeatureSkeleton';

export const metadata: Metadata = {
  title: 'Page Title | Support Portal',
  description: 'Page description under 155 chars.',
};

export default function FeaturePage() {
  return (
    <main>
      <Suspense fallback={<FeatureSkeleton />}>
        <ServerComponent />
      </Suspense>
      <ClientComponent />
    </main>
  );
}
```

- Default export (Next.js requirement for pages)
- `metadata` export on every page
- Wrap slow async RSC in `<Suspense>`
- Login page (`src/app/page.tsx`): Static RSC shell rendering `<LoginForm />` — no fetch needed

### 11. Loading + Error UI

```typescript
// src/app/[route]/loading.tsx
export default function Loading() { return <FeatureSkeleton />; }

// src/app/[route]/error.tsx
'use client';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return <div><p>Error: {error.message}</p><button onClick={reset}>Retry</button></div>;
}
```

---

## Quality Gates (Before Marking Done)
- [ ] No `any` types
- [ ] No `console.log`
- [ ] No dead code or unused imports
- [ ] No `@use 'abstracts'` in `.module.scss` files
- [ ] All MUI inputs use `Controller` inside forms
- [ ] Error outputs have `role="alert"`
- [ ] Submit buttons reflect `isLoading` state
- [ ] `'use client'` on line 1 in every Client Component
- [ ] `metadata` exported from every page
- [ ] No token in Redux, Server Action returns, or client-accessible storage
- [ ] `src/lib/cookies.ts` not imported in any Client Component
- [ ] `AuthWrapper` in feature `layout.tsx` only — root layout public
- [ ] Backend calls from browser go through Server Actions only
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` passes
- [ ] Feature works in browser (`npm run dev`)
