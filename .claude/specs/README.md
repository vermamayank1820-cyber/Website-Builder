# PromptSite — Specifications (single source of truth)

Read these **in priority order** before implementing anything. Keep them
synchronized with the code: when architecture or requirements change, **update
the affected spec first**, then implement. **Never silently diverge** — explain
the discrepancy, update the doc, ask if needed, then build. Flag any spec ↔ code
inconsistency you find. Also read `.claude/rules/` and `.claude/skills/` first,
and treat the **repository as source of truth**.

| # | Doc | Scope |
| --- | --- | --- |
| **000** | [000-platform-vision.md](000-platform-vision.md) | **Charter** — mission, vision, principles, quality bar, Definition of Done. Highest priority. |
| 001 | [001-product-prd.md](001-product-prd.md) | Vision, goals/non-goals, users, journeys, surface matrix, roadmap, per-surface requirements, metrics |
| [002-functional-requirements.md](002-functional-requirements.md) | Modules, behavior, flows, state machines, validation, errors, edge cases, DoD |
| [003-technical-architecture.md](003-technical-architecture.md) | Stack, repo structure, boundaries, data flow, DB/API/auth/deploy, tradeoffs |
| [004-security-access.md](004-security-access.md) | Auth/authz, roles, sessions, secrets, validation, API/DB security, risks |
| [005-frontend-specification.md](005-frontend-specification.md) | IA, routes, screens, components, design system, states, a11y, navigation |
| [006-feature-tickets.md](006-feature-tickets.md) | Implementable tickets (ID, deps, acceptance, priority, complexity, files) |
| [database/001-database-foundation.md](database/001-database-foundation.md) | Database FRD — schema, constraints, RLS, seed |

**Product:** PromptSite is a **universal AI generation platform** — many
generation surfaces (Website, Slides, Image, Mobile, Desktop/PWA, Games, Design,
Video, Audio, Scheduled Task, Wide Research, Visualisation, More/Other) on a
shared intelligence core, delivered on a staged roadmap (v1 Website → v4 all).
Non-website surfaces are **first-class product concepts**, not database
placeholders. See 001-PRD.

**Canonical stack:** Next.js 16 + TypeScript + Supabase/Postgres + OpenAI. No
Flask/SQLite/ORM/second backend. Identity is Supabase Auth (`auth.users`).
