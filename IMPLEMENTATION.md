# Rexcharge — Frontend ↔ Supabase Implementation Plan

Handoff doc for Sonnet. Goal: replace mock data with a live Supabase backend, make every button do something, and ship a working "create new project" flow that persists a JSON blob, a measurement image, a GLB model, and lat/lon.

Repo layout assumed:
- `frontend/` — Vite + React + TS + Tailwind + react-router. Supabase client already at [frontend/src/lib/supabase.ts](frontend/src/lib/supabase.ts).
- `backend/` — FastAPI + 3D pipeline. Out of scope for this pass; we talk to Supabase directly from the browser.

---

## 0. Prerequisites

- A Supabase project exists. Project URL + anon key live in `frontend/.env.local`:
  ```
  VITE_SUPABASE_URL=...
  VITE_SUPABASE_ANON_KEY=...
  ```
- `@supabase/supabase-js` is already in `frontend/package.json`.
- For now: single-user dev. Skip auth UI; seed an `auth.users` row manually and set `VITE_DEV_OWNER_ID` to that uuid so RLS policies hold. (Auth screen is a later pass.)

---

## 1. Database schema

Run as a migration in `supabase/migrations/0001_init.sql` (create folder if missing) and apply via the Supabase SQL editor.

```sql
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
  tariff          tariff_kind   not null default 'domestic',
  intake_mode     intake_mode   not null default 'demo',
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
```

---

## 2. Storage buckets

Create three **private** buckets in Supabase Storage:

| Bucket            | Holds                          |
|-------------------|--------------------------------|
| `project-models`  | `.glb` 3D models               |
| `project-images`  | measurement / thumbnail images |
| `project-data`    | `data.json` analysis blobs     |

Path convention: `{owner_id}/{project_id}/{filename}`.

Storage policy (apply to each bucket — replace `BUCKET`):

```sql
create policy "owner rw BUCKET" on storage.objects
  for all
  using  (bucket_id = 'BUCKET' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'BUCKET' and auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 3. Generate types

```
npx supabase gen types typescript --project-id <PROJECT_ID> \
  > frontend/src/lib/db-types.ts
