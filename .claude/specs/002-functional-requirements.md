# 002 — Functional Requirements Document (FRD)

> Detailed feature behavior, grounded in the current code. Cross-references:
> 001-PRD, 003-TAD, database/001-database-foundation.

## 1. System modules

| Module | Location | Responsibility |
| --- | --- | --- |
| Generation | `lib/ai/`, `app/api/generate`, `app/api/edit` | prompt → `function Page()` code |
| Prompt contract / parser | `lib/prompts/`, `lib/parser/` | system prompts; extract/repair model output |
| Provider abstraction | `lib/providers/` | `getProvider()` / `getCodegenProvider()` / vision |
| Link & Website Intelligence | `lib/agents/url.ts`, `link-intel.ts`, `site-crawler.ts`, `website-intel.ts` | classify/crawl URLs, build `WebsiteGraph`, critique |
| Business Agent | `lib/agents/business-agent.ts`, `prompts.ts`, `app/api/agent/*` | analyst → planner → specialists → website |
| IVIS (intent + planners) | `lib/intent/` | classify website type → vertical planner → plan |
| Document pipeline | `lib/documents/`, `app/api/parse`, `app/api/ocr` | parse PDF/DOCX/TXT/MD + OCR fallback |
| Understanding | `lib/knowledge/`, `app/api/understand` | text → KnowledgeGraph → intent → planner → context |
| Attachments | `lib/attachments/`, `store/attachment-store.ts`, `features/workspace/attachments/` | upload UX, state machine, extraction |
| Input handling | `lib/input/` | size limits, stats, content-type detection |
| Persistence | `supabase/migrations/`, `lib/projects/`, `lib/db/` | projects, versions, business profiles, generations |
| Workspace / editor UI | `features/` | composer, chat, preview, code editor, panels |

### 1.1 Surface generators (platform pattern)

PromptSite is a multi-surface platform (see 001-PRD §3, §6). The modules above
are the **shared core reused by every surface**: ingestion → understanding
(`KnowledgeGraph`) → intent/surface routing → planner → generator → preview →
persistence/version/cost. A surface is added by registering a **planner +
generator + preview adapter** (mirroring the data-driven `PlannerRegistry`) —
the core does not change. Current implemented surface: **Website**. Future
surfaces ship per the roadmap (v2 Slides + Image; v3 Mobile + Desktop/PWA; v4
all). Each FRD feature below is the Website implementation of these shared steps
unless a surface is named.

## 2. Feature behavior

### 2.1 Generate a landing page
- Input: prompt (3–200,000 chars), optional `projectId` (grounds in its
  business knowledge), optional injected vertical directive (IVIS).
- Output: a bare `function Page() {…}` string (Tailwind, pre-destructured
  hooks, no imports/exports), extracted/repaired by `extract-code.ts`.
- Images obey the curated-photo contract (no invented Unsplash IDs;
  industry-aware fallback).

### 2.2 Edit / refine
- Input: current code + instruction → `EDIT_SYSTEM_PROMPT` → re-extracted code.
- Only image URLs already in the code may be reused.

### 2.3 Document parsing (single pipeline)
- `validateFile` rejects non-PDF/DOCX/TXT/MD and >25MB before upload.
- `/api/parse` → `parseDocument()` delegates per extension; returns a
  `ParsedDocument { text, metadata }`.
- Scanned PDFs (`pageCount > 0 && wordCount < 10`) route to OCR (`/api/ocr`,
  pdf-to-img + Tesseract).

### 2.4 Structured understanding
- `/api/understand` → ExtractionService (LLM) → `KnowledgeGraph` → **structure-
  first** intent (person → portfolio; company → industry vertical) → planner →
  `generationContext` (structured knowledge + plan, **not** raw text).

### 2.5 Intent routing (IVIS)
- `detectIntent()` scores input against the PlannerRegistry's per-vertical
  signals; the matched `VerticalPlanner` emits a `WebsitePlan` (sections, CTAs,
  design language, SEO, anti-patterns). Low confidence → `CUSTOM` fallback.

### 2.6 Persistence & versioning
- Each generate/edit/restore creates a `project_versions` row; manual editor
  tweaks debounce-update the latest version; `recently_viewed` capped at 30.
- `generations` records cross-category generation events (see DB FRD).

## 3. State machines

### 3.1 Generator (`store/generator-store.ts`)
```
idle → generating → done        (success → code in store, version saved)
            └─────→ error        (message surfaced; previous code retained)
```

### 3.2 Attachment / parse (`store/attachment-store.ts`)
```
uploading → reading → processing → ready
                       └── (scanned PDF) → ocr-processing → ready
                       └── (failure)     → error (differentiated code)
```

### 3.3 Generation status (`generations.status`)
```
pending → running → completed
              └──→ failed
```

## 4. Validation rules

- User input: `min 3`, `max 200,000` chars (`lib/input/constants.ts`).
- File: extension ∈ {pdf,docx,txt,md,markdown}; size ≤ 25MB.
- `generations.status` ∈ {pending,running,completed,failed} (DB CHECK).
- `generations.category` ∈ 13 allowed categories (DB CHECK).
- Generated code must match the `function Page()` contract (parser enforces).
- All DB writes are owner-scoped (RLS) and parameterized (supabase-js).

## 5. Error handling

- **Documents:** differentiated `ParseError` codes — `corrupted`, `password`,
  `scanned`, `empty`, `unsupported`, `too_large`, `failed`. The generic
  "Couldn't read this file" is **banned**.
- **Providers:** normalized into `ProviderError` carrying an HTTP status the
  API routes pass through; never silently swallowed.
- **Agents/links:** crawl-blocked or failed sources degrade *honestly*
  (`extracted: false`, `assumptions: true`) and the run continues.
- **Specialists:** a failed specialist does not kill the run.

## 6. Edge cases

- Scanned/image-only PDF → OCR; if OCR yields nothing → `scanned` error.
- Combined inputs > 50k chars → accepted (200k cap), flagged "large input".
- Pasted social/LinkedIn URLs that block crawlers → degrade with a note.
- No-JS / reduced-motion: reveal animations are inert; content fully visible.
- Person who works in design → routes to portfolio, **not** design agency.

## 7. Definition of Done (per feature)

- Behavior matches this FRD; validation + differentiated errors in place.
- State transitions surface in the UI in real time.
- `npx tsc --noEmit` clean; owner-scoped data access; idempotent where stated.
- Specs in `.claude/specs` updated to match any behavior change.
