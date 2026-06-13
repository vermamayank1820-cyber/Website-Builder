# 003 — Technical Architecture Document (TAD)

## 1. Technology stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack), React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`), CSS custom-property tokens |
| Client state | Zustand |
| Forms / validation | React Hook Form + Zod |
| Auth + DB + Storage | Supabase (Postgres, Auth, `thumbnails` bucket) |
| LLM | OpenAI — `gpt-4.1-mini` (analysis), `gpt-5` (codegen), `gpt-4.1` (vision) |
| Rendering / review | `playwright-core` + system Chrome (prod needs `@sparticuz/chromium`) |
| Documents | `pdfjs-dist`, `mammoth`, `pdf-to-img` + `tesseract.js` + `@napi-rs/canvas` (OCR) |
| Editor / preview | CodeMirror; sandboxed `<iframe>` + CDN React/Babel/Tailwind |

## 2. Repository structure

```
app/                Next.js routes
  api/              generate · edit · agent/* · parse · ocr · understand · plan
  workspace · new · project/[id] · settings · login · auth/callback
lib/
  ai/ providers/ prompts/ parser/      generation core
  agents/                              link & website intelligence, business agent
  intent/                              IVIS: detect · registry · planners · verticals
  documents/                           parse · pdf · docx · text · ocr
  knowledge/                           extract · context · understand (KnowledgeGraph)
  attachments/ input/                  upload pipeline, size/stat helpers
  supabase/ projects/ db/              clients, data access, generations
  render/ preview/ templates/ seo/
features/                             UI by surface (generator, workspace, editor, …)
store/                                Zustand stores
types/                                shared types
supabase/migrations/                  0001–0005 SQL (idempotent)
scripts/                              seed-promptside.ts
proxy.ts                              Next middleware (session refresh + route guards)
.claude/specs/                        this documentation suite (source of truth)
```

## 3. System boundaries

- **Browser** (client components, Zustand, sandboxed preview) ↔ **Next server**
  (route handlers, server components, middleware) ↔ **Supabase** (Postgres/Auth/
  Storage) and **OpenAI** (LLM/vision). Document parsing/OCR and all LLM calls
  run **server-side**; the sandboxed preview iframe executes generated code in
  isolation (`sandbox="allow-scripts"`).

## 4. Data flow

```
Prompt / URL / Documents
   │  (documents → /api/parse → /api/ocr if scanned)
   ▼
Text  ──► /api/understand ──► KnowledgeGraph ──► IntentDetection ──► PlannerRegistry
   │                                                                    │
   └────────────────────────► generationContext (knowledge + plan) ◄────┘
                                          │
                                          ▼
                         /api/generate (OpenAI codegen) ──► function Page() code
                                          │
                     ┌────────────────────┼─────────────────────┐
                     ▼                    ▼                     ▼
              Zustand store        Sandboxed preview      Supabase persist
                                   (iframe)               (projects/versions/generations)
                                          │
                                  Self-critique + vision review loop (agent/website)
```

## 5. Database architecture

Postgres via Supabase. Tables (migrations 0001–0005): `profiles`, `projects`,
`project_versions`, `recently_viewed`, `business_profiles`, `agent_runs`,
`project_documents`, `design_lessons`, `generations`. Conventions: `uuid` PKs,
`timestamptz` defaults, **RLS owner-scoped on every table**, `jsonb` metadata,
`CHECK` enums, FK `on delete cascade` from `auth.users`. Full detail:
`database/001-database-foundation.md`.

## 6. API architecture

Next route handlers, JSON in/out, consistent `{ success, data | error }`
envelope. Server-only secrets. Key routes: `/api/generate`, `/api/edit`,
`/api/agent/{analyze,run,website}`, `/api/parse`, `/api/ocr`, `/api/understand`,
`/api/plan` (introspection). `runtime = 'nodejs'` where native deps (pdf.js,
canvas, tesseract) are used.

## 7. Authentication architecture

Supabase Auth (Google OAuth + email). `proxy.ts` refreshes the session on every
matched request and guards `/workspace`, `/project`, `/settings`, `/new`. OAuth
returns to `app/auth/callback`. `public.profiles` mirrors `auth.users` via a
`handle_new_user` trigger. Clients: `lib/supabase/client.ts` (browser),
`server.ts` (RSC/handlers), `admin.ts` (service role, server-only). See 004-SAD.

## 8. Deployment architecture

Target: Vercel (Next.js). Env: `OPENAI_API_KEY`, optional `OPENAI_*_MODEL`,
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY` (seeding/admin). Migrations applied via Supabase SQL
editor / `supabase db push`. **Known gap:** the vision-review loop uses the dev
machine's Chrome; production needs `@sparticuz/chromium` wired in
`lib/render/screenshot.ts` (long route durations also required).

## 9. External integrations

OpenAI (codegen/analysis/vision), Supabase, Unsplash (curated photo IDs only),
GitHub public API (link intelligence). Several MCP servers are available in the
dev environment (Playwright, Magic, Figma, …) but are not runtime dependencies.

## 10. Scalability considerations

- LLM calls dominate latency/cost — model routing keeps cheap models on
  analysis and reserves `gpt-5` for codegen; large inputs are bounded (200k) and
  intended to be preprocessed (chunking is a staged enhancement).
- Heavy parsers externalized from the server bundle (`serverExternalPackages`);
  OCR capped at `MAX_OCR_PAGES`.
- Stateless route handlers scale horizontally; Postgres/RLS is the consistency
  boundary; thumbnails offloaded to Supabase Storage.

## 11. Technical decisions & tradeoffs

- **Supabase Auth over a custom users table** — no password storage in app
  schema; one identity source. (See database FRD §2.)
- **Server-side document parsing** — reliability over client privacy; removes
  pdf.js/canvas/tesseract from the client bundle.
- **`pdfjs-dist` pinned to 5.6.205** to match `pdf-to-img` (avoids worker
  version mismatch).
- **Data-driven PlannerRegistry** (configs + factory) over 50 hand-written
  planners — each vertical stays distinct, additions are one file.
- **Structured generation input** (KnowledgeGraph + plan) over raw document
  text — "understand before generate".
- **Sandboxed iframe preview** (CDN runtime) — isolates untrusted generated code
  from the app origin.

## 12. Surface-generator architecture (platform)

PromptSite is a universal generation platform (001-PRD). Surfaces are
**pluggable** behind the shared intelligence core; adding one must not modify the
core pipeline.

- **Surface registry** (future, analogous to `lib/intent` `PlannerRegistry`):
  each surface registers a **planner** (intent → structured plan), a
  **generator** (plan + `KnowledgeGraph` → artifact), and a **preview adapter**
  (artifact → live preview). Routing first detects *surface*, then the in-surface
  vertical/archetype.
- **Artifact storage:** text/structured artifacts (web code, decks, research,
  viz specs) live in Postgres (`text`/`jsonb`, versioned like
  `project_versions`); **binary artifacts** (image/video/audio) live in Supabase
  **Storage** buckets, owner-scoped, referenced by `generations.output_url`.
- **Compute:** heavy surfaces (video/audio/games render, wide research) imply
  long-running/queued jobs and external inference providers — a job/runner
  abstraction is required before v4 (see 006-FTL `FUT-01`).
- **Cost/versioning/auth** are platform services every surface inherits — not
  reimplemented per surface.

Roadmap mapping: **v1** Website (live) → **v2** Slides + Image → **v3** Mobile +
Desktop/PWA → **v4** all surfaces.
