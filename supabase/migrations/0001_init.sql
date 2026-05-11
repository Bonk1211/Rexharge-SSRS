create type project_status as enum ('draft','processing','ready','failed');
create type intake_mode    as enum ('drone_terra','drone_video','photos','demo');
create type tariff_kind    as enum ('domestic','non_domestic_lv');

create table projects (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  address         text,
  lat             double precision not null,
  lon             double precision not null,
  tariff          tariff_kind    not null default 'domestic',
  intake_mode     intake_mode    not null default 'demo',
  status          project_status not null default 'draft',
  thumbnail_hue   int default 120,

  kwp               numeric,
  annual_kwh        numeric,
  annual_savings_rm numeric,
  payback_years     numeric,
  monthly_kwh       numeric[],
  panels            int,
  planes            int,
  obstacles         int,
  capacity_factor   numeric,

  data_json_path       text,   -- bucket: project-data
  measurement_img_path text,   -- bucket: project-images
  model_glb_path       text,   -- bucket: project-models

  captured_at  timestamptz,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
create index on projects(owner_id, created_at desc);

create table project_assets (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references projects(id) on delete cascade,
  kind        text check (kind in
                ('source_video','source_photo','obj','glb',
                 'measurement','report_pdf','data_json')),
  bucket      text not null,
  path        text not null,
  size_bytes  bigint,
  mime        text,
  meta        jsonb default '{}',
  created_at  timestamptz default now()
);
create index on project_assets(project_id);

create table project_events (
  id          bigserial primary key,
  project_id  uuid references projects(id) on delete cascade,
  kind        text,
  message     text,
  meta        jsonb default '{}',
  created_at  timestamptz default now()
);

create or replace function touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end $$ language plpgsql;
create trigger projects_touch before update on projects
  for each row execute function touch_updated_at();

alter table projects       enable row level security;
alter table project_assets enable row level security;
alter table project_events enable row level security;

create policy "own rows" on projects
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "own assets" on project_assets
  for all using (exists (
    select 1 from projects p where p.id = project_id and p.owner_id = auth.uid()));
create policy "own events" on project_events
  for all using (exists (
    select 1 from projects p where p.id = project_id and p.owner_id = auth.uid()));
