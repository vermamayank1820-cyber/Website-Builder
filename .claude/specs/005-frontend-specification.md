# 005 — Frontend Specification Document (FSD)

## 1. Information architecture

Two zones: an **authenticated product** (workspace → generate → edit) and a thin
**public** zone (marketing/login). All real data lives behind auth; the composer
is the primary entry to generation.

**Surface-agnostic by design (platform, 001-PRD).** The workspace lists
generations across **all surfaces** (Website today; Slides, Image, Mobile, … as
they ship), filterable by category. The composer gains a **surface selector**
(explicit pick, or inferred from intent) in v2+, and each surface contributes a
**preview adapter** (sandboxed iframe for web; deck viewer; media player;
device-frame; report/viz embed). Current shipped surface: **Website**. The
screens below describe the Website surface unless noted; new surfaces reuse the
same composer → preview → refine → version → export shell.

## 2. Route structure

| Route | Auth | Purpose |
| --- | --- | --- |
| `/` | — | redirects by session → `/workspace` or `/login` |
| `/login` | public | split-screen Google/email auth (`features/auth/`) |
| `/auth/callback` | public | OAuth landing |
| `/workspace` | guarded | dashboard: My Projects / Recently Viewed / Templates (`?tab=`) |
| `/new` | guarded | prompt → generate flow |
| `/project/[id]` | guarded | editor (preview / code / chat; Overview & Business tabs when a profile exists) |
| `/settings` | guarded | account settings |

Dev/demo routes (not core product): `/attach-demo` (attachment QA harness),
`/meridian`, `/folio` (design reference builds).

## 3. Screen inventory

- **Login** — split-screen, OAuth + email.
- **Workspace dashboard** — tabbed project grids with thumbnails.
- **Composer** (`PromptComposer`) — prompt textarea, attach menu, model picker,
  templates, live input stats + content-type chip, file chips.
- **Editor** (`Workspace`) — chat panel (`ChatPanel` + `RefineBar`), Preview /
  Code segmented toggle; mobile 3-way Chat/Preview/Code tab.
- **Overview / Business panels** — knowledge base, plan, activity, docs.
- **Version history** — restore prior versions.
- **Settings**.

## 4. Component hierarchy (key)

```
PromptComposer ─ AttachmentButton ─ AttachmentMenu ─ AttachmentItem
              └ FileChips ─ StatusBadge
              └ UnderstandingDebug (dev only)
Workspace ─ ChatPanel ─ RefineBar
          └ PreviewFrame (sandboxed iframe)
          └ CodeEditor (CodeMirror)
business/ ─ OverviewPanel · DocsPanel
projects/ ─ ProjectEditor · VersionHistory · ThumbnailCapture
```

## 5. Design system guidelines

Tailwind v4 with CSS custom-property tokens in `app/globals.css`
(`--background`, `--surface`, `--accent`, …) exposed via `@theme inline`. App
shell is a dark glass aesthetic. `cn()` (clsx + tailwind-merge) for conditional
classes. **Generated sites** follow their own per-vertical art direction from the
IVIS planner, independent of the app shell. No emojis as icons (SVG/lucide);
designed hover/focus/active states; intentional hierarchy over uniform cards.

## 6. State management

- **Client state:** Zustand — `store/generator-store.ts` (prompt/code/status/
  messages), `store/attachment-store.ts` (files + understanding).
- **Server state:** Supabase reads via `lib/projects/service.ts`, `lib/db/*`.
- **URL state:** workspace tab (`?tab=`), project id in the path.
- Do not duplicate server state into client stores; derive instead.

## 7. Loading states

Composer shows a busy label during generation; buttons disable + show a spinner
during async work; attachment chips show `Reading… / Understanding… / Running
OCR…`; thumbnails capture in a hidden iframe.

## 8. Empty states

Workspace tabs render guidance when empty; Templates tab is always populated
(static catalog) so the dashboard is never blank; attachment area invites
documents when none are attached.

## 9. Error states

Inline, specific, non-generic: composer surfaces provider/validation errors;
attachment chips show differentiated parse errors (corrupted / password /
scanned / unsupported / too-large); agent steps show per-step failure without
killing the run. `aria-live` regions announce status changes.

## 10. Responsive behavior

Mobile-first (most users arrive on a phone). Breakpoints exercised: 320 / 375 /
768 / 1024 / 1440. Editor collapses to a single-panel 3-way tab on mobile; no
horizontal overflow; touch targets ≥ 44px.

## 11. Accessibility requirements

WCAG 2 AA. Semantic landmarks; visible keyboard focus; menus with full keyboard
nav + focus trap + ARIA roles (`role="menu"`/`menuitem`, `aria-haspopup`/
`expanded`); labelled icon-only buttons; color contrast ≥ 4.5:1; `prefers-
reduced-motion` honored (reveals/parallax become inert); content visible without
JS (`@media (scripting: enabled)` gates reveal-hiding).

## 12. Navigation flows

```
/login ──(session)──► /workspace ──► /new ──(generate)──► /project/[id]
   ▲                      │  tabs: projects / recently viewed / templates
   └──── sign out ◄───────┘
/project/[id]: Chat ⇄ Preview ⇄ Code; Overview/Business tabs when profile exists
```
