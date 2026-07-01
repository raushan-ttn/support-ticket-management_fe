# Skill: Feature Implementation

## Purpose
Implement a planned, approved feature correctly and consistently with the project architecture.

## Prerequisites
A plan has been reviewed and approved (see `../planning/SKILL.md`). Rendering strategy is decided.

---

## Step-by-Step Checklist

### 0. API Endpoints (`src/constants/api-endpoints.ts`) — when adding backend paths

```typescript
export const API_VERSION = '/api/v1';
export const API_ENDPOINTS = {
  AUTH: { LOGIN: `${API_VERSION}/auth/login`, ME: `${API_VERSION}/auth/me` },
  TICKETS: {
    LIST: `${API_VERSION}/tickets`,
    BY_ID: (id: number | string) => `${API_VERSION}/tickets/${id}`,
  },
  COMMENTS: {
    BY_TICKET: (ticketId: number | string) => `${API_VERSION}/tickets/${ticketId}/comments`,
    BY_ID: (ticketId: number | string, commentId: number | string) =>
      `${API_VERSION}/tickets/${ticketId}/comments/${commentId}`,
  },
} as const;
```

- Single source of truth — imported by all feature services
- Paths relative to `NEXT_PUBLIC_API_BASE_URL`

### 1. Types (`src/types/[feature].ts`)

```typescript
export interface Comment {
  id: number;
  ticketId: number;
  content: string;
  createdAt: string;
}
```

- `interface` for object shapes, no `any`, export all names
- Include Zod schemas when used by forms (e.g. `loginSchema` in `src/types/auth.ts`)
- Re-use existing types from `src/services/ticket-api.ts` where possible

### 2. Cookie Helpers (`src/lib/cookies.ts`) — auth features only

```typescript
import { cookies } from 'next/headers';

const COOKIE_NAME = 'authToken';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  sameSite: 'strict' as const,
  maxAge: 60 * 60,
  priority: 'high' as const,
} as const;

export async function setAuthCookie(token: string): Promise<void> { /* ... */ }
export async function getAuthCookie(): Promise<string | undefined> { /* ... */ }
export async function removeAuthCookie(): Promise<void> { /* ... */ }
```

- Server-only — never import in Client Components
- Single place for cookie name and options
- Read by `tmsFetch` for authenticated API calls

### 3. Global Interceptor (`src/lib/tms-fetch.ts`) — all RTK Query backend calls

```typescript
'use server';
import { getAuthCookie } from '@/lib/cookies';

export async function tmsFetch<T>(path: string, opts?: TmsFetchOptions): Promise<TmsFetchResult<T>>
```

Key rules:
- `'use server'` at file top — executes fetch on the server
- Reads token via `getAuthCookie()` and injects `Authorization: Bearer` (unless `skipAuth: true`)
- Supports GET/POST/PATCH/DELETE + JSON and FormData bodies
- Returns `{ data }` or `{ error: { status, message } }`
- Do not call `tmsFetch` directly from components — use RTK Query hooks or Server Actions

### 4. RTK Query Feature Service (`src/services/[feature]-api.ts`)

```typescript
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { baseApi } from '@/services/baseApi';

export const ticketApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTickets: builder.query<TicketsResponse, TicketsQuery | void>({
      query: (params = {}) => ({
        url: API_ENDPOINTS.TICKETS.LIST,
        params: { ...params } as Record<string, string | number | boolean | undefined>,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Ticket' as const, id })),
              { type: 'Ticket', id: 'LIST' },
            ]
          : [{ type: 'Ticket', id: 'LIST' }],
    }),
    createTicket: builder.mutation<Ticket, CreateTicketPayload>({
      query: (payload) => ({ url: API_ENDPOINTS.TICKETS.LIST, method: 'POST', body: payload }),
      invalidatesTags: [{ type: 'Ticket', id: 'LIST' }],
    }),
  }),
});

export const { useGetTicketsQuery, useCreateTicketMutation } = ticketApi;
```

