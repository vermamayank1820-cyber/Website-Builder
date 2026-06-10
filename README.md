# PromptSite

Prompt → beautiful, production-ready landing page. Powered by a single
OpenAI model call (`gpt-4.1-mini` via the Responses API), with live preview
and an editable code view.

## Getting Started

1. Copy `.env.example` to `.env.local` and add your OpenAI API key:

   ```bash
   cp .env.example .env.local
   ```

   Get a key at https://platform.openai.com/api-keys — the default model
   is `gpt-4.1-mini`. Override it with `OPENAI_MODEL` if needed.

2. Install dependencies and run the dev server:

   ```bash
   npm install
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000), describe a website,
   and hit Generate.

## How it works

- `POST /api/generate` — sends the prompt to the configured AI provider and
  returns a single `function Page() { ... }` React component.
- `POST /api/edit` — sends the current code plus a refinement instruction
  and returns the updated component.
- The component is rendered live in a sandboxed iframe using React, Babel,
  and Tailwind CSS loaded from CDNs (`features/preview`).
- The code is editable via a CodeMirror-based editor (`features/editor`).

## Architecture

- `lib/providers` — provider abstraction around the AI model. Swapping
  models (DeepSeek-Coder, a local Ollama model, etc.) only requires adding a
  case in `lib/providers/index.ts`.
- `lib/ai` — generation/edit orchestration and request validation.
- `lib/parser` — cleans raw model output into executable component code.
- `lib/prompts` — system prompts that constrain the model's output format.
- `store` — Zustand store holding the current prompt, code, and status.
- `features/generator`, `features/editor`, `features/preview` — UI for the
  prompt flow, code editor, and live preview.

## Scope

This project intentionally does one thing: prompt → landing page, with
single-shot edits. No auth, database, multi-page sites, or agents.
