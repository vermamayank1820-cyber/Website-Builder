-- Website Intelligence Engine: crawl graph, site critique, quality reviews.
-- Run after 0002_business_os.sql.

alter table public.business_profiles
  add column if not exists website_graph jsonb,
  add column if not exists site_critique jsonb;

-- Self-critique scores for the shipped version of each generation.
alter table public.project_versions
  add column if not exists quality_review jsonb;
