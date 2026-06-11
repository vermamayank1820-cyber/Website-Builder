-- PromptSite — initial schema.
-- Run via the Supabase SQL editor or `supabase db push`.

-- ──────────────────────────────────────────────
-- Profiles (mirror of auth.users for app data)
-- ──────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: owner can read"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: owner can update"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever a user signs up (email or OAuth).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ──────────────────────────────────────────────
-- Projects
-- ──────────────────────────────────────────────
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Untitled project',
  category text not null default 'Website',
  prompt text not null default '',
  thumbnail_url text,
  status text not null default 'ready' check (status in ('ready', 'draft', 'error')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_user_updated_idx
  on public.projects (user_id, updated_at desc);

alter table public.projects enable row level security;

create policy "projects: owner full access"
  on public.projects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Keep updated_at fresh on every write.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at
  before update on public.projects
  for each row execute function public.touch_updated_at();

-- ──────────────────────────────────────────────
-- Project versions (one row per generation/edit)
-- ──────────────────────────────────────────────
create table if not exists public.project_versions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  version_number integer not null,
  generated_code text not null,
  generation_summary text,
  summary_data jsonb,
  created_at timestamptz not null default now(),
  unique (project_id, version_number)
);

create index if not exists project_versions_project_idx
  on public.project_versions (project_id, version_number desc);

alter table public.project_versions enable row level security;

create policy "project_versions: owner full access"
  on public.project_versions for all
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
-- Recently viewed (capped at 30 per user)
-- ──────────────────────────────────────────────
create table if not exists public.recently_viewed (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  viewed_at timestamptz not null default now(),
  unique (user_id, project_id)
);

create index if not exists recently_viewed_user_idx
  on public.recently_viewed (user_id, viewed_at desc);

alter table public.recently_viewed enable row level security;

create policy "recently_viewed: owner full access"
  on public.recently_viewed for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.cap_recently_viewed()
returns trigger
language plpgsql
as $$
begin
  delete from public.recently_viewed
  where user_id = new.user_id
    and id not in (
      select id from public.recently_viewed
      where user_id = new.user_id
      order by viewed_at desc
      limit 30
    );
  return new;
end;
$$;

drop trigger if exists recently_viewed_cap on public.recently_viewed;
create trigger recently_viewed_cap
  after insert on public.recently_viewed
  for each row execute function public.cap_recently_viewed();

-- ──────────────────────────────────────────────
-- Thumbnails storage bucket (public read, owner write)
-- Object paths are namespaced as {user_id}/{project_id}.jpg
-- ──────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('thumbnails', 'thumbnails', true)
on conflict (id) do nothing;

create policy "thumbnails: public read"
  on storage.objects for select
  using (bucket_id = 'thumbnails');

create policy "thumbnails: owner can upload"
  on storage.objects for insert
  with check (
    bucket_id = 'thumbnails'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "thumbnails: owner can update"
  on storage.objects for update
  using (
    bucket_id = 'thumbnails'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "thumbnails: owner can delete"
  on storage.objects for delete
  using (
    bucket_id = 'thumbnails'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
