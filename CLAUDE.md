# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

PromptSite: prompt → a single production-ready React landing page, generated via one OpenAI
call (`gpt-4.1-mini` via the Responses API), with a live sandboxed preview and an editable
code view. Around that core sits a Supabase-backed product shell: Google/email auth, a
personal workspace (projects / recently viewed / templates), automatic persistence with
version history, and screenshot thumbnails. Still out of scope: multi-page sites and agent
loops — don't add them.

## Commands

```bash
npm install        # install dependencies
npm run dev         # start Next.js dev server (Turbopack) on :3000
npm run build       # production build
npm run start       # run the production build
npx tsc --noEmit --pretty false   # type-check (no separate lint/test scripts exist)
```

There is no test suite and no lint script configured — type-checking with `tsc` is the
primary correctness check. Before committing, also re-run `npx tsc --noEmit` after edits.

Requires `.env.local` with `OPENAI_API_KEY` (copy from `.env.example`). Optional
`OPENAI_MODEL` (default `gpt-4.1-mini`) and `AI_PROVIDER` (only `openai` supported today).

**Model routing**: website code generation (`generateLandingPage`/`editLandingPage`) uses
`getCodegenProvider()` → `OPENAI_CODEGEN_MODEL` (default `gpt-5`); every other agent call
(analysis, plans, graph, critic, concepts, reviews) uses `getProvider()` → `OPENAI_MODEL`
(default `gpt-4.1-mini`). Keep new agents on `getProvider()` unless they emit page code.

Also requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for auth and
persistence. One-time Supabase setup: run `supabase/migrations/0001`–`0004` in order in the
SQL editor (tables, RLS, `thumbnails` storage bucket, triggers) and enable the Google
provider under Authentication → Providers. Without these
vars the app builds and `/login` renders, but every protected route redirects to `/login`
and auth actions surface a config error.

## Architecture

### Auth, routing & persistence (Supabase)

- **Routes**: `/` redirects by session → `/workspace` (dashboard: My Projects / Recently
  Viewed / Templates tabs via `?tab=`) or `/login` (split-screen auth,
  `features/auth/`). `/new` hosts the prompt → generate flow, `/project/[id]` the editor,
  `/settings` account settings. `proxy.ts` (Next 16 middleware) refreshes the Supabase
  session on every request and guards `/workspace`, `/project`, `/settings`, `/new`.
- **Clients**: `lib/supabase/client.ts` (browser singleton), `lib/supabase/server.ts`
  (server components/route handlers — calls `cookies()` first so pages stay dynamic),
  `lib/supabase/config.ts` (`isSupabaseConfigured`). OAuth lands on `app/auth/callback`.
- **Data**: schema in `supabase/migrations/0001_init.sql` — `profiles`, `projects`,
  `project_versions` (one row per generate/edit/restore; manual editor tweaks update the
  latest version, debounced), `recently_viewed` (capped at 30 by trigger), all
  owner-scoped via RLS. All client-side data access goes through
  `lib/projects/service.ts`.
- **Editor**: `features/projects/ProjectEditor.tsx` wraps the shared `Workspace` UI —
  hydrates the Zustand store from the saved project (skipped when arriving from `/new`
  with state in memory), records views, auto-saves, and owns version history
  (`VersionHistory.tsx`; restore copies an old version forward as a new one).
- **Thumbnails**: `features/projects/ThumbnailCapture.tsx` renders the page in a hidden
  sandboxed iframe and screenshots it with html2canvas inside the sandbox
  (`lib/preview/build-capture-html.ts`), then uploads the JPEG to the public
  `thumbnails` bucket (`{user_id}/{project_id}.jpg`, cache-busted URL on the project).
- **Templates**: `lib/templates/catalog.ts` — 10 static starter pages (same bare
  `function Page()` contract, curated photo IDs only). Shipped in code, not the DB, so
  the Templates tab is always populated; "Use template" copies the code into a new
  project.

### Business OS (agents + shared knowledge base)

- **Universal input**: the homepage composer accepts a goal and/or a link
  (`lib/agents/url.ts` extracts/classifies URLs client-side for the "detected" chip).
- **Link Intelligence** (`lib/agents/link-intel.ts`, server-only): generic sites are
  fetched and reduced to text + meta; GitHub uses its public API. Sources that block
  crawlers (Instagram/LinkedIn/etc.) degrade *honestly* — `extracted: false` plus a note,
  and analysis proceeds from the URL + goal with `knowledge.assumptions = true`.
- **Website Intelligence Engine** (websites only; migration `0003_website_intel.sql`):
  `lib/agents/site-crawler.ts` crawls up to 7 pages (homepage + one each of
  pricing/products/features/blog/about/contact/docs/legal, classified by URL path) and
  lifts color/font hints from markup+CSS. `lib/agents/website-intel.ts` then builds a
  `WebsiteGraph` (pricing, funnel, positioning, design system, nav, SEO…), runs the
  **Critic Agent** (specific flaws vs. Apple/Stripe/Linear-level work), and — during
  generation via `app/api/agent/website` — runs a **self-critique loop**: generate →
  score 6 dimensions (visual/brand/conversion/a11y/mobile/perf) → regenerate with the
  reviewer's fixes injected, up to 3 iterations, shipping the highest-scoring version
  (stored as `project_versions.quality_review`). Graph + critique live on
  `business_profiles.website_graph` / `.site_critique` and render in the Overview tab.
  The website prompt gets `buildImprovementContext()` — improve, never replicate.
- **Concept exploration + evolution memory** (in `app/api/agent/website`): before
  generating, `exploreConcepts()` has a studio council produce 4 structurally different
  design directions and pick a winner (binding directive via `buildConceptContext()`); and
  the route injects the user's recent `design_lessons` rows ("EVOLUTION MEMORY — do not
  repeat" failures + "PROVEN WINNERS" with `category='winning'`) into context, then records
  the reviewer's top *design-level* fixes from any weak first pass (plumbing filtered out)
  and the winning concept of any ≥9 ship back into that table (migration
  `0004_design_lessons.sql`, capped at 60/user). Keep new signals flowing into it.
- **Vision review** (`lib/render/screenshot.ts` + `reviewRenderedScreenshots()`): each
  iteration renders the page in headless Chrome (`playwright-core`, `channel: 'chrome'` —
  uses the dev machine's Chrome, no browser download; **prod needs
  `@sparticuz/chromium`, not yet wired**), captures desktop hero / desktop mid-scroll /
  mobile hero JPEGs, and the Vision Creative Director (`OPENAI_VISION_MODEL`, default
  `gpt-4.1`, via `CompletionProvider.completeVision`) scores the *pixels*. When vision
  succeeds its verdict replaces the code-only review (code reviewer's fixes kept as
  secondary feedback); any failure degrades silently to code review. Adds ~30-40s per
  iteration. The code-only reviewer's `overall` is weighted (visual .3 / brand .2 /
  conversion .2 / a11y .1 / mobile .1 / perf .1) — keep both reviewers' weights in sync.
- **Business Agent** (`lib/agents/business-agent.ts` + `lib/agents/prompts.ts`):
  staged LLM pipeline — analyst (strict-JSON knowledge base) → planner (ordered
  `PlanStep[]`, always ends with the website) → specialist agents (research / growth /
  design briefs as Markdown). All specialists consume the same `BusinessKnowledge`;
  never add an agent that doesn't read it.
- **Persistence** (`supabase/migrations/0002_business_os.sql`): `business_profiles`
  (knowledge + plan, one per project), `agent_runs` (activity log), `project_documents`
  (latest doc per kind wins). API routes `app/api/agent/analyze` and `app/api/agent/run`
  do the server work; `lib/projects/business-service.ts` is the client access layer.
