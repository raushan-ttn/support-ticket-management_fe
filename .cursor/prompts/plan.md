---
description: SDLC Phase 1 — plan a feature before any code (rendering strategy, affected files, risks)
---

@.cursor/prompts/personas/planner.md
@.cursor/skills/planning/SKILL.md

# /plan — Planning & Requirements

Produce a reviewable implementation plan for the feature below. Write no code until the plan is approved.

## Feature to Plan
[DESCRIBE THE FEATURE]

## Produce
1. **Clarify** — what it does, who uses it, auth required?, protected routes?, data user-specific (→ dynamic) or shared (→ static/ISR)?, interactivity needed?
2. **Rendering strategy** (choose one + justify): Static RSC · Dynamic RSC (`no-store`) · ISR (`revalidate: N`) · Client Component + Server Action · Mixed (describe the boundary).
3. **Affected files** — list every file across layers: `src/constants/api-endpoints.ts`, `src/types/*`, `src/lib/cookies.ts` (auth), `src/actions/*-actions.ts` (backend proxy), `src/components/AuthWrapper/` + `src/app/[feature]/layout.tsx` (route guard), `src/lib/store/*Slice.ts`, `src/components/[Feature]/*`, `src/app/[route]/{page,loading,error}.tsx`, co-located `.module.scss`.
4. **Steps** — numbered, in dependency order (endpoints → types → cookies → actions → slice → CC → AuthWrapper/layout → page).
5. **Risks / open questions** — CORS (Server Actions only?), httpOnly cookie security, AuthWrapper placement (per-feature layout, not root), redirect loop on login, legacy RTK Query migration, client boundary, cache `revalidateTag`, bundle (`dynamic()`?), slow fetch (`<Suspense>`?).

## Output Template
```markdown
## Plan: [Feature]
### Rendering Strategy
[choice + one-line why]
### Affected Files
- path — purpose
### Steps
1. …
### Risks / Open Questions
- …
```

## Done When
- [ ] Plan filled in, one rendering decision justified, every file listed, risks named.
- [ ] Stop and wait for approval → then hand off to `/build`.