```

Re-run after every schema change.

---

## 4. Frontend files to create / change

### NEW — [frontend/src/lib/projects-api.ts](frontend/src/lib/projects-api.ts)

API surface:
```ts
listProjects(): Promise<Project[]>
getProject(id: string): Promise<Project | null>
createProject(input: NewProjectInput): Promise<Project>
updateProject(id: string, patch: Partial<Project>): Promise<Project>
uploadAsset(projectId, file, kind): Promise<{ path: string; bucket: string }>
getSignedUrl(bucket, path, expiresIn?): Promise<string>
listEvents(projectId): Promise<ProjectEvent[]>
logEvent(projectId, kind, message?, meta?): Promise<void>
```
- All functions wrap `supabase.from('projects')` / `supabase.storage`.
- Bucket selection inside `uploadAsset` is by `kind`:
  - `glb` → `project-models`
  - `measurement` → `project-images`
  - `data_json` → `project-data`
- `Project` type maps DB snake_case → camelCase (keep the existing shape from [frontend/src/data/mock-projects.ts](frontend/src/data/mock-projects.ts) so nothing else has to change).

### NEW — [frontend/src/store/projects-store.ts](frontend/src/store/projects-store.ts)

Use **TanStack Query** (`@tanstack/react-query`) — add to deps. Export hooks:
```ts
useProjects()         // list
useProject(id)        // single
usePortfolioStats()   // derives stats client-side from useProjects
useCreateProject()    // mutation
useUploadAsset()      // mutation
```
Wrap `<App />` in `<QueryClientProvider>` in [frontend/src/main.tsx](frontend/src/main.tsx).

### CHANGE — [frontend/src/data/mock-projects.ts](frontend/src/data/mock-projects.ts)

Keep the `Project` / enum types and `portfolioStats` *signature*. Delete the hard-coded array; move `portfolioStats` logic into the store hook. Mock data moves to `supabase/seed.sql` (see §6).

### CHANGE — [frontend/src/pages/Dashboard.tsx](frontend/src/pages/Dashboard.tsx)

Replace direct imports with hooks:
```ts
const { data: projects = [], isLoading } = useProjects();
const stats = usePortfolioStats();
```
Add a skeleton while `isLoading`, an empty-state when `projects.length === 0`.

### REWRITE — [frontend/src/pages/NewProject.stub.tsx](frontend/src/pages/NewProject.stub.tsx) → `NewProject.tsx`

4-step wizard, all inside one route (use local state, no nested routes needed):

1. **Site setup** — name, address, lat, lon (numeric inputs; "use map" optional later), tariff.
2. **Intake mode** — pick `drone_terra | drone_video | photos | demo`.
3. **Upload** — three drop zones:
   - GLB model (`.glb`) → required unless `demo`
   - Measurement image (`.png/.jpg`) → optional
   - Data JSON (`.json`) → optional, can be auto-generated later
   Show per-file progress.
4. **Review & create** — summary card + "Create project" button.

Submit handler:
```ts
const project = await createProject({ name, address, lat, lon, tariff, intake_mode, status: 'draft' });
for (const f of files) {
  const { path, bucket } = await uploadAsset(project.id, f.file, f.kind);
  await updateProject(project.id, { [pathField(f.kind)]: path });
}
await logEvent(project.id, 'created');
navigate(`/projects/${project.id}/analysis`);
```

### CHANGE — [frontend/src/components/data/ProjectCard.tsx](frontend/src/components/data/ProjectCard.tsx)

Wrap card root in `<Link to={\`/projects/${project.id}/analysis\`}>`. Remove any dead onClicks.

### CHANGE — [frontend/src/pages/Analysis.tsx](frontend/src/pages/Analysis.tsx)

```ts
const { id } = useParams();
const { data: project } = useProject(id!);
const glbUrl = useSignedUrl('project-models', project?.modelGlbPath);
```
Pass `glbUrl` into `Workspace3DSection`.

### AUDIT — every other page + chrome

- [frontend/src/pages/Captures.stub.tsx](frontend/src/pages/Captures.stub.tsx)
- [frontend/src/pages/Reports.stub.tsx](frontend/src/pages/Reports.stub.tsx)
- [frontend/src/pages/Tariffs.stub.tsx](frontend/src/pages/Tariffs.stub.tsx)
- [frontend/src/pages/Portfolio.stub.tsx](frontend/src/pages/Portfolio.stub.tsx)
- [frontend/src/pages/Settings.stub.tsx](frontend/src/pages/Settings.stub.tsx)
- [frontend/src/pages/Help.stub.tsx](frontend/src/pages/Help.stub.tsx)
- [frontend/src/components/chrome/TopBar.tsx](frontend/src/components/chrome/TopBar.tsx)
- [frontend/src/components/chrome/FeatureRail.tsx](frontend/src/components/chrome/FeatureRail.tsx)

Rule: every `<button>` either has a real `onClick` or fires `toast("Coming soon")` (use `sonner` or any small toast lib — add to deps if missing). No dead clicks.

---

## 5. Create-project sequence (the deliverable)

```
NewProject wizard submit
 ├─ projects.insert { name, address, lat, lon, tariff, intake_mode, status:'draft' }
 ├─ for each file:
 │    storage.upload(bucket, `${owner_id}/${project_id}/${filename}`, file)
 │    project_assets.insert { project_id, kind, bucket, path, size_bytes, mime }
 │    projects.update { <kind>_path: path }
 ├─ project_events.insert { kind:'created' }
 └─ navigate(`/projects/${id}/analysis`)
```

Reading later:
- GLB → `storage.from('project-models').createSignedUrl(path, 3600)` → `<model-viewer src=...>` / three.js loader.
- data.json → `storage.from('project-data').download(path)` → `await blob.text()` → `JSON.parse`.

---

## 6. Seed data

`supabase/seed.sql` — port the 6 rows from [frontend/src/data/mock-projects.ts](frontend/src/data/mock-projects.ts) into `projects` (set `owner_id` to the dev user uuid). No storage files for seeded rows; their `*_path` columns stay null and the dashboard renders them fine.

---

## 7. Acceptance checklist

- [ ] `npm run dev` boots with no console errors.
- [ ] Dashboard shows seeded projects from Supabase, not mock array.
- [ ] Clicking any project card → Analysis page for that project.
- [ ] "New project" wizard creates a row, uploads files, navigates to analysis.
- [ ] Created project's GLB renders in the 3D viewer.
- [ ] Every nav button + every page button is clickable (real action or toast).
- [ ] Refreshing the page preserves state (data is in DB, not local).
- [ ] RLS verified: a second dev user cannot see the first user's projects.

---

## 8. Suggested commit order

1. `chore(db): supabase schema + storage buckets + seed`
2. `feat(api): projects-api + react-query store`
3. `feat(dashboard): live data, loading + empty states`
4. `feat(new-project): 4-step wizard with uploads`
5. `feat(analysis): load project + signed GLB url`
6. `chore(ui): wire remaining buttons or toast`
