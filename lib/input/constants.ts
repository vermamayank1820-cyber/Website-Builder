/**
 * Input size limits for PromptSite. The old hard cap was 2,000 characters,
 * which rejected real-world inputs (resumes, PRDs, brand guidelines, combined
 * documents). This single tunable constant governs every input boundary.
 *
 * 200,000 chars (~40+ pages / ~50k tokens) comfortably accepts every
 * documented case — 10-page resume, 20-page company profile, PRD, multiple
 * competitor analyses, combined inputs > 50k — while still guarding the API
 * boundary against pathological multi-megabyte payloads. The model-side cost
 * of large inputs is handled downstream by the preprocessing/chunking
 * pipeline, not by rejecting the user here.
 */
export const MAX_INPUT_CHARS = 200_000

/** Above this, an input is chunked before analysis (preprocessing pipeline). */
export const CHUNK_THRESHOLD_CHARS = 20_000

/** Minimum to be a meaningful instruction. */
export const MIN_INPUT_CHARS = 3
