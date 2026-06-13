# 001 — Product Requirements Document (PRD)

> Source of truth for product intent. PromptSite is a **universal AI generation
> platform**, not a website generator. Non-website surfaces are first-class
> product concepts (and part of the long-term architecture), delivered on a
> staged roadmap. Canonical stack: Next.js 16 + TypeScript + Supabase/Postgres +
> OpenAI. *(Repo/package name is `promptsite`; "PromptSide" in some inputs is
> the same product.)*

---

## 1. Product Vision

### 1.1 Long-term
PromptSite is an **AI operating system for digital creation**: it understands
prompts, links, documents, and multimodal context, then generates **many types
of digital outputs** — websites, apps, slides, games, design, media, research,
visualisations, and automation. The user describes intent in natural language
(plus optional context), and the platform plans, generates, previews, refines,
versions, and ships the right artifact for the right surface.

The differentiator is **understanding before generation**: the same intelligence
core (multimodal ingestion → structured `KnowledgeGraph` → intent/surface
detection → surface planner → generator → review loop) is reused across every
surface, so quality and personalization compound platform-wide.

### 1.2 Current reality (honest)
**v1 ships website generation only.** The intelligence core (document parsing +
OCR, KnowledgeGraph extraction, intent detection, the IVIS vertical
PlannerRegistry, self-critique + vision review) and the cross-surface
persistence model (`generations` ledger) already exist; other surfaces are
defined here as first-class concepts and delivered per the roadmap (§6).

---

## 2. Platform Capabilities

Cross-surface capabilities provided once and reused by every generator:

- **Multimodal ingestion** — prompt, URL (link/website intelligence), and
  documents (PDF/DOCX/TXT/MD with OCR for scans).
- **Understanding layer** — structured `KnowledgeGraph` extraction from any
  input; "understand the meaning before generating."
- **Intent & surface routing** — detect *which surface* and *which vertical/
  archetype* the request implies (today: website type via IVIS; extensible to a
  surface registry).
- **Planning** — a surface/vertical planner produces a structured plan
  (sections/scenes/scaffold, design language, CTAs/actions) the generator follows.
- **Generation** — model-driven production of the artifact (code, deck, image,
  app scaffold, media, dataset…).
- **Preview** — surface-appropriate live preview (sandboxed iframe for web; deck
  viewer; media player; etc.).
- **Refinement** — conversational edit loop scoped to the artifact.
- **Version history** — every generate/edit/restore is a version.
- **Quality loop** — code/vision/structural review and iterate before shipping.
- **Persistence, sharing/export, and cost tracking** — uniform platform services
  (Supabase + `generations` ledger + artifact storage).

---

## 3. Generation Surface Matrix

| Surface | Purpose | Primary inputs | Output artifact | Release |
| --- | --- | --- | --- | --- |
| **Website** | Production landing page native to the vertical | prompt · URL · docs | self-contained React/Tailwind `Page()` | **v1 ✅** |
| **Slides** | Narrative deck / pitch | prompt · docs | slide deck (structured + rendered) | v2 |
| **Image Generation** | On-brand imagery | prompt · refs | image set | v2 |
| **Mobile Apps** | App UI/prototype | prompt · docs | RN/Expo scaffold + screens | v3 |
| **Desktop Apps/PWA** | Installable app/PWA | prompt · docs | PWA/desktop scaffold | v3 |
| **Games** | Browser game | prompt | playable canvas/web game | v4 |
| **Design** | Brand/visual assets | prompt · brand docs | logos, systems, mockups | v4 |
| **Video Generation** | Short-form video | prompt · assets | rendered video | v4 |
| **Audio Generation** | Voice/music/SFX | prompt | audio file | v4 |
| **Scheduled Task** | Recurring automation | prompt · schedule | a saved, running job | v4 |
| **Wide Research** | Deep multi-source research | prompt · URLs | research report | v4 |
| **Visualisation** | Data → charts/dashboards | prompt · data | interactive visualisation | v4 |
| **More/Other** | Extensible catch-all | any | surface-defined | v4 |

---

## 4. User Personas

- **Founder / SMB owner** (esp. Indian SMBs) — wants a premium website now;
  later a pitch deck (Slides), brand imagery (Image/Design), and an app (Mobile).
- **Individual / professional** — resume → portfolio website; later a personal
  deck, headshots/imagery, a research brief.
