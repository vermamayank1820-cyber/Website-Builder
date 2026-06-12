-- Evolution system: recurring design weaknesses recorded from self-review
-- feedback and injected into future generations so solved failures are
-- never repeated. Run after 0003_website_intel.sql.

create table if not exists public.design_lessons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  category text not null default 'design',
  lesson text not null,
  created_at timestamptz not null default now()
);

create index if not exists design_lessons_user_idx
  on public.design_lessons (user_id, created_at desc);

alter table public.design_lessons enable row level security;

create policy "design_lessons: owner full access"
  on public.design_lessons for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Keep the memory bounded: newest 60 lessons per user.
create or replace function public.cap_design_lessons()
returns trigger
language plpgsql
as $$
begin
  delete from public.design_lessons
  where user_id = new.user_id
    and id not in (
      select id from public.design_lessons
      where user_id = new.user_id
      order by created_at desc
      limit 60
    );
  return new;
end;
$$;

drop trigger if exists design_lessons_cap on public.design_lessons;
create trigger design_lessons_cap
  after insert on public.design_lessons
  for each row execute function public.cap_design_lessons();
