---
name: DashboardWrapper Layout
overview: Create a `DashboardWrapper` shell component (Sidebar + Header + dynamic main area) and wire it into `src/app/tickets/layout.tsx` so all tickets/* pages share the chrome seen in the screenshot.
todos:
  - id: scss-wrapper
    content: Create dashboard-wrapper.module.scss with CSS Grid layout (sidebar full-height, header top, main scrollable)
    status: completed
  - id: scss-sidebar
    content: Create sidebar.module.scss (logo area, nav list, active item highlight, footer)
    status: completed
  - id: scss-header
    content: Create header.module.scss (flex row, search input, icon cluster)
    status: completed
  - id: sidebar-component
    content: Create Sidebar/index.tsx — Client Component with usePathname, nav config, Link items, active state
    status: completed
  - id: header-component
    content: Create Header/index.tsx — Client Component with search useState and icon row
    status: completed
  - id: dashboard-wrapper
    content: Create DashboardWrapper/index.tsx — RSC shell composing Sidebar + Header + {children}
    status: completed
  - id: tickets-layout
    content: Update src/app/tickets/layout.tsx to wrap children with DashboardWrapper inside AuthWrapper
    status: completed
isProject: false
---

# DashboardWrapper Component Plan

## What the screenshot shows

```
+--[185px Sidebar]---+----[Header: search · icons · avatar]----+
| Logo (NewersWorld) |                                          |
| Home               +------------------------------------------+
| My Profile         |                                          |
| ...                |   {children}  — tickets/page content     |
| My Tickets ← ACTIVE|                                          |
| ...                |                                          |
| Footer text        |                                          |
+--------------------+------------------------------------------+
```

- **Sidebar** — fixed 185 px wide, full viewport height, white background with brand logo at top, icon + label nav items, active item has pink/magenta highlight, footer label at bottom.
- **Header** — horizontal bar spanning the content column, white background, search input left of center, help / notification (badge) / connections / user-avatar-dropdown icons on the right.
- **Main** — the remaining area below the header; renders `{children}` (currently `TicketsPage`, `TicketDetailPage`).

---

## Rendering Strategy

**RSC by default, thin Client leaves:**

- `DashboardWrapper` (`index.tsx`) — **RSC** (layout shell, no hooks, serializable `children` prop).
- `Sidebar` — **Client Component** (`'use client'`) because it reads `usePathname()` to compute the active nav item.
- `Header` — **Client Component** (`'use client'`) because it uses `useState` for the search input and user-menu open/close.

The RSC `DashboardWrapper` renders `<Sidebar>` and `<Header>` (both Client) plus `{children}` (stays server-rendered via the "server-in-client-shell" pattern).

---

## Affected Files

**New files**

- `src/components/DashboardWrapper/index.tsx` — RSC shell, CSS-grid wrapper
- `src/components/DashboardWrapper/dashboard-wrapper.module.scss` — grid layout
- `src/components/DashboardWrapper/dependencies/Sidebar/index.tsx` — Client, nav items + active state via `usePathname`
- `src/components/DashboardWrapper/dependencies/Sidebar/sidebar.module.scss` — sidebar styles
- `src/components/DashboardWrapper/dependencies/Header/index.tsx` — Client, search + icon row
- `src/components/DashboardWrapper/dependencies/Header/header.module.scss` — header styles

**Modified files**

- `src/app/tickets/layout.tsx` — wrap `<AuthWrapper>` children in `<DashboardWrapper>`

No API endpoints, RTK Query services, types, store slices, or cookie helpers are touched.

---

## Layout structure (CSS Grid)

```scss
// dashboard-wrapper.module.scss
.wrapper {
  display: grid;
  grid-template-columns: 185px 1fr;
  grid-template-rows: 64px 1fr;
  min-height: 100vh;
}
.sidebar {
  grid-row: 1 / -1;
  grid-column: 1;
} // spans full height
.header {
  grid-row: 1;
  grid-column: 2;
}
.main {
  grid-row: 2;
  grid-column: 2;
  overflow-y: auto;
}
```

---

## Steps (dependency order)

1. **SCSS — `dashboard-wrapper.module.scss`** — CSS Grid shell (sidebar full-height, header top, main overflow).
2. **SCSS — `sidebar.module.scss`** — sidebar container, logo area, nav list, nav item (icon + label), active modifier (pink highlight), footer text.
3. **SCSS — `header.module.scss`** — flex row, search input, icon cluster, avatar.
4. **`Sidebar/index.tsx`** (Client) — `usePathname` → computes active item; nav config array (item label + href + icon placeholder); renders `<Link>` items; active class applied via `pathname.startsWith(href)`.
5. **`Header/index.tsx`** (Client) — search `useState`, static icon row (badge, avatar), no data fetch.
6. **`DashboardWrapper/index.tsx`** (RSC) — imports Sidebar + Header, renders grid with `{children}` in `.main`.
7. **`src/app/tickets/layout.tsx`** — import and wrap children: `<AuthWrapper><DashboardWrapper>{children}</DashboardWrapper></AuthWrapper>`.

---

## Nav items (Sidebar)

Only routes that exist in the current app are linked; rest are visual stubs matching the screenshot:

- My Tickets → `/tickets` (active when `pathname` starts with `/tickets`)

Additional placeholder items (from screenshot, no `href`, visually present): Home, My Profile, Newer Actions, Manage My Time, My Span Time, My Resume, Approve, Important Links, Org Chart.

---

## Risks / Open Questions

- **`TicketsPage` layout shift** — `TicketsPage` currently renders its own `<main>` with `max-width: 768px`. After wrapping, the inner `<main>` styling may need adjustment to fill the new content column instead of centering itself with a max-width. This is a cosmetic tweak to `TicketsPage.module.scss`, not a structural risk.
- **`TicketDetailPage` same concern** — inline Tailwind `max-w-3xl mx-auto` will still work visually but content area width will change; may need tuning.
- **Client boundary** — Sidebar and Header are Client Components but they render no data-fetching; bundle impact is minimal. `children` remain server-rendered (RSC passes through Client shell unchanged).
- **Icon library** — Screenshot shows icon-based nav. No icon library is currently installed. Plan uses simple text labels + optional SVG inline icons. If MUI icons are desired, `@mui/icons-material` is available (already a transitive dep of `@mui/material`).
