# 000 — Platform Vision & System Directive

> The authoritative charter. Highest-priority spec. Defines *what PromptSite is*
> and *how it must be built*. The PRD (001) details the product; this document
> governs intent, principles, and the quality bar above it. When anything below
> conflicts with a lower-numbered concern, **this document and the spec priority
> order win.** *(Repo/package name is `promptsite`; "PromptSide" in inputs is the
> same product.)*

## Mission

Help individuals and businesses go from **idea → artifact**. Working with
PromptSite should feel like hiring an **elite multidisciplinary product team**,
not using a template generator. Every output must demonstrate: deep
understanding · product thinking · design thinking · engineering discipline ·
business-context awareness · high craftsmanship · reliability and polish.

## What PromptSite is

A **universal AI generation platform / AI operating system**: it transforms
prompts, links, files, and multimodal context into production-grade digital
outputs across many **first-class surfaces** — Website, Slides, Image, Mobile
Apps, Desktop/PWA, Games, Design, Video, Audio, Scheduled Task, Wide Research,
Visualisation, More/Other. These are not placeholders; **every architecture
decision must consider extensibility toward them** (see 001-PRD §3, §6, 003-TAD
§12). Current shipped surface: **Website (v1)**.

## Product principles

1. **Quality over speed.** Optimize for genuinely useful, polished,
   production-ready output. Reject generic outputs, placeholder experiences,
   obvious AI artifacts, and boilerplate.
2. **Understand before building.** Always: understand context → intent →
   business goals → users → constraints → plan → build → critique → improve.
   Never jump straight to implementation.
3. **Think like a team of experts.** Consider Product Strategist, UX Architect,
   UI Designer, Frontend & Backend Architect, Systems Designer, Security &
   Performance Engineer, QA, and Visual Critic perspectives before finalizing.

## Engineering & architecture principles

Simplicity over cleverness · reliability/predictability · extensibility for
future surfaces · maintainability · explicit type-safe contracts · security as a
product requirement · performance without unnecessary complexity. Systems strive
for: clear boundaries · modular components · reusable abstractions · low coupling
/ high cohesion · explicit interfaces · idempotent operations · failure isolation
· observability.

## Quality standards (user-facing)

Professional · intentional · trustworthy · fast · premium · accessible ·
well-crafted. Reject generic templates, inconsistent experiences, weak hierarchy,
poor typography, broken/dead states, and placeholder content. The user must
quickly grasp **what this does, why it matters, what to do next.** Accessibility
(semantic structure, keyboard nav, focus states, contrast, screen-reader support,
responsive) is **not optional**. Security: treat all inputs (user input, files,
URLs, generated content) as untrusted; protect data/secrets/sessions/permissions;
least privilege. Performance: fast load, efficient render, small bundles,
graceful degradation, minimal dependencies.

## How we work — the quality loop

```
Understand → Plan → Implement → Run → Review → Critique → Improve → Repeat
```
Never stop at the first implementation. Iterate until the standards are met.

### Self-review (before "done")
Does it solve the real user problem? Is it understandable, maintainable, secure,
accessible, performant, production-ready? **Would an experienced team be
comfortable shipping this?** If not — keep improving.

## Documentation-driven development

The spec system is authoritative. **Read all specs before implementing.**
Implementation must be traceable to specs. When implementation and specs
disagree: (1) explain the discrepancy, (2) update the documentation, (3) ask for
clarification if needed, (4) then implement. **Never silently diverge.**

### Spec priority (read in this order)

```
000 Platform Vision & System Directive   (this file)
001 Product PRD
002 Functional Requirements
003 Technical Architecture
    database/001 Database Foundation
004 Security & Access
005 Frontend Specification
006 Feature Tickets
```

Also read before implementing: `.claude/rules/` (standards) and
`.claude/skills/` (e.g. the canonical PDF/OCR pipeline). Treat the **repository
as source of truth** — never assume frameworks, languages, databases, or
infrastructure without reading the code first.

## Definition of Done

Work is complete only when **all** hold: requirements satisfied · documentation
synchronized · architecture coherent · security met · accessibility met ·
performance acceptable · no known regressions · code maintainable · UX feels
intentional · result is production-ready. Anything significantly below this is
**unfinished**.

## Guiding philosophy

PromptSite should feel less like an AI generator and more like an **elite
multidisciplinary product studio** that understands intent, reasons deeply, and
produces high-quality outcomes users trust and return to.
