# PromptSite — Database FRD (v1)

> Canonical functional requirements for the persistence layer. Source of truth
> for all future database work. Stack is fixed: **Next.js 16 + TypeScript +
> Supabase/Postgres**. No Flask, SQLite, ORM, or second backend.

## 1. Overview

This is the foundational persistence layer. Future features depend on it: auth,
user profiles, prompt management, generation tracking, website publishing,
mobile/slide/game/design/media generation, usage analytics & billing, and
scheduled tasks. It must be production-ready, secure, and idempotent to apply.

## 2. Canonical architecture

- **Identity = Supabase Auth (`auth.users`)** + the `public.profiles` mirror
  (`id uuid references auth.users`, `email`, `full_name`, `created_at`).
  Supabase Auth owns credentials — **there is no custom `users`/`password_hash`
  table** (replicating it would be a redundant second auth stack and a security
  regression). Reference users via `auth.users(id)` (uuid).
- **Schema** lives in `supabase/migrations/*.sql`, applied via the Supabase SQL
  editor or `supabase db push`. Migrations are **idempotent**:
  `create … if not exists`; `drop policy if exists` then `create policy`.
- **Conventions:** PK `uuid default gen_random_uuid()`; `timestamptz default
  now()`; **RLS enabled on every table**, owner-scoped via `auth.uid()`;
  `CHECK` constraints for enums; `jsonb` for metadata; date columns use the
  native `date` type.

## 3. Logical model

### users (→ `auth.users` + `public.profiles`)

| Logical field | Mapped to |
| --- | --- |
| id | `auth.users.id` (uuid) |
| name | `profiles.full_name` |
| email (unique) | `auth.users.email` / `profiles.email` |
| password_hash | owned by Supabase Auth — **not stored in app schema** |
| created_at | `profiles.created_at` |

### generations (`public.generations`, migration `0005`)

A cross-category ledger of every generation a user creates. The `category`
values **are the platform's generation surfaces** (001-PRD §3) — Website today,
the rest as they ship — so this one table tracks all surfaces uniformly.

| Column | Type | Constraints |
| --- | --- | --- |
| id | uuid | PK, `default gen_random_uuid()` |
| user_id | uuid | `not null references auth.users(id) on delete cascade` |
| token_cost | numeric(12,4) | not null |
| category | text | not null, `CHECK` ∈ allowed categories (§6) |
| prompt | text | nullable |
| description | text | nullable |
| status | text | not null, `default 'completed'`, `CHECK` ∈ allowed statuses (§5) |
| output_url | text | nullable |
| metadata | jsonb | nullable |
| date | date | not null, `default current_date` |
| created_at | timestamptz | not null, `default now()` |

**Indexes:** `idx_generations_user (user_id)`, `idx_generations_date (date)`,
and a composite `generations_user_date_idx (user_id, date desc)`.

**RLS:** `"generations: owner full access"` — `using/with check (auth.uid() =
user_id)`, matching `public.projects`.

## 4. Relationships

```
auth.users (1) ─────< generations (many)
```

A user may have many generations; every generation belongs to exactly one user;
deleting a user cascade-deletes their generations.

## 5. Allowed status values

`pending` · `running` · `completed` · `failed` — default **`completed`**.
Enforced by a DB `CHECK` and mirrored in `lib/db/generations.ts`
(`GENERATION_STATUSES`).

## 6. Allowed generation categories

`Website` · `Mobile Apps` · `Games` · `Slides` · `Design` · `Desktop Apps/PWA` ·
`Video Generation` · `Image Generation` · `Scheduled Task` · `Wide Research` ·
`Visualisation` · `Audio Generation` · `More/Other`. Enforced by a DB `CHECK`
and mirrored in `lib/db/generations.ts` (`GENERATION_CATEGORIES`).

## 7. Data access (the get/init/seed equivalents)

| Spec concept | Implementation |
| --- | --- |
| `get_db()` | `lib/supabase/client.ts` (browser, RLS-scoped) / `lib/supabase/server.ts` (server). Privileged tasks: `lib/supabase/admin.ts` (service role — server-only, bypasses RLS). |
| `init_db()` | `supabase/migrations/0005_generations.sql` (idempotent). |
| `seed_db()` | `scripts/seed-promptside.ts` → `npm run db:seed`. Idempotent; needs `SUPABASE_SERVICE_ROLE_KEY`. |

All reads/writes go through `@supabase/supabase-js`, which parameterizes every
query — **never build SQL by string interpolation.**

## 8. Seed requirements

- Idempotent: reuse the existing demo user; skip if generations already exist.
- Demo user: `Demo User` / `demo@promptside.com` / `demo123`, created via the
  Auth admin API (Supabase hashes the password — never plaintext).
- 8 sample generations spread across the current month, covering multiple
  categories, realistic token costs, example prompts/descriptions, valid
  statuses.

## 9. Definition of done

- [ ] `0005_generations.sql` applied; `public.generations` exists with the
  schema, CHECKs, FK cascade, and indexes above.
- [ ] RLS enforced (owner-scoped) on `generations`.
- [ ] Demo Auth user exists; password stored only as a Supabase hash.
- [ ] Eight sample generations exist; re-running the seed never duplicates them.
- [ ] All access parameterized; idempotent migration + seed.
- [ ] Schema ready for future PromptSite generation features.

## 10. Apply / run

1. Apply migration `supabase/migrations/0005_generations.sql` (Supabase SQL
   editor or `supabase db push`).
2. Set `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`, then `npm run db:seed`.
