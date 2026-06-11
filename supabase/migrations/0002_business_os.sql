-- PromptSite Business OS: shared knowledge base, agent runs, documents.
-- Run after 0001_init.sql.

-- ──────────────────────────────────────────────
-- Business profiles (the shared knowledge base, one per project)
-- ──────────────────────────────────────────────
create table if not exists public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects (id) on delete cascade,
  source_url text,
  source_type text,
  knowledge jsonb not null default '{}'::jsonb,
  plan jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_profiles enable row level security;

create policy "business_profiles: owner full access"
  on public.business_profiles for all
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );

drop trigger if exists business_profiles_touch_updated_at on public.business_profiles;
create trigger business_profiles_touch_updated_at
  before update on public.business_profiles
  for each row execute function public.touch_updated_at();

-- ──────────────────────────────────────────────
-- Agent runs (execution + activity log)
-- ──────────────────────────────────────────────
create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  agent text not null check (agent in ('analyze', 'research', 'growth', 'design', 'website')),
  status text not null default 'running' check (status in ('running', 'done', 'error')),
  title text not null,
  summary text,
  error text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists agent_runs_project_idx
  on public.agent_runs (project_id, created_at desc);

alter table public.agent_runs enable row level security;

create policy "agent_runs: owner full access"
  on public.agent_runs for all
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );

-- ──────────────────────────────────────────────
-- Project documents (research reports, growth plans, design briefs)
-- ──────────────────────────────────────────────
create table if not exists public.project_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  kind text not null check (kind in ('research', 'growth', 'design')),
  title text not null,
  content_md text not null,
  created_at timestamptz not null default now()
);

create index if not exists project_documents_project_idx
  on public.project_documents (project_id, kind, created_at desc);

alter table public.project_documents enable row level security;

create policy "project_documents: owner full access"
  on public.project_documents for all
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );
