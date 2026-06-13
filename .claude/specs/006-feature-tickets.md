# 006 — Feature Ticket List (FTL)

> Implementable tickets derived from the current codebase's real gaps and the
> roadmap implied by 001–005. Priority: P0 (now) → P3 (later). Complexity:
> S / M / L / XL.

---

### DB-01 — Apply generations migration & seed
- **Description:** Apply `0005_generations.sql` to Supabase; set
  `SUPABASE_SERVICE_ROLE_KEY`; run `npm run db:seed`.
- **Dependencies:** none (code exists).
- **Acceptance:** `generations` table live with RLS/CHECKs/indexes; demo user +
  8 generations; re-running seed adds nothing.
- **Priority:** P0 · **Complexity:** S
- **Files:** `supabase/migrations/0005_generations.sql`, `scripts/seed-promptside.ts` (ops only).

### GEN-01 — Route generation through the understanding layer
- **Description:** When a request carries attached document text, send it as a
  separate field; `/api/generate` runs `understand()` and uses its structured
  `generationContext` instead of raw text appended to the prompt (avoid double
  intent-detection).
- **Dependencies:** understanding layer (done), composer submit.
- **Acceptance:** document-bearing generations consume `{prompt, knowledgeGraph,
  intent, plannerOutput}`; no raw document text in the prompt; no double planning.
- **Priority:** P0 · **Complexity:** M
- **Files:** `app/api/generate/route.ts`, `lib/ai/schema.ts`, `features/workspace/PromptComposer.tsx`, `hooks/use-*`, `lib/knowledge/understand.ts`.

### GEN-02 — Record a `generations` row per generation event
- **Description:** Call `createGeneration()` whenever a website/agent run
  completes (category=Website, token_cost, status, output_url, prompt).
- **Dependencies:** DB-01.
- **Acceptance:** every generate/agent-website run creates exactly one row with
  correct status transitions (pending→running→completed/failed).
- **Priority:** P1 · **Complexity:** M
- **Files:** `lib/db/generations.ts`, `app/api/generate/route.ts`, `app/api/agent/website/route.ts`, `hooks/use-business-agent.ts`.

### GEN-03 — Usage / activity view
- **Description:** Workspace view listing generations (category, date, cost,
  status) with simple monthly totals.
- **Dependencies:** GEN-02.
- **Acceptance:** user sees their generations grouped by month; totals match DB.
- **Priority:** P2 · **Complexity:** M
- **Files:** `features/workspace/*`, `lib/db/generations.ts`, a new route/tab.

### INP-01 — Preprocessing & chunking for large inputs
- **Description:** For inputs > 20k chars, chunk → analyze → merge into a
  `StructuredInput` before generation (don't send giant raw strings to the model).
- **Dependencies:** understanding layer.
- **Acceptance:** a 50k+ char paste produces a better, bounded structured input;
  generation latency stays reasonable.
- **Priority:** P2 · **Complexity:** L
- **Files:** `lib/input/*`, `lib/knowledge/*`.

### IVIS-01 — Complete the vertical catalog
- **Description:** Add the remaining ~14 vertical configs (HR consultancy,
  bakery, school/college/training, real-estate agency, furniture/electronics,
  distributor/printing/repair, software company, founder portfolio, community org).
- **Dependencies:** none.
- **Acceptance:** each routes correctly via `/api/plan`; distinct sections/CTAs.
- **Priority:** P2 · **Complexity:** M
- **Files:** `lib/intent/verticals/catalog.ts`, `lib/intent/types.ts`.

### DOC-01 — Verify DOCX end-to-end
- **Description:** Run a real `.docx` through `/api/parse`; confirm text +
  heading outline.
- **Dependencies:** none.
- **Acceptance:** DOCX parses with `metadata.headings`; no regressions.
- **Priority:** P1 · **Complexity:** S
- **Files:** `lib/documents/docx.ts` (verify only).

### REND-01 — Production headless Chrome for vision review
- **Description:** Wire `@sparticuz/chromium` so the vision-review loop runs in
  serverless production (not just the dev machine's Chrome).
- **Dependencies:** none.
- **Acceptance:** vision review runs in prod; screenshots captured; long route
  duration configured.
- **Priority:** P1 · **Complexity:** L
- **Files:** `lib/render/screenshot.ts`, deploy config.

### SEC-01 — Rate limiting on LLM/compute routes
- **Description:** Per-user/IP limits on `/api/generate`, `/api/parse`,
  `/api/ocr`, `/api/understand`, `/api/agent/*`.
- **Dependencies:** none.
- **Acceptance:** abusive request bursts are throttled with clear 429s; normal
  use unaffected.
- **Priority:** P1 · **Complexity:** M
- **Files:** new middleware/util, the listed routes.

### SEC-02 — Security audit logging
- **Description:** Centralized log of auth events and privileged data access.
- **Dependencies:** none.
- **Acceptance:** auth/admin actions are recorded and queryable.
- **Priority:** P2 · **Complexity:** M
- **Files:** new table/migration, `lib/supabase/*`.

### SEC-03 — CSP & security headers
- **Description:** Production CSP (nonce-based), HSTS, `X-Content-Type-Options`,
  frame/permissions policies.
- **Dependencies:** none.
- **Acceptance:** headers present in prod; preview iframe still functions.
- **Priority:** P1 · **Complexity:** M
- **Files:** `next.config.ts` / middleware.

### ATT-01 — Drag-and-drop attachments
- **Description:** Drop files onto the composer (the spec mentions DnD); same
  validation/pipeline as the picker.
- **Dependencies:** attachment system (done).
- **Acceptance:** dropping PDF/DOCX/TXT/MD ingests them; wrong types rejected.
- **Priority:** P3 · **Complexity:** S
- **Files:** `features/workspace/attachments/*`, `PromptComposer.tsx`.

### ATT-02 — Additional attachment providers
- **Description:** Implement a "Coming Soon" provider (e.g., Google Drive or
  LinkedIn resume import) via `registerAttachmentProvider()`.
- **Dependencies:** OAuth per provider.
- **Acceptance:** a previously-disabled source becomes functional with no menu
  refactor.
- **Priority:** P3 · **Complexity:** L
- **Files:** `lib/attachments/registry.tsx`, provider integration.

### OCR-01 — Multi-language OCR
- **Description:** Support non-English scanned docs (Tesseract language packs).
- **Dependencies:** OCR (done).
- **Acceptance:** a Hindi/other-language scan recovers text.
- **Priority:** P3 · **Complexity:** M
- **Files:** `lib/documents/ocr.ts`.

### DOCS-01 — Specs index + sync checklist
- **Description:** Add `.claude/specs/README.md` index and a "update specs on
  change" checklist; keep specs ↔ code consistent.
- **Dependencies:** none.
- **Acceptance:** index lists all docs; contributors update specs with code.
- **Priority:** P2 · **Complexity:** S
- **Files:** `.claude/specs/README.md`, `.claude/CLAUDE.md`.

### PLAT-01 — Surface registry & generator abstraction
- **Description:** Generalize the pipeline into a pluggable surface registry
  (planner + generator + preview adapter per surface), analogous to the IVIS
  `PlannerRegistry`. Add surface routing (explicit pick + inferred). Refactor
  Website to be the first registered surface.
- **Dependencies:** GEN-01.
- **Acceptance:** Website runs through the registry unchanged; adding a surface
  needs no core change.
- **Priority:** P2 · **Complexity:** L
- **Files:** new `lib/surfaces/*`, `lib/intent/*`, generate routes, composer.

### PLAT-02 — Private artifact storage + signed URLs
- **Description:** Owner-scoped private Supabase Storage buckets for binary
  artifacts (image/video/audio); signed/expiring share URLs. `generations.
  output_url` points to them.
- **Dependencies:** DB-01.
- **Acceptance:** binary artifacts are private; sharing uses capability links,
  not public buckets.
- **Priority:** P2 · **Complexity:** M
- **Files:** Storage policies, `lib/db/*`, sharing util.

### PLAT-03 — Long-running job / runner for heavy surfaces
- **Description:** Queue + runner for compute-heavy generations (video/audio/
  games render, wide research) with status polling via `generations.status`.
- **Dependencies:** PLAT-01, PLAT-02.
- **Acceptance:** a heavy generation runs async, surfaces progress, persists output.
- **Priority:** P3 · **Complexity:** L

### SURF-V2-01 — Slides surface *(v2)*
- **Description:** Deck planner + generator + slide-viewer preview; PPTX/PDF export.
- **Dependencies:** PLAT-01. **Acceptance:** prompt/docs → coherent, on-brand
  deck; versioned; exportable. **Priority:** P3 · **Complexity:** XL

### SURF-V2-02 — Image Generation surface *(v2)*
- **Description:** Image generator (brand-aware), gallery preview, variants,
  PNG/WebP export to private Storage.
- **Dependencies:** PLAT-01, PLAT-02. **Acceptance:** on-brand image set,
  versioned, downloadable. **Priority:** P3 · **Complexity:** L

### SURF-V3-01 — Mobile Apps surface *(v3)*
- **Description:** RN/Expo scaffold generator + device-frame preview + repo/zip export.
- **Dependencies:** PLAT-01. **Acceptance:** runnable scaffold, navigable screens.
  **Priority:** P3 · **Complexity:** XL

### SURF-V3-02 — Desktop/PWA surface *(v3)*
- **Description:** PWA/desktop scaffold generator + in-browser preview + installable build.
- **Dependencies:** PLAT-01. **Acceptance:** installable, offline-capable PWA.
  **Priority:** P3 · **Complexity:** XL

### SURF-V4 — Remaining v4 surfaces
- **Description:** Games, Design, Video, Audio, Scheduled Task, Wide Research,
  Visualisation, More/Other — each a planner + generator + preview adapter on the
  registry; heavy ones use PLAT-03.
- **Dependencies:** PLAT-01/02/03. **Acceptance:** each generates + persists +
  previews + exports end-to-end. **Priority:** P3 · **Complexity:** XL (per surface)

### FUT-02 — Billing on `token_cost` *(future)*
- **Description:** Turn recorded `token_cost` into metered billing/quotas.
- **Dependencies:** GEN-02, GEN-03.
- **Acceptance:** usage is metered against a plan; over-quota is handled.
- **Priority:** P3 · **Complexity:** XL
- **Files:** billing integration, `generations`, workspace.