- **Operator / marketer** — paste a site to improve; generate campaign imagery,
  decks, visualisations of performance data.
- **Builder / indie hacker** — prototype a web app, mobile app, or game from a
  prompt; automate a recurring task.
- **Researcher / analyst** — Wide Research reports and Visualisations from data.

A single account spans surfaces; the workspace is surface-agnostic.

---

## 5. Core User Journeys

1. **Intent → artifact (any surface).** Describe a goal (+ optional context) →
   platform detects surface + intent → plans → generates → preview → refine →
   save (versioned) → share/export.
2. **Document → artifact.** Attach a resume/brief/data → parsed + understood →
   the right surface generated (resume → portfolio website; data → Visualisation).
3. **URL → improved artifact.** Paste a site → crawl + critique → regenerate
   better; or repurpose its content into another surface (e.g., a deck).
4. **Cross-surface reuse.** One `KnowledgeGraph` powers multiple surfaces (e.g.,
   a brand brief → Website + Slides + Image set).
5. **Workspace.** Browse all generations across surfaces; reopen any to edit,
   re-version, or export.

---

## 6. Release Roadmap

| Release | Surfaces | Theme |
| --- | --- | --- |
| **v1** *(current)* | Website | Prove the intelligence core + quality loop on one surface |
| **v2** | Website + **Slides** + **Image Generation** | First non-web surfaces; reuse understanding + artifact storage |
| **v3** | v2 + **Mobile Apps** + **Desktop Apps/PWA** | App-scaffold generators; richer preview/export |
| **v4** | **All surfaces** | Universal platform: Games, Design, Video, Audio, Scheduled Task, Wide Research, Visualisation, More/Other |

Each release adds surface generators behind the existing core; persistence,
auth, version history, and cost tracking are already platform-wide.

---

## 7. Functional Requirements per Surface

**Platform defaults (apply to every surface unless overridden):**
- **Persistence:** a `generations` row per event (category, status, token_cost,
  metadata) + the artifact stored in Postgres (`jsonb`/text) or Supabase Storage
  (binary: image/video/audio); owner-scoped (RLS).
- **Version history:** every generate/edit/restore creates a version
  (`project_versions`-style), restorable.
- **Sharing/export:** an owner-controlled shareable link and a
  surface-appropriate export (file/zip/embed).
- **Cost tracking:** `token_cost` recorded per generation (charged later — §10).

Per surface (Inputs / Outputs / Preview / Editing — others = platform default
unless noted; plus Success criteria & Future extensibility):

### Website *(v1, shipping)*
- **Inputs:** prompt, URL, documents. **Outputs:** self-contained React/Tailwind
  `Page()`. **Preview:** sandboxed iframe (CDN runtime). **Editing:** chat
  refine + code editor. **Success:** vertical-native, premium, passes
  code+vision review. **Extensibility:** multi-page sites; component export.

### Slides *(v2)*
- **Inputs:** prompt, documents (decks/briefs). **Outputs:** structured slide
  model + rendered deck. **Preview:** slide viewer/thumbnails. **Editing:**
  per-slide chat + reorder. **Success:** coherent narrative, on-brand, exportable
  to PPTX/PDF. **Extensibility:** themes, speaker notes, live present mode.

### Image Generation *(v2)*
- **Inputs:** prompt, reference images, brand. **Outputs:** image set (variants).
  **Preview:** gallery. **Editing:** re-prompt, inpaint/variations. **Export:**
  PNG/WebP downloads. **Success:** on-brand, usable resolution. **Extensibility:**
  style presets, brand-locked palettes, batch.

### Mobile Apps *(v3)*
- **Inputs:** prompt, documents. **Outputs:** React Native/Expo scaffold +
  screens. **Preview:** device-frame web preview / Expo. **Editing:** chat +
  code. **Export:** repo/zip. **Success:** runnable scaffold, navigable screens.
  **Extensibility:** native modules, store-ready builds.

### Desktop Apps/PWA *(v3)*
- **Inputs:** prompt, documents. **Outputs:** PWA/desktop (Tauri/Electron)
  scaffold. **Preview:** in-browser. **Editing:** chat + code. **Export:**
  installable build/repo. **Success:** installable, offline-capable PWA.
  **Extensibility:** auto-update, packaging targets.

