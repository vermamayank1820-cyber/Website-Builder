# Canonical PDF / Document Pipeline (PromptSite runtime)

This file is the project-specific contract that complements the generic PDF skill
(`SKILL.md`, `reference.md`, `forms.md`, `scripts/`). Any work on document uploads,
parsing, OCR, or extraction errors **must** keep this in sync with `lib/documents/`.

## Single pipeline

All formats go through one entry point — never add a second parser path.

```
File → /api/parse (lib/documents/parse.ts → DocumentParser.parseDocument)
  ├── pdf  → lib/documents/pdf.ts   (pdf.js text layer, per-page fallback)
  ├── docx → lib/documents/docx.ts  (mammoth: text + heading outline)
  ├── txt  → lib/documents/text.ts  (UTF-8)
  └── md   → lib/documents/text.ts  (raw + headings/links/codeBlocks)
```

## State machine

```
uploading → uploaded → reading → processing → ready
                                  └── (scanned PDF) → ocr-processing → ready
                                  └── (any failure) → error
```

`AttachmentStatus` (`lib/attachments/types.ts`) and the store
(`store/attachment-store.ts`) own these transitions; the UI reflects them live.

## OCR fallback (scanned PDFs)

```
PDF → extract text layer
  → if pageCount > 0 && wordCount(text) < 10  → SCANNED
        → status: ocr-processing  ("Scanned PDF detected. Running OCR…")
        → POST /api/ocr → lib/documents/ocr.ts
              render pages (pdf-to-img + @napi-rs/canvas) → Tesseract (tesseract.js)
        → text recovered → ready
        → no text         → error "We couldn’t extract text from this scanned PDF."
  → else → ready
```

- `/api/parse` returns code `scanned` for a scanned PDF; the **client** then calls
  `/api/ocr` so the `ocr-processing` state is visible while the slow work runs.
- OCR is capped at `MAX_OCR_PAGES` (8) — resumes/profiles fit comfortably.

## Differentiated errors — "Couldn't read this file" is BANNED

Every failure carries a `ParseError(code)` (`lib/documents/types.ts`):

| code | message |
|------|---------|
| `corrupted` | This PDF appears to be corrupted. |
| `password` | This PDF is password protected. |
| `scanned` (running) | Scanned PDF detected. Running OCR… *(live status, not an error)* |
| `scanned` (failed) | We couldn’t extract text from this scanned PDF. |
| `unsupported` | This format isn’t supported — use PDF, DOCX, TXT or Markdown. |
| `empty` | We couldn’t find any readable text in this document. |
| `too_large` | This file exceeds the maximum size. |

## Dependencies (version-locked)

`pdfjs-dist` must stay aligned with `pdf-to-img`'s pdf.js (currently **5.6.205**) — a
version mismatch produces *"API version does not match Worker version"* and OCR fails to
render. Externalised in `next.config.ts` `serverExternalPackages`:
`pdfjs-dist`, `mammoth`, `pdf-to-img`, `tesseract.js`, `@napi-rs/canvas`.

## Debug log

```
[DocumentParser] type=pdf size=35KB pages=1 words=615 duration=877ms status=success
[DocumentParser] type=pdf ocr=true pages=1 words=12 duration=27000ms status=success
[DocumentParser] type=pdf size=2KB duration=2ms status=error code=corrupted
```

## After parsing

Text flows to the understanding layer (`lib/knowledge/`) → KnowledgeGraph → intent →
planner. Generation consumes structured knowledge, not raw document text.
