-- PromptSite — generations ledger (migration 0005).
-- A cross-category record of every generation a user creates: websites,
-- mobile apps, games, slides, design, video/image/audio, scheduled tasks,
-- research, visualisations, and future surfaces.
--
-- Identity is Supabase Auth (auth.users) + the public.profiles mirror — there
-- is NO separate users/password table; Supabase Auth owns credentials.
-- generations cascade-delete with their owner.
--
-- Run via the Supabase SQL editor or `supabase db push`. Idempotent.

create table if not exists public.generations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  token_cost  numeric(12, 4) not null,
  category    text not null check (category in (
                'Website',
                'Mobile Apps',
                'Games',
                'Slides',
                'Design',
                'Desktop Apps/PWA',
                'Video Generation',
                'Image Generation',
                'Scheduled Task',
                'Wide Research',
                'Visualisation',
                'Audio Generation',
                'More/Other'
              )),
  prompt      text,
  description text,
  status      text not null default 'completed'
              check (status in ('pending', 'running', 'completed', 'failed')),
  output_url  text,
  metadata    jsonb,
  date        date not null default current_date,
  created_at  timestamptz not null default now()
);

-- Indexes (mirror the spec's idx_generations_user / idx_generations_date,
-- plus a composite for the common "my generations, newest first" query).
create index if not exists idx_generations_user
  on public.generations (user_id);

create index if not exists idx_generations_date
  on public.generations (date);

create index if not exists generations_user_date_idx
  on public.generations (user_id, date desc);

-- Row level security: an owner has full access to their own generations,
-- matching the public.projects policy. (Re-runnable: drop-then-create.)
alter table public.generations enable row level security;

drop policy if exists "generations: owner full access" on public.generations;
create policy "generations: owner full access"
  on public.generations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