### Games *(v4)*
- **Inputs:** prompt. **Outputs:** playable canvas/web game. **Preview:** live
  play in sandbox. **Editing:** chat (mechanics/assets). **Export:** embeddable
  build. **Success:** playable loop, no crashes. **Extensibility:** assets,
  levels, multiplayer.

### Design *(v4)*
- **Inputs:** prompt, brand docs. **Outputs:** logos/identity/mockups. **Preview:**
  canvas/gallery. **Editing:** re-prompt + variants. **Export:** SVG/PNG/PDF.
  **Success:** cohesive system, brand-consistent. **Extensibility:** full brand
  kits, Figma export.

### Video Generation *(v4)*
- **Inputs:** prompt, assets/script. **Outputs:** rendered video. **Preview:**
  player. **Editing:** re-prompt, trim, re-render. **Export:** MP4. **Success:**
  coherent short-form clip. **Extensibility:** longer form, captions, voiceover.

### Audio Generation *(v4)*
- **Inputs:** prompt. **Outputs:** voice/music/SFX file. **Preview:** player.
  **Editing:** re-prompt/regenerate. **Export:** MP3/WAV. **Success:** usable
  audio. **Extensibility:** voice cloning, stems.

### Scheduled Task *(v4)*
- **Inputs:** prompt + schedule. **Outputs:** a saved, recurring job (not a
  one-off artifact). **Preview:** run history/next-run. **Editing:** edit
  schedule/prompt; pause/resume. **Persistence:** job + run log. **Success:**
  fires on schedule, results retrievable. **Extensibility:** triggers, chained
  actions.

### Wide Research *(v4)*
- **Inputs:** prompt, URLs. **Outputs:** structured research report + sources.
  **Preview:** report view. **Editing:** refine scope, re-run. **Export:**
  MD/PDF. **Success:** accurate, cited, broad coverage. **Extensibility:**
  scheduled refreshes, dashboards.

### Visualisation *(v4)*
- **Inputs:** prompt, data (CSV/JSON/connected source). **Outputs:** interactive
  charts/dashboard. **Preview:** live interactive embed. **Editing:** chat
  (chart type, fields). **Export:** embed/PNG/data. **Success:** correct,
  legible, interactive. **Extensibility:** live data sources, drill-down.

### More/Other *(v4)*
- Extensible surface registry: a new surface ships a planner + generator +
  preview adapter and inherits all platform services. **Success:** added without
  touching the core. **Extensibility:** community/3rd-party surfaces.

---

## 8. Non-Functional Requirements

- **Security:** RLS on every table; Supabase Auth; parameterized queries;
  secrets server-only; artifact storage owner-scoped (see 004-SAD).
- **Performance:** lean client bundles (heavy work server-side); model routing
  by cost; bounded inputs (preprocessing/chunking for large context).
- **Reliability:** idempotent migrations/seed; graceful degradation when a
  document, URL, model, or render step fails — never hard-fail the run.
- **Accessibility:** WCAG 2 AA on first-party UI; reduced-motion respected.
- **Extensibility:** surfaces are pluggable (registry pattern, like the
  PlannerRegistry); adding one must not modify the core pipeline.
- **Portability of artifacts:** every surface supports export, not lock-in.

---

## 9. Success Metrics

- **Platform activation:** % of users generating ≥1 artifact in session one;
  number of distinct surfaces used per account.
- **Quality:** mean review score per surface (code/vision/structural).
- **Understanding accuracy:** correct surface + intent classification rate.
- **Reliability:** parse/OCR recovery rate; generation success rate per surface.
- **Cross-surface adoption:** % of users using ≥2 surfaces (v2+).
- **Retention / expansion:** returning users; artifacts per user over time.

---

## 10. Open Questions

- **Surface routing:** how does the platform decide *which surface* when the
  prompt is ambiguous (explicit picker vs inferred vs both)?
- **Artifact storage model:** Postgres vs Supabase Storage thresholds for
  large binaries (image/video/audio); retention.
- **Billing:** when does recorded `token_cost` become metered billing/quotas,
  and per-surface pricing?
- **Sharing model:** public links, permissions, expiry across surfaces.
- **Compute:** production render/inference for heavy surfaces (video/audio/games)
  — providers, queues, long-running jobs.
- **Sequencing within v4:** ordering of Games/Design/Video/Audio/Research/Viz.
