# Project Claude instructions

## Operating directive — read first

PromptSite is a **universal AI generation platform** (not a website generator),
built to elite-studio quality. The authoritative charter is
**`.claude/specs/000-platform-vision.md`** — mission, principles
(quality-over-speed, understand-before-build, think-like-experts), the quality
loop (Understand → Plan → Implement → Run → Review → Critique → Improve →
Repeat), and the **Definition of Done**. Apply it to all work.

**Documentation-driven development.** `.claude/specs/` is the single source of
truth. **Read specs in priority order before implementing** (000 → 001 → 002 →
003 → database → 004 → 005 → 006; index: `.claude/specs/README.md`). Also read
`.claude/rules/` and `.claude/skills/`. Implementation must be **traceable to
specs**; when code and specs disagree, **explain it, update the doc, ask if
needed, then implement — never silently diverge.** Update the affected spec
*first* when requirements or architecture change. Treat the repository as the
source of truth — never assume stack/DB/infra without reading the code.

## Canonical architecture (source of truth)

PromptSite is **Next.js 16 + TypeScript + Supabase/Postgres**. This is the canonical
stack — all PRDs/FRDs and future specs assume it. Do **not** introduce a second backend
(no Flask/SQLite/Python/ORM). Persistence rules:

- **Identity = Supabase Auth (`auth.users`)** + the `public.profiles` mirror. There is no
  custom `users`/`password_hash` table — Supabase Auth owns credentials. Reference users
  via `auth.users(id)` (uuid).
- **Schema lives in `supabase/migrations/*.sql`** (idempotent: `create … if not exists`,
  `drop policy if exists` then `create policy`). PK `uuid default gen_random_uuid()`,
  `timestamptz default now()`, **RLS on every table** owner-scoped via `auth.uid()`,
  `CHECK` constraints for enums, `jsonb` for metadata.
- **Generations ledger:** `public.generations` (migration `0005`) tracks every generation
  across categories (Website / Mobile Apps / Games / Slides / Design / …). Access via
  `lib/db/generations.ts` (RLS-scoped). Allowed statuses/categories are enforced by DB
  CHECKs and mirrored as TS constants there.
- **Seeding:** `scripts/seed-promptside.ts` (`npm run db:seed`) — idempotent, needs
  `SUPABASE_SERVICE_ROLE_KEY`. Privileged server access uses `lib/supabase/admin.ts`.



## Canonical PDF / document pipeline (MANDATORY)

Whenever work involves **any** of:

- PDF uploads
- Resume / CV parsing
- Document ingestion (PDF / DOCX / TXT / MD)
- Scanned PDFs
- OCR
- File extraction failures or error messaging

…you **must** consult and follow the PDF skill as the canonical reference:

> **`.claude/skills/pdf/`** — `SKILL.md`, `reference.md`, `forms.md`, `scripts/`,
> and **`PIPELINE.md`** (this project's runtime parser + OCR contract).

The canonical **runtime** implementation lives in:

- `lib/documents/parse.ts` — `DocumentParser.parseDocument()` (delegator + state machine)
- `lib/documents/pdf.ts` — PDF text extraction (pdf.js, per-page fallback, error classification)
- `lib/documents/ocr.ts` — OCR fallback for scanned PDFs
- `lib/documents/docx.ts`, `lib/documents/text.ts` — other formats
- `lib/documents/types.ts` — `ParsedDocument`, `ParseError(code)`, status union, error copy
- `app/api/parse/route.ts` — server-side parse endpoint

### Rules (do not regress)

1. **Single pipeline.** All document parsing — resumes, company profiles, scanned PDFs —
   goes through `parseDocument()`. Never add a second parser path.
2. **OCR fallback is required.** PDF → extract text → if `pageCount > 0 && wordCount < 10`,
   the file is scanned → run OCR (`ocr-processing` state) → extract → ready. A scanned PDF
   must never silently fail.
3. **No generic errors.** The string **"Couldn't read this file" is banned.** Always use a
   differentiated `ParseError` code with specific copy:
   - `corrupted` → "This PDF appears to be corrupted."
   - `password` → "This PDF is password protected."
   - `scanned` (OCR running) → "Scanned PDF detected. Running OCR…"
   - `scanned` (OCR failed) → "We couldn't extract text from this scanned PDF."
4. **State machine:** `uploading → uploaded → reading → processing → ocr-processing → ready`
   (or `error`). Status changes must surface in the UI in real time.
5. **Structured before generation.** Parsed text feeds the understanding layer
   (`lib/knowledge/`) → KnowledgeGraph → intent → planner. Generation consumes structured
   knowledge, not raw document text.

Any change to document parsing, OCR, or extraction errors must keep `.claude/skills/pdf` and
`lib/documents/` in sync, and must preserve every rule above.