Key rules:
- Always `injectEndpoints` on `baseApi` — never `createApi()`
- One file per feature: `auth-api.ts`, `ticket-api.ts`, `comment-api.ts`
- `providesTags` and `invalidatesTags` on every endpoint
- Use `API_ENDPOINTS` — no hardcoded paths
- Register via side-effect import in `src/lib/store/index.ts`
- `baseApi` custom `baseQueryFn` routes all requests through `tmsFetch`

### 5. Auth API + Cookie Actions

**`src/services/auth-api.ts`** — login mutation + getMe query:
```typescript
login: builder.mutation<LoginResponse, LoginPayload>({
  query: (body) => ({ url: API_ENDPOINTS.AUTH.LOGIN, method: 'POST', body, skipAuth: true }),
  async onQueryStarted(_arg, { queryFulfilled }) {
    const { data } = await queryFulfilled;
    await setAuthCookieAction(data.token);
  },
}),
```

**`src/actions/auth-actions.ts`** — cookie-only Server Actions:
```typescript
'use server';
export async function setAuthCookieAction(token: string): Promise<void> { /* setAuthCookie */ }
export async function logoutAction(): Promise<void> { /* removeAuthCookie */ }
```

- Login via `useLoginMutation` — not a standalone `loginAction`
- Token never returned to client — only user object in Redux

### 6. Redux Slice (client UI state only — auth example)

```typescript
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

### 7. Store (`src/lib/store/index.ts`)

```typescript
import { baseApi } from '@/services/baseApi';
import '@/services/auth-api';
import '@/services/ticket-api';
import '@/services/comment-api';

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  });
```

### 8. AuthWrapper + Feature Layout (route protection)

```typescript
// src/components/AuthWrapper/index.tsx — async Server Component
export default async function AuthWrapper({ children }: { children: React.ReactNode }) {
  const token = await getAuthCookie();
  if (!token) redirect('/');
  return <>{children}</>;
}

// src/app/tickets/layout.tsx — per-feature, NOT root layout
export default function TicketsLayout({ children }: { children: React.ReactNode }) {
  return <AuthWrapper>{children}</AuthWrapper>;
}
```

### 9. Login Form Client Component

```typescript
'use client';
const [login, { isLoading }] = useLoginMutation();

const onSubmit = async (values: LoginPayload) => {
  try {
    const data = await login(values).unwrap();
    dispatch(setCredentials(data.user));
    router.push('/tickets');
  } catch (error) {
    setError('root', { message: extractApiError(error) });
  }
};
```

- Use `useLoginMutation` from `auth-api.ts`
- Dispatch `setCredentials` with user object only
- Handle 429 rate-limit with user-facing message

### 10. Server Component (async data fetching)

```typescript
export async function ServerTicketList() {
  const token = await getAuthCookie();
  const res = await fetch(`${BASE}${API_ENDPOINTS.TICKETS.LIST}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to load');
  const data = await res.json();
  return <div>{/* render data */}</div>;
}
```

- `async function` — no hooks, no events, no browser APIs
- Throw on failure — caught by `error.tsx`
- For RSC fetches: read token via `getAuthCookie()`, inject Bearer header
- For client interactivity: prefer RTK Query hooks (routes through `tmsFetch`)

### 11. Client Component (interactivity)

```typescript
'use client';
import { useCreateCommentMutation } from '@/services/comment-api';

export function CommentForm({ ticketId }: { ticketId: number }) {
  const [createComment, { isLoading }] = useCreateCommentMutation();
  // ...
}
```

- `'use client'` on line 1 — before all imports
- RTK Query hooks for reads/mutations — all backend calls route through `tmsFetch`
- SCSS module co-located — no `@use 'abstracts'` (auto-injected)
- MUI inputs via `Controller` if inside a form

### 12. Page (`src/app/[route]/page.tsx`)

```typescript
export const metadata: Metadata = { title: 'Page Title | Support Portal' };

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
- [ ] No token in Redux, RTK Query cache, or client-accessible storage
- [ ] `src/lib/cookies.ts` not imported in any Client Component
- [ ] New feature endpoints added via `injectEndpoints` + store side-effect import
- [ ] `AuthWrapper` in feature `layout.tsx` only — root layout public
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` passes
- [ ] Feature works in browser (`npm run dev`)
