# Rexcharge — Frontend ↔ Supabase Integration Handoff

This doc summarises the work completed in the session that wired the (previously mock-only) frontend to a live Supabase backend. The original implementation plan lives in [IMPLEMENTATION.md](IMPLEMENTATION.md); this is the as-built record plus the gotchas you'll want to know before touching the code.

Branch state at handoff: `main`. All changes already merged.

---

## 1. What now exists end-to-end

- A live Postgres schema in Supabase (project ref `mpjgpahsxekjeqixkfqd`) holding `projects`, `project_assets`, `project_events` plus three enums and an `updated_at` trigger.
- Three private Storage buckets (`project-models`, `project-images`, `project-data`) under `{owner_id}/{project_id}/{filename}` paths.
- Row-Level Security on every table; matching storage policies on every bucket.
- A typed API layer in the frontend that wraps `supabase-js` (CRUD + uploads + signed URLs).
- TanStack Query hooks for caching / revalidation.
- The dashboard, project rail, top bar, analysis page, report page, portfolio, and reports list now all read live data — no mock array left.
- A 4-step "New project" wizard that inserts the row, uploads files, patches storage paths back into the row, logs an event, and routes to the analysis page.
- The analysis page resolves a 1-hour signed URL for the project's GLB and feeds it to the 3D viewer; falls back to the procedural demo scene when no model is attached.
- Every visible button has either a real handler or a `toast("Coming soon")` — no dead clicks.

---

## 2. Database

### Tables

All in `public` schema. Run from `supabase/migrations/0001_init.sql`.

**`projects`** — one row per rooftop site. Carries the form fields from the wizard plus the simulation summary (`kwp`, `annual_kwh`, `monthly_kwh[]`, `payback_years`, …) and three storage path columns: `model_glb_path`, `measurement_img_path`, `data_json_path`. Foreign key on `owner_id → auth.users.id`.

**`project_assets`** — multiple rows per project. Records every uploaded file (kind ∈ `source_video | source_photo | obj | glb | measurement | report_pdf | data_json`, plus `bucket`, `path`, `size_bytes`, `mime`, free-form `meta jsonb`). The `projects.*_path` columns are the *current* file pointers; `project_assets` is the audit log.

**`project_events`** — append-only activity feed (`kind`, `message`, `meta`). The wizard inserts a `'created'` event after a successful upload sequence.

### Enums

- `project_status`: `draft | processing | ready | failed`
- `intake_mode`: `drone_terra | drone_video | photos | demo`
- `tariff_kind`: `domestic | non_domestic_lv`

### Trigger / function

`touch_updated_at()` fires `BEFORE UPDATE` on `projects` to keep `updated_at` honest.

### Migrations