- **Orchestration** (`hooks/use-business-agent.ts`, client): create draft project →
  analyze → run planned specialists (failures don't kill the run) → generate the website
  via `/api/generate` with `projectId` (the route injects `buildWebsiteContext(knowledge)`
  into the prompt) → save v1 → open the editor. Live progress renders via
  `features/agent/AgentProgress.tsx` under the composer.
- **Project tabs**: when a project has a business profile, the editor nav gains
  Overview (`features/business/OverviewPanel.tsx` — knowledge base, plan, activity) and
  Business (`features/business/DocsPanel.tsx` — research/growth/design docs with
  on-demand regeneration). Quick/template projects without a profile hide these tabs.

### Request flow

1. User enters a prompt in `Hero`/`PromptForm` (`features/generator/`), which calls
   `useGenerate().generate()`.
2. `hooks/use-generate.ts` posts to `POST /api/generate`, which calls
   `lib/ai/generate.ts#generateLandingPage`.
3. That builds messages from `lib/prompts/system-prompt.ts`, sends them through
   `lib/providers/index.ts#getProvider()` (currently `OpenAIProvider`), and runs the raw
   model output through `lib/parser/extract-code.ts#extractPageCode` to produce a bare
   `function Page() { ... }` string.
4. The code string is stored in the Zustand store (`store/generator-store.ts`) and rendered:
   - **Preview**: `features/preview/PreviewFrame.tsx` builds a self-contained HTML doc
     (`lib/preview/build-html.ts`) that loads React/ReactDOM/Babel/Tailwind from CDNs and
     evaluates `function Page() {...}` in a sandboxed `<iframe sandbox="allow-scripts">`.
   - **Code**: `features/editor/CodeEditor.tsx` (CodeMirror, JS/JSX mode).
5. Refinements go through `RefineBar` → `useGenerate().edit()` → `POST /api/edit` →
   `lib/ai/generate.ts#editLandingPage`, which sends the current code + instruction through
   `EDIT_SYSTEM_PROMPT` and re-runs `extractPageCode`.

### Provider abstraction (`lib/providers/`)

`lib/ai` never talks to OpenAI directly — it calls `getProvider()`, which returns a
`CompletionProvider` (`{ complete(messages): Promise<string> }`). To add a new model/provider
(DeepSeek-Coder, Ollama, etc.), add a case in `lib/providers/index.ts` and a new class
implementing `CompletionProvider`, following `OpenAIProvider`'s pattern of normalizing all
errors into `ProviderError` (carries an HTTP status the API routes pass straight through).

### Generated code contract

The model output is a plaintext string that must be exactly a `function Page() { ... }`
declaration — no imports/exports, hooks pre-destructured (`useState`, `useEffect`, `useRef`,
`useCallback` from `React`), Tailwind classes for all styling, no external icon libs (inline
SVG/emoji). `extract-code.ts` is the safety net that strips markdown fences, stray
import/export lines, and leading prose, but the system prompts in
`lib/prompts/system-prompt.ts` are the primary contract — keep them and the parser in sync if
the output format changes.

**Images**: the system prompts require imagery to be **business-relevant in subject**
(depict the brand's domain), not chosen for mood, and ban placeholder/random stock photos.
The source hierarchy is:
1. For SaaS/product UI, dashboards, workflows — build HTML/CSS/SVG mockups, never photos.
2. For real photographic subjects — a **curated, hand-verified library of ~55 real Unsplash
   photo IDs** embedded in `GENERATE_SYSTEM_PROMPT` (grouped by domain: restaurant, real
   estate, office, tech, retail, fitness, hotel, cafe/coffee). The model must use exactly those
   IDs via `images.unsplash.com/{id}?w={width}&q=80&auto=format&fit=crop` and may never invent
   an ID (invented IDs 404 — that was the original failure mode). If no library image fits, the
   section should be designed with typography/CSS/SVG instead. The parser's fallback for
   invented IDs is **industry-aware**: `fallbackPhotoId(id, industryHint)` replaces them only
   from the library category matching the business (hint threaded from
   `BusinessKnowledge.industry` through `generateLandingPage` → `extractPageCode`); a random
   cross-category replacement is what once put salad photos on a coffee site — never revert to it.
3. loremflickr / picsum / source.unsplash.com are all banned — random subjects read as
   placeholder stock.
The edit prompt only allows reusing image URLs already present in the current code.
Keep this hierarchy in sync with the IMAGES sections in `lib/prompts/system-prompt.ts` —
if you add library entries, verify each ID resolves (curl → 200) before adding it.

### State (`store/generator-store.ts`)

A single Zustand store (`GeneratorState` + `GeneratorActions` in `types/index.ts`) holds
`prompt`, `code`, `status`, `error`, and `messages` (the chat-style conversation history
shown in `features/generator/ChatPanel.tsx`). `useGenerate` is the only place that mutates
`messages`/`code`/`status` during generate/edit — it appends a user message and a
building/done/error assistant message (with an optional status `card`) for each turn.

### UI structure (`features/generator/`)

- `Hero` + `PromptForm`: initial empty-state prompt entry (shown while `code` is empty).
- `Workspace`: post-generation layout — left column is the chat conversation (`ChatPanel`,
  default view, Lovable-style), right column toggles between `PreviewFrame` and `CodeEditor`
  via a Preview/Code segmented control. On mobile, a 3-way Chat/Preview/Code tab in the
  header controls which single panel is shown.
- `RefineBar`: the chat input at the bottom of `ChatPanel`, used for both viewing and
  triggering edits via `onRefine`.

### Path aliases & styling

- `@/*` maps to the repo root (see `tsconfig.json`).
- Tailwind v4 via `@tailwindcss/postcss`; design tokens (colors, etc.) are CSS custom
  properties defined in `app/globals.css` (`--background`, `--surface`, `--accent`, etc.) and
  exposed to Tailwind via `@theme inline`. Use `cn()` from `utils/cn.ts` (clsx + tailwind-merge)
  for conditional class names.
