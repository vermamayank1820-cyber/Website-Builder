# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

PromptSite: prompt → a single production-ready React landing page, generated via one OpenAI
call (`gpt-4.1-mini` via the Responses API), with a live sandboxed preview and an editable
code view. The app is intentionally narrow in scope: prompt → landing page, with single-shot
edits. No auth, database, multi-page sites, or agent loops — don't add them.

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

## Architecture

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

**Images**: the system prompts steer the model toward CSS-based visuals (gradients, blobs,
inline SVG) by default, and `https://picsum.photos/seed/{seed}/{w}/{h}` as the fallback for
real photos. Never reintroduce `images.unsplash.com/photo-...`-style URLs in the prompts —
the model invents non-existent photo IDs and they 404.

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