- `supabase/migrations/0001_init.sql` — schema + RLS policies (production policies, gated on `auth.uid()`).
- `supabase/migrations/0002_storage_policies.sql` — per-bucket storage object policies (production, gated on the path's first segment matching `auth.uid()::text`).
- `supabase/seed.sql` — six seeded projects ported from the old `mock-projects.ts`. `owner_id` was hardcoded to the dev user UUID `63f727fb-1514-4acc-9202-46df12d06093` — **change this when seeding any other environment**.

### Dev-only RLS policies

Because there is no auth UI yet, the anon key has no `auth.uid()` and the production RLS policies block everything. We added a set of dev-only policies that allow the anon role full CRUD scoped to `owner_id = '63f727fb-…'`:

```sql
-- in public schema (projects + project_assets + project_events)
"dev anon read <table>"   for select to anon
"dev anon write <table>"  for all    to anon
-- in storage.objects (one per bucket)
"dev anon all <bucket>"   for all    to anon
```

**These policies must be dropped before launch.** They are tagged `DEV ONLY` in their names so they're easy to find in the Supabase Policies UI. The list:

| Schema | Policy |
|---|---|
| public | `dev anon read projects` |
| public | `dev anon write projects` |
| public | `dev anon read assets` |
| public | `dev anon write assets` |
| public | `dev anon read events` |
| public | `dev anon write events` |
| storage | `dev anon all project-models` |
| storage | `dev anon all project-images` |
| storage | `dev anon all project-data` |

The production policies (`own rows`, `own assets`, `own events`, and the per-bucket `auth.uid() = (storage.foldername(name))[1]` policies) are already in place and will start enforcing the moment a real authenticated session exists.

### Storage buckets

| Bucket | Holds | Limit |
|---|---|---|
| `project-models`  | `.glb` 3D models               | 50 MB (default) |
| `project-images`  | measurement / thumbnail images | 50 MB (default) |
| `project-data`    | `data.json` analysis blobs     | 50 MB (default) |

Path convention: `{owner_id}/{project_id}/{timestamp}_{sanitised_filename}`. The timestamp + sanitisation is enforced in `uploadAsset()` (see §4) so collisions and Postgres-unfriendly characters can't reach storage.

---

## 3. Environment & secrets

`frontend/.env.local`:

```
VITE_SUPABASE_URL=https://mpjgpahsxekjeqixkfqd.supabase.co
VITE_SUPABASE_ANON_KEY=<anon JWT>
VITE_DEV_OWNER_ID=63f727fb-1514-4acc-9202-46df12d06093
```

> ⚠️ **The service-role key and `sb_secret_*` were briefly pasted in chat and committed to `frontend/.env.local`. They have been removed from the file.** Treat them as compromised — rotate in Supabase dashboard → Project Settings → API → "Reset" before going live. Never put service-role keys anywhere under `frontend/`; they belong in `backend/.env` only.

`VITE_DEV_OWNER_ID` is the placeholder "logged-in user". Once real auth is added, this env var and every reference to it can be deleted (the API layer falls back to nothing — see §4).

---

## 4. Frontend — files added or rewritten

### NEW — `frontend/src/lib/projects-api.ts`

The single boundary between the UI and Supabase. Surface:

```ts
listProjects(): Promise<Project[]>
getProject(id): Promise<Project | null>
createProject(input: NewProjectInput): Promise<Project>
updateProject(id, patch): Promise<Project>          // accepts camelCase OR snake_case keys
uploadAsset(projectId, file, kind): Promise<{ path; bucket }>
getSignedUrl(bucket, path, expiresIn?): Promise<string>
listEvents(projectId): Promise<ProjectEvent[]>
logEvent(projectId, kind, message?, meta?): Promise<void>
```

Internal details worth knowing:

- **`rowToProject(row)`** maps DB snake_case → camelCase and **coerces all numeric columns through a `num()` helper**. PostgREST returns `numeric` columns as JS strings; without coercion `reduce((s, p) => s + p.kwp, 0)` does string concat and the dashboard hero metrics show 0. This bit us once during the build.
- **`updateProject(id, patch)`** has an explicit `camelToSnake` map. Unknown keys pass through unchanged, so callers must not pass extra fields the table doesn't have — Supabase will reject the update with `column 'X' does not exist`.
- **`uploadAsset()`** sanitises the filename (`/[^A-Za-z0-9._-]+/g → '_'`) and prepends `Date.now()` to avoid both invalid storage paths and collisions on re-upload. It writes to the right bucket based on `kind`, then inserts a `project_assets` row.
- **`bucketFor(kind)`** routes `glb|obj → project-models`, `measurement → project-images`, everything else → `project-data`.
- **Owner ID** comes from `import.meta.env.VITE_DEV_OWNER_ID`. Replace this when auth lands.

### NEW — `frontend/src/store/projects-store.ts`

TanStack Query hooks. Same import surface the old mock module exposed, so swapping was mechanical:

```ts
useProjects()           // list, sorted by created_at desc
useProject(id)          // single, enabled: !!id
usePortfolioStats()     // derives totals from useProjects (filters status='ready')
useCreateProject()      // mutation, invalidates ['projects'] on success
useUploadAsset()        // mutation
useSignedUrl(bucket, path)  // 50-min staleTime so it refreshes before 1-hour expiry
```

Query keys are centralised at the top of the file under `KEYS`.

### NEW — `frontend/src/lib/db-types.ts`

Generated by `npx supabase gen types typescript --project-id mpjgpahsxekjeqixkfqd`. **Re-run after every schema change.**

### CHANGED — `frontend/src/data/mock-projects.ts`

Stripped to type-only exports (`Project`, `ProjectStatus`, `IntakeMode`). The hardcoded `projects` array, `findProject()`, and `portfolioStats()` are gone — that data now lives in Supabase, and the stats logic moved into `usePortfolioStats()`. The `Project` interface picked up three optional fields: `modelGlbPath`, `measurementImgPath`, `dataJsonPath`.

### CHANGED — `frontend/src/main.tsx`

Wraps `<App/>` in `<QueryClientProvider>`. Imports `NewProject` (not `.stub`).

### CHANGED — `frontend/src/App.tsx`

Mounts `<Toaster position="bottom-right" richColors />` from `sonner` once at the layout level.

### CHANGED — `frontend/src/components/metrics/CountUp.tsx`

Bug fix. The previous version had a `startedRef` that locked the animation to its first run. When the dashboard mounted while React Query was still loading, the hero metrics animated `0 → 0` and never re-ran. Replaced with a `fromRef` that animates from the previous value to the new one whenever `value` changes. Cards weren't affected because they mount after data lands.

### REWRITE — `frontend/src/pages/NewProject.tsx` (replaces `NewProject.stub.tsx`)

4-step wizard, single route, local state:

1. **Site setup** — name, address, lat, lon, tariff toggle.
2. **Intake mode** — pick `drone_terra | drone_video | photos | demo`.
3. **Upload** — drag-drop zones for GLB (required unless demo), measurement image, data JSON. Per-file progress bars.
4. **Review & create** — summary card, "Create project" button.

Submit sequence (literally what runs):

```
createProject({ name, address, lat, lon, tariff, intake_mode, status:'draft' })
for each file in form.files:
  uploadAsset(project.id, file, kind)        // writes to bucket + inserts project_assets row
  updateProject(project.id, { <kind>Path: path })
logEvent(project.id, 'created')
toast.success → navigate(`/projects/${id}/analysis`)
```

Errors fall into a single `catch` that extracts `.message` from both `Error` instances and plain `{message}` objects (Supabase errors are the latter), logs the full error to console, and shows it in a `toast.error`. The wizard stays on the review step on failure.

### CHANGED — `frontend/src/pages/Dashboard.tsx`

`useProjects()` + `usePortfolioStats()`. Skeleton (3 pulsing cards) while loading. Empty state with a "New project" CTA when the list is empty.

### CHANGED — `frontend/src/pages/Analysis.tsx`

```ts
const { data: project } = useProject(id);
const { data: glbUrl } = useSignedUrl(
  project?.modelGlbPath ? 'project-models' : undefined,
  project?.modelGlbPath ?? undefined,
);
<MeshViewer lat={project.lat} lon={project.lon} glbUrl={glbUrl} />
```

Shows a spinner while `isLoading`, a "Project not found" panel when the query resolves to `null`.

### CHANGED — `frontend/src/components/viewer/MeshViewer.tsx`

Added optional `glbUrl?: string`. When present, renders the uploaded GLB in a `@react-three/drei` scene (Bounds, Environment, ContactShadows, OrbitControls). When absent, falls back to the existing procedural `RoofScene` so the six seeded projects without models still render.

### CHANGED — `frontend/src/components/data/ProjectCard.tsx`

Card root is a `<Link to={`/projects/${project.id}/analysis`}>`. (Was already mostly correct; verified during the swap.)

### CHANGED — collateral, all swapped from mock to hooks

- `frontend/src/components/chrome/ProjectRail.tsx` → `useProjects()`
- `frontend/src/components/chrome/TopBar.tsx` → `useProject(id)` for the search/jump-to widget
- `frontend/src/pages/Reports.stub.tsx` → `useProjects()`
- `frontend/src/pages/Portfolio.stub.tsx` → `useProjects()` + `usePortfolioStats()`
- `frontend/src/pages/Report.stub.tsx` → `useProject(id)` with loading + not-found guard

### CHANGED — buttons that were dead, now do something

| File | Button | Behaviour |
|---|---|---|
| `chrome/TopBar.tsx` | Notifications bell | `toast("Coming soon")` |
| `pages/Dashboard.tsx` | "Bulk-import drone set" | `toast("Coming soon")` |
| `pages/Captures.stub.tsx` | Row arrow button | `toast("Coming soon")` |
| `pages/Analysis.tsx` | "Send to client" | `toast("Coming soon")` |
| `pages/Report.stub.tsx` | "Download PDF" | `toast("Coming soon")` |
| `components/data/PanelSchedule.tsx` | "showing 12 of 38" expander | `toast("Coming soon")` |

`FeatureRail`, `Help`, `Settings`, `Tariffs`, `Portfolio` were already `<Link>`-driven — no changes needed.

### CHANGED — `frontend/src/vite-env.d.ts`

Added `/// <reference types="vite/client" />`. Pre-existing project oversight; without it `import.meta.env` is untyped and TS complains.

### Dependencies added

- `@tanstack/react-query` — store / cache layer
- `sonner` — toast lib (one `<Toaster/>` mounted in `App.tsx`)

`@supabase/supabase-js` was already present.

---

## 5. The create-project sequence (canonical)

If anything ever needs to be replayed manually or verified, this is the contract:

```
NewProject wizard submit
 ├─ projects.insert { name, address, lat, lon, tariff, intake_mode, status:'draft' }
 ├─ for each file:
 │    storage.upload(bucket, `${owner_id}/${project_id}/${ts}_${safe_name}`, file)
 │    project_assets.insert { project_id, kind, bucket, path, size_bytes, mime }
 │    projects.update { <kind>_path: path }
 ├─ project_events.insert { kind:'created' }
 └─ navigate(`/projects/${id}/analysis`)
```

Reading later:
- **GLB** → `storage.from('project-models').createSignedUrl(path, 3600)` → fed to `<MeshViewer glbUrl=...>`.
- **data.json** → `storage.from('project-data').download(path)` → `await blob.text()` → `JSON.parse`. Not yet wired into a UI surface; the column exists and the wizard supports uploading it.

---

## 6. Known gotchas / reasons things are the way they are

1. **PostgREST returns `numeric` as a JS string.** Always coerce with `num()` in `rowToProject`. If you add a new numeric column, route it through the helper.
2. **`updateProject()` does not validate keys.** Anything that isn't in the `camelToSnake` map passes through verbatim. Don't pass unknown keys — Supabase will 400 with a column-not-found error and the wizard catch-block will surface it.
3. **CountUp animates from previous value to new value.** Don't reintroduce the "first run only" gate — async data loading will silently zero the hero metrics.
4. **Storage paths must start with the owner UUID** (RLS uses `(storage.foldername(name))[1]`). `uploadAsset` already enforces this; if you ever upload from a script, reproduce the same prefix.
5. **Dev-only RLS policies are wide open to the anon key for the dev UUID.** Anyone with the anon key + that UUID can read and write. This is acceptable for local development; it is not acceptable in any environment exposed publicly.
6. **The 6 seeded projects have no storage assets.** `model_glb_path` is null on all of them; the analysis page falls back to the procedural scene. That's by design.

---

## 7. What's not done (queued for next pass)

1. **Auth.** No sign-in screen exists. Adding `@supabase/auth-ui-react` (or rolling a custom screen) and gating `<App/>` behind a session is the next milestone. Once a real session exists, drop the dev-only RLS policies (§2) and `VITE_DEV_OWNER_ID`.
2. **Backend ↔ Supabase.** The FastAPI service (`backend/`) still has its own mock data and writes nothing to Supabase. The simulation pipeline that produces `kwp`, `annual_kwh`, `monthly_kwh[]`, etc. needs to be triggered after upload (probably by a Supabase Edge Function or a polled queue) and write its results back into the row + a `data.json` blob into `project-data`.
3. **Real-time updates.** Right now the dashboard only refetches on mutation invalidation. If processing takes minutes, subscribe to `projects` row changes via `supabase.channel('projects').on('postgres_changes', …)` and patch the React Query cache.
4. **Map-based lat/lon picker.** The wizard currently takes raw numeric inputs. A Leaflet "click on map" picker has been discussed but not built.
5. **Secret rotation.** As flagged in §3 — rotate the leaked service-role and `sb_secret_*` keys.
6. **CoordReadout pre-existing console errors** (`getBoundingClientRect is not a function`) and stray `THREE.WebGLRenderer Context Lost` messages — pre-date this work, not a regression, worth a separate cleanup pass.

---

## 8. Quick-start for a teammate cloning fresh

1. `npm install` in `frontend/`.
2. Get the dev anon key + dev user UUID from chinpeikang and put them in `frontend/.env.local` (template in §3).
3. `npm run dev` from `frontend/` — the dashboard should load with 6 seeded projects.
4. Create a project end-to-end via the wizard to verify writes work.
5. To regenerate types after a schema change: `cd frontend && npx supabase gen types typescript --project-id mpjgpahsxekjeqixkfqd > src/lib/db-types.ts`.

If the dashboard is empty, RLS is blocking — confirm the dev-only policies still exist in the Supabase dashboard. If file uploads fail, check the bucket-level dev policies (one per bucket).
