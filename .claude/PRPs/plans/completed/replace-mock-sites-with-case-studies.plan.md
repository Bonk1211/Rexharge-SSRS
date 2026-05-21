# Plan: Replace Hallucinated Mock Sites With 5 Real Case-Study Buildings

## Summary
Wipe the 6 fabricated rows (Setia Alam Semi-D, Cyberjaya Link House, Subang Jaya Corner Lot, Penang Surau Pilot, Shah Alam Triple Shoplot, Cyberjaya 4-storey Office) from the live Supabase `projects` table and replace them with the 5 real drone-photogrammetry case studies (`video_2` SSU UM, `video_4` Household, `video_5` Star Grocer, `video_6` Rainbow, `video_7` Eco Horizon). All 5 land as `status='ready'` so the "Sites needing attention" panel goes empty. The Clients grid, ProjectDetail viewer, and "Open in simulator" deep-link must read the real building info (coords, monthly usage, tariff, external GLB URL, GMap measurement PNG, thumbnail) end-to-end with zero hallucinated numbers.

## User Story
As the demo presenter, I want every site card and project page to show the exact buildings I actually reconstructed (SSU UM, Household, Star Grocer, Rainbow, Eco Horizon) with their real coordinates, GLB models, and TNB tariffs, so that the audience never sees fictional addresses or invented kWp/savings numbers.

## Problem → Solution
**Current:** Supabase `projects` table holds 6 invented rows (Setia Alam Semi-D Cluster, Cyberjaya Link House, Subang Jaya Corner Lot, Penang Surau Rooftop Pilot, Shah Alam Triple Shoplot, Cyberjaya 4-storey Office Block) plus 3 generic ready entries (Bukit Jalil, PJ, Ipoh). Mini3DPreview can only resolve `modelGlbPath` through Supabase signed URLs (`Mini3DPreview.tsx:37-42`), so the case-study GLBs hosted at `https://solar.limziyang.ml/static/models/...` cannot render. The "Open in simulator" button on ProjectDetail (`ProjectDetail.tsx:85-94`) opens the bare `${__SIMULATOR_URL__}` without lat/lng/usage/tariff params, so the simulator wizard opens blank.

**Desired:** Supabase holds exactly 5 rows (one per case study), each with `model_glb_path` storing the absolute `https://solar.limziyang.ml/static/models/<id>/3DModel.glb` URL, `measurement_img_path` storing the absolute `/static/measurement/<name>.png` URL, plus `monthly_usage_kwh`, `tariff_type`, and new `thumbnail_url`. Mini3DPreview and ProjectDetail detect absolute http(s) URLs and skip signed-url resolution. The Clients grid shows the 5 real cards; "Sites needing attention" shows the empty state. The "Open in simulator" button appends `&model=<glb>&lat=&lng=&usage=&tariff=` so the simulator pre-fills its wizard.

## Metadata
- **Complexity**: Medium
- **Source PRD**: N/A (free-form: case-study quick-load buildings + "make sure no hallucination in frontend, make sure all display accurate info")
- **PRD Phase**: N/A
- **Estimated Files**: ~10 changed + 3 report JSONs pending paste from user
  - new: `supabase/migrations/0004_replace_projects_seed.sql`
  - new: `frontend/src/data/case-study-buildings.ts`
  - new (placeholders): `frontend/src/data/reports/{household,star_grocer,rainbow}.json` ← **user pastes**
  - edit: `supabase/seed.sql`
  - edit: `frontend/src/data/mock-projects.ts` (extend type + rewrite MOCK_PROJECTS fallback)
  - edit: `frontend/src/lib/projects-api.ts` (map new columns + thumbnail_url)
  - edit: `frontend/src/components/data/Mini3DPreview.tsx` (absolute-URL bypass + thumbnail fallback)
  - edit: `frontend/src/components/data/ProjectCard.tsx` (use thumbnail image when present)
  - edit: `frontend/src/pages/ProjectDetail.tsx` (full-param simulator deep-link; absolute-URL glb support)
  - edit: `frontend/src/data/project-reports.ts` (register 3 new ids)

---

## UX Design

### Before (current — quoted from user)
```
+----- Monitoring · Active rooftops --------------------------+
| 9 sites · live                                              |
| Sites needing attention                                  6  |
| +------------------------------------------------------+    |
| | Setia Alam - Semi-D Cluster        [processing]  Open|    |
| | Cyberjaya - Link House             [draft]       Open|    |
| | Subang Jaya - Corner Lot           [failed]      Open|    |
| | Penang — Surau Rooftop Pilot       [failed]      Open|    |
| | Shah Alam — Triple Shoplot         [processing] Open |    |
| | Cyberjaya — 4-storey Office Block  [draft]      Open |    |
| +------------------------------------------------------+    |
+-------------------------------------------------------------+
ALL SIX ROWS HALLUCINATED — no real reconstruction backs them.
```

### After
```
+----- Monitoring · Active rooftops --------------------------+
| 5 sites · live                                              |
| Sites needing attention                                  0  |
| Every site is in good shape.                                |
+-------------------------------------------------------------+

+----- Clients & sites · 3-column grid -----------------------+
| [SSU.png 3D]            [STAR_GROCER.jpg 3D]                |
|  SSU UM No.2 Substation  Star Grocer                        |
|  UM Campus, KL           Taman Paramount, PJ                |
|  116.6 kWp · 162.9 MWh                                      |
|                                                             |
| [RAINBOW.png 3D]        [HOUSEHOLD.png 3D]                  |
|  Rainbow Rec Center      Household                          |
|                                                             |
| [ECO_HORIZON.PNG 3D]                                        |
|  Eco Horizon, Batu Kawan                                    |
|  64.5 kWp · 90.1 MWh                                        |
+-------------------------------------------------------------+
```

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| `Monitoring` attention list | 6 fake rows | 0 rows (empty-state copy) | All 5 case studies are `ready` |
| `Clients` grid count | 9 cards | 5 cards | Order: SSU, Star Grocer, Rainbow, Household, Eco Horizon |
| `ProjectCard` thumbnail | Mini3DPreview only (gradient bg per `thumbnailHue`) | If `thumbnailUrl` set, show `<img>` while GLB loads behind it | Smooth perceived load |
| Mini3DPreview model source | `useSignedUrl('project-models', path)` only | Absolute `https?://` URL → used as-is; otherwise Supabase signed URL | Lets external solar.limziyang.ml GLBs render |
| `ProjectDetail` Open-in-simulator | `${__SIMULATOR_URL__}` (no params) | `${__SIMULATOR_URL__}/simulator?model=<glb>&lat=<lat>&lng=<lng>&usage=<kWh>&tariff=<code>` | Pre-fills simulator wizard |
| `measurementImgPath` rendering | unused | unchanged | Plumbed but rendering is out of scope |

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `frontend/src/data/mock-projects.ts` | 1-252 | `Project` interface + `MOCK_PROJECTS` fallback — must add `thumbnailUrl` and rewrite contents |
| P0 | `frontend/src/lib/projects-api.ts` | 43-70, 86-103, 135-162 | `rowToProject` mapper + `listProjects` Supabase fetch + `updateProject` camelToSnake map — add `thumbnail_url`, `monthly_usage_kwh`, `tariff_type` mapping |
| P0 | `supabase/migrations/0001_init.sql` | 1-40 | `projects` table schema — confirms `monthly_usage_kwh`, `tariff_type`, `thumbnail_url` columns must be added |
| P0 | `supabase/seed.sql` | 1-75 | Canonical mock seed — rewrite to the 5 real buildings |
| P0 | `frontend/src/components/data/Mini3DPreview.tsx` | 37-83 | Where signed-URL resolution happens — bypass for absolute URLs |
| P0 | `frontend/src/pages/ProjectDetail.tsx` | 24-28, 85-95 | GLB signed-URL hook + Open-in-simulator anchor — both need updates |
| P1 | `frontend/src/data/project-reports.ts` | 1-20 | Registry that maps `reportId` → static JSON loader. New ids: `household`, `star-grocer`, `rainbow` |
| P1 | `frontend/src/data/reports/ssu_um.json` | 1-95 | Schema reference for user-pasted JSONs (`site`, `panelConfig`, `inverterConfig`, `systemSummary`, `energyProduction`, `lossAnalysis`, `financial`) |
| P1 | `frontend/src/data/reports/eco_horizon.json` | 1-95 | Second reference + confirms `tariffType: "Domestik (Rumah)"` literal |
| P1 | `frontend/src/components/data/ProjectCard.tsx` | 31-48 | Thumbnail area where `<img>` overlay slots in |
| P1 | `frontend/vite.config.ts` | 7-22 | `__SIMULATOR_URL__` define for deep-link |
| P2 | `frontend/src/components/data/ProjectDashboard.tsx` | 170-200 | Confirms `tariffType` + `monthlyUsageKwh` are already rendered |
| P2 | `frontend/src/pages/Workspace3DConverter.tsx` | 11-39 | Existing simulator deep-link pattern (mirror its URL builder style) |
| P2 | `frontend/src/pages/Monitoring.tsx` | 142-191 | `SitesNeedingAttention` filter — verifies empty state when all rows are `ready` |

## External Documentation

| Topic | Source | Key Takeaway |
|---|---|---|
| Case-study buildings | User's prompt (verbatim table) | Exact coords, monthly kWh, tariff code, GLB URL, measurement PNG, thumbnail URL for each of 5 |
| Simulator deep-link contract | User's prompt §"Simulator deep-link" | `?model=<url>&lat=<>&lng=<>&usage=<kWh>&tariff=<commercial_lv\|domestic\|commercial_mv>` |
| TNB tariff codes | User's prompt §"Available tariff codes" | `domestic`, `commercial_lv`, `commercial_mv` are the only accepted values |

---

## Patterns to Mirror

### NAMING_CONVENTION — camelCase TS field + snake_case DB column
```ts
// SOURCE: frontend/src/lib/projects-api.ts:43-70
function rowToProject(row: Record<string, unknown>): Project {
  return {
    id:               row.id as string,
    name:             row.name as string,
    annualKwh:        num(row.annual_kwh),
    monthlyKwh:       Array.isArray(row.monthly_kwh)
                        ? (row.monthly_kwh as unknown[]).map(x => num(x))
                        : [],
    modelGlbPath:       (row.model_glb_path as string | null) ?? null,
    measurementImgPath: (row.measurement_img_path as string | null) ?? null,
  }
}
```

### TYPED_FALLBACK — `MOCK_PROJECTS` mirrors Supabase row shape
```ts
// SOURCE: frontend/src/data/mock-projects.ts:43-80
export const MOCK_PROJECTS: Project[] = [
  {
    id: "PRJ-2026-0001",
    name: "Bukit Jalil — Detached Residence",
    address: "...",
    lat: 3.0578, lon: 101.6612,
    intakeMode: "photos",
    status: "ready",
    monthlyUsageKwh: 850,
    tariffType: "Domestik",
  },
];
```

### SUPABASE_DO_BLOCK — seed pattern
```sql
-- SOURCE: supabase/seed.sql:6-75
do $$
declare
  dev_owner uuid := '63f727fb-1514-4acc-9202-46df12d06093';
begin
  insert into projects (id, owner_id, name, address, lat, lon, ...)
  values
    ( gen_random_uuid(), dev_owner, 'Bukit Jalil — Detached Residence', ... );
end $$;
```

### SIGNED_URL_HOOK — current GLB resolver
```tsx
// SOURCE: frontend/src/components/data/Mini3DPreview.tsx:37-42
const { data: glbUrl } = useSignedUrl(
  project.modelGlbPath ? "project-models" : undefined,
  project.modelGlbPath ?? undefined,
);
```

### DEEPLINK_BUILDER — only existing simulator URL builder
```tsx
// SOURCE: frontend/src/pages/Workspace3DConverter.tsx:24
const url = `${__SIMULATOR_URL__}/simulator?model=${signedModel}`;
window.open(url, "_blank", "noopener,noreferrer");
```

### REPORT_REGISTRY — static-import + dynamic-loader pattern
```ts
// SOURCE: frontend/src/data/project-reports.ts:7-10
const projectReportLoaders: Record<ProjectReportId, () => Promise<ProjectReport>> = {
  "eco-horizon": () => import("./reports/eco_horizon.json").then((m) => m.default),
  "ssu-um":      () => import("./reports/ssu_um.json").then((m) => m.default),
};
```

### MIGRATION_STYLE — single-purpose alter
```sql
-- MIRROR: supabase/migrations/0003_drop_tariff.sql:1-2
alter table projects add column if not exists monthly_usage_kwh numeric;
alter table projects add column if not exists tariff_type text;
alter table projects add column if not exists thumbnail_url text;
```

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `supabase/migrations/0004_replace_projects_seed.sql` | CREATE | Add 3 columns + delete `dev_owner` rows + insert the 5 real buildings with fixed UUIDs |
| `supabase/seed.sql` | UPDATE | Make canonical local-seed match new migration (5 buildings, 3 new columns) |
| `frontend/src/data/case-study-buildings.ts` | CREATE | Single source of truth for the 5 buildings (id, model URL, coords, usage, tariff code, thumbnail URL, measurement URL, fixed UUID). Imported by `mock-projects.ts` MOCK_PROJECTS |
| `frontend/src/data/mock-projects.ts` | UPDATE | Add `thumbnailUrl?: string` to `Project`. Rewrite `MOCK_PROJECTS` using `CASE_STUDY_BUILDINGS` |
| `frontend/src/lib/projects-api.ts` | UPDATE | Extend `rowToProject` to map `thumbnail_url`, `monthly_usage_kwh`, `tariff_type`; extend `camelToSnake` map |
| `frontend/src/components/data/Mini3DPreview.tsx` | UPDATE | If `modelGlbPath` matches `/^https?:\/\//`, use it directly; otherwise fall back to existing `useSignedUrl`. Add `thumbnailUrl` `<img>` overlay |
| `frontend/src/components/data/ProjectCard.tsx` | UPDATE | No-op if Mini3DPreview owns the thumbnail; otherwise pass `thumbnailUrl` through |
| `frontend/src/pages/ProjectDetail.tsx` | UPDATE | Bypass `useSignedUrl` for absolute http(s) `modelGlbPath`; rebuild Open-in-simulator anchor via new `buildSimulatorUrl(project)` |
| `frontend/src/data/project-reports.ts` | UPDATE | Add `household`, `star-grocer`, `rainbow` to the union + loader map |
| `frontend/src/data/reports/household.json` | CREATE (placeholder) | `{ "_placeholder": true }` so `import()` resolves. Replaced by user's export before merge |
| `frontend/src/data/reports/star_grocer.json` | CREATE (placeholder) | Same |
| `frontend/src/data/reports/rainbow.json` | CREATE (placeholder) | Same |

## NOT Building

- Removing `Bukit Jalil`, `Petaling Jaya — Light-industrial`, `Ipoh — Heritage Bungalow`, `Johor Bahru — Warehouse Roof` from any other surface — they're also gone since we rewrite both `MOCK_PROJECTS` and the Supabase seed.
- Rendering the GMap measurement PNG inside Mini3DPreview or ProjectDetail. Plumbed but display is out of scope.
- Reading the `<model_id>` (`video_2`, etc.) from the URL — kept only as a column for pipeline traceability.
- Wiring `nemEnabled` / `effectiveRate` / per-card payback numbers for video_4/5/6 — those come from the report JSONs user will paste.
- Auto-downloading case-study thumbnails into `frontend/public/case-studies/`. Plan keeps the remote URL.
- Touching `frontend/src/components/landing/StatBand.tsx` ticker — marketing fluff, not the projects list.
- Re-pointing `__SIMULATOR_URL__` — `vite.config.ts:8-11` already points all envs at `https://solar.limziyang.ml`.

---

## The 5 Buildings (Single Source of Truth)

All values below come verbatim from the user's prompt. Anything marked *← from report JSON* must be read from `frontend/src/data/reports/*.json` (3 pending paste).

| Field | video_2 SSU UM | video_5 Star Grocer | video_6 Rainbow | video_4 Household | video_7 Eco Horizon |
|---|---|---|---|---|---|
| **Fixed UUID** | `11111111-1111-4111-8111-111111111111` | `22222222-2222-4222-8222-222222222222` | `33333333-3333-4333-8333-333333333333` | `44444444-4444-4444-8444-444444444444` | `55555555-5555-4555-8555-555555555555` |
| **name** | `SSU UM No.2 Electrical Substation` | `Star Grocer` | `Rainbow Recreation Center` | `Household` | `Eco Horizon` |
| **address** | `University Malaya Campus, 50603 Kuala Lumpur` | `Taman Paramount, 46000 Petaling Jaya, Selangor` | `Taman Paramount, 46000 Petaling Jaya, Selangor` | `Taman Paramount, 46000 Petaling Jaya, Selangor` | `Eco Horizon, Batu Kawan, 14110 Pulau Pinang` |
| **lat** | `3.128080` | `3.106827` | `3.110072` | `3.108156` | `5.237826` |
| **lon** | `101.651010` | `101.624123` | `101.622002` | `101.622418` | `100.452277` |
| **intakeMode** | `drone_video` | `drone_video` | `drone_video` | `drone_video` | `drone_video` |
| **status** | `ready` | `ready` | `ready` | `ready` | `ready` |
| **monthlyUsageKwh** | `5000` | `10000` | `8000` | `600` | `700` |
| **tariffType (DB code)** | `commercial_lv` | `commercial_lv` | `commercial_lv` | `domestic` | `domestic` |
| **tariff display label** | `Komersial Voltan Rendah` | `Komersial Voltan Rendah` | `Komersial Voltan Rendah` | `Domestik (Rumah)` | `Domestik (Rumah)` |
| **modelGlbPath** | `https://solar.limziyang.ml/static/models/video_2/3DModel.glb` | `https://solar.limziyang.ml/static/models/video_5/3DModel.glb` | `https://solar.limziyang.ml/static/models/video_6/3DModel.glb` | `https://solar.limziyang.ml/static/models/video_4/3DModel.glb` | `https://solar.limziyang.ml/static/models/video_7/3DModel.glb` |
| **measurementImgPath** | `https://solar.limziyang.ml/static/measurement/ssu.png` | `https://solar.limziyang.ml/static/measurement/star_grocer.png` | `https://solar.limziyang.ml/static/measurement/rainbow.png` | `https://solar.limziyang.ml/static/measurement/household.png` | `https://solar.limziyang.ml/static/measurement/eco_horizon.png` |
| **thumbnailUrl** | `https://solar.limziyang.ml/static/SSU.png` | `https://solar.limziyang.ml/static/STAR_GROCER.jpg` | `https://solar.limziyang.ml/static/RAINBOW.png` | `https://solar.limziyang.ml/static/HOUSEHOLD.png` | `https://solar.limziyang.ml/static/ECO_HORIZON.PNG` |
| **reportId** | `ssu-um` | `star-grocer` *(pending)* | `rainbow` *(pending)* | `household` *(pending)* | `eco-horizon` |
| **kwp** | `116.6` ← `ssu_um.json:57` | ← from JSON | ← from JSON | ← from JSON | `64.5` ← `eco_horizon.json:57` |
| **annualKwh** | `162900` ← `ssu_um.json:59` | ← from JSON | ← from JSON | ← from JSON | `90100` ← `eco_horizon.json:59` |
| **annualSavingsRm** | `33327` ← `ssu_um.json:92` | ← from JSON | ← from JSON | ← from JSON | `3716` ← `eco_horizon.json:92` |
| **paybackYears** | `13.3` ← `ssu_um.json:94` | ← from JSON | ← from JSON | ← from JSON | `65.9` ← `eco_horizon.json:94` |
| **panels** | `188` ← `ssu_um.json:56` | ← from JSON | ← from JSON | ← from JSON | `104` ← `eco_horizon.json:56` |
| **monthlyKwh[12]** | derive from `monthlyAvg`=13577 + curve | derive | derive | derive | derive from `monthlyAvg`=7511 |
| **thumbnailHue** | `120` | `30` | `260` | `200` | `90` | (cosmetic fallback only)

For monthlyKwh derivation: reuse the pattern at `mock-projects.ts:59` (symmetric 12-element curve summing to `annualKwh`). Rows pending JSONs: set `monthlyKwh: []` until paste — `Sparkline` (`ProjectCard.tsx:94`) handles empty arrays. To keep `isPending` false in `ProjectCard.tsx:70-84` while array is empty, the implementation can use a flat placeholder `[Math.round(annualKwh / 12)]` OR patch `ProjectCard` to handle `ready + []` (implementation-time judgement).

---

## Step-by-Step Tasks

### Task 1: Create `case-study-buildings.ts` constants file
- **ACTION**: New `frontend/src/data/case-study-buildings.ts` exporting `CASE_STUDY_BUILDINGS` with 5 entries.
- **IMPLEMENT**: Each entry: `{ uuid, projectIdString, name, address, lat, lon, monthlyUsageKwh, tariffCode, tariffDisplay, modelGlbUrl, measurementImgUrl, thumbnailUrl, reportId, thumbnailHue }`. Values verbatim from the table above.
- **MIRROR**: `Project` field-naming style at `mock-projects.ts:4-39`.
- **IMPORTS**: none.
- **GOTCHA**: Use fixed UUIDs — Supabase `id` is `uuid`, but Project.id is string at the boundary.
- **VALIDATE**: `import { CASE_STUDY_BUILDINGS } from "@/data/case-study-buildings"` resolves with `.length === 5`.

### Task 2: Extend `Project` type with new fields
- **ACTION**: Edit `frontend/src/data/mock-projects.ts`.
- **IMPLEMENT**: Add `thumbnailUrl?: string` to the `Project` interface alongside `modelGlbPath` etc. `monthlyUsageKwh` and `tariffType` already exist.
- **MIRROR**: Optional-field style at `mock-projects.ts:25-38`.
- **GOTCHA**: Keep field optional — old rows without `thumbnail_url` must still parse.
- **VALIDATE**: `tsc --noEmit` clean.

### Task 3: Rewrite `MOCK_PROJECTS` to the 5 case studies
- **ACTION**: Edit `frontend/src/data/mock-projects.ts`.
- **IMPLEMENT**: Replace the 7-element array with 5 entries built from `CASE_STUDY_BUILDINGS`. For SSU and Eco Horizon, populate `kwp/annualKwh/annualSavingsRm/paybackYears/panels` from their report JSONs (numbers as per the table). For the other 3, `0` and `monthlyKwh: []` until JSON pasted. `capturedAt: "2026-05-21T10:00:00+08:00"`.
- **MIRROR**: existing literal at `mock-projects.ts:44-80`.
- **IMPORTS**: `import { CASE_STUDY_BUILDINGS } from "./case-study-buildings"`.
- **GOTCHA**: JSON values are quoted strings with units (`"162.9 MWh"` → `162900`, `"13.3 yrs"` → `13.3`, `"188"` → `188`). Strip unit suffix before `parseFloat`.
- **VALIDATE**: Clients page renders 5 cards.

### Task 4: Map new DB columns in `projects-api.ts`
- **ACTION**: Edit `frontend/src/lib/projects-api.ts`.
- **IMPLEMENT**: In `rowToProject` (`:43-70`), add:
  ```ts
  thumbnailUrl:     (row.thumbnail_url as string | null) ?? null,
  monthlyUsageKwh:  num(row.monthly_usage_kwh),
  tariffType:       (row.tariff_type as string | null) ?? undefined,
  ```
  In `camelToSnake` (`:138-150`): add `thumbnailUrl: 'thumbnail_url'`, `monthlyUsageKwh: 'monthly_usage_kwh'`, `tariffType: 'tariff_type'`.
- **MIRROR**: existing camelCase entries.
- **GOTCHA**: `tariffType` is `text` not numeric — do not wrap in `num()`.
- **VALIDATE**: `tsc --noEmit` clean. After Supabase fetch, `Project.tariffType` is the snake_case value.

### Task 5: Add the Supabase migration
- **ACTION**: New `supabase/migrations/0004_replace_projects_seed.sql`.
- **IMPLEMENT**:
  ```sql
  -- 0004: add usage/tariff/thumbnail columns and replace fabricated seed
  -- with the 5 real drone-photogrammetry case studies.

  alter table projects add column if not exists monthly_usage_kwh numeric;
  alter table projects add column if not exists tariff_type       text;
  alter table projects add column if not exists thumbnail_url     text;

  do $$
  declare
    dev_owner uuid := '63f727fb-1514-4acc-9202-46df12d06093';
  begin
    delete from projects where owner_id = dev_owner;

    insert into projects (
      id, owner_id, name, address, lat, lon, intake_mode, status,
      captured_at, thumbnail_hue,
      kwp, annual_kwh, annual_savings_rm, payback_years,
      monthly_kwh, panels, planes, obstacles, capacity_factor,
      model_glb_path, measurement_img_path, thumbnail_url,
      monthly_usage_kwh, tariff_type
    )
    values
      ( '11111111-1111-4111-8111-111111111111', dev_owner,
        'SSU UM No.2 Electrical Substation',
        'University Malaya Campus, 50603 Kuala Lumpur',
        3.128080, 101.651010, 'drone_video', 'ready',
        '2026-05-21T10:00:00+08:00', 120,
        116.6, 162900, 33327, 13.3,
        array[]::numeric[], 188, 0, 0, 0.159,
        'https://solar.limziyang.ml/static/models/video_2/3DModel.glb',
        'https://solar.limziyang.ml/static/measurement/ssu.png',
        'https://solar.limziyang.ml/static/SSU.png',
        5000, 'commercial_lv'),

      ( '22222222-2222-4222-8222-222222222222', dev_owner,
        'Star Grocer', 'Taman Paramount, 46000 Petaling Jaya, Selangor',
        3.106827, 101.624123, 'drone_video', 'ready',
        '2026-05-21T10:00:00+08:00', 30,
        0, 0, 0, 0, array[]::numeric[], 0, 0, 0, 0,
        'https://solar.limziyang.ml/static/models/video_5/3DModel.glb',
        'https://solar.limziyang.ml/static/measurement/star_grocer.png',
        'https://solar.limziyang.ml/static/STAR_GROCER.jpg',
        10000, 'commercial_lv'),

      ( '33333333-3333-4333-8333-333333333333', dev_owner,
        'Rainbow Recreation Center',
        'Taman Paramount, 46000 Petaling Jaya, Selangor',
        3.110072, 101.622002, 'drone_video', 'ready',
        '2026-05-21T10:00:00+08:00', 260,
        0, 0, 0, 0, array[]::numeric[], 0, 0, 0, 0,
        'https://solar.limziyang.ml/static/models/video_6/3DModel.glb',
        'https://solar.limziyang.ml/static/measurement/rainbow.png',
        'https://solar.limziyang.ml/static/RAINBOW.png',
        8000, 'commercial_lv'),

      ( '44444444-4444-4444-8444-444444444444', dev_owner,
        'Household', 'Taman Paramount, 46000 Petaling Jaya, Selangor',
        3.108156, 101.622418, 'drone_video', 'ready',
        '2026-05-21T10:00:00+08:00', 200,
        0, 0, 0, 0, array[]::numeric[], 0, 0, 0, 0,
        'https://solar.limziyang.ml/static/models/video_4/3DModel.glb',
        'https://solar.limziyang.ml/static/measurement/household.png',
        'https://solar.limziyang.ml/static/HOUSEHOLD.png',
        600, 'domestic'),

      ( '55555555-5555-4555-8555-555555555555', dev_owner,
        'Eco Horizon', 'Eco Horizon, Batu Kawan, 14110 Pulau Pinang',
        5.237826, 100.452277, 'drone_video', 'ready',
        '2026-05-21T10:00:00+08:00', 90,
        64.5, 90100, 3716, 65.9,
        array[]::numeric[], 104, 0, 0, 0.161,
        'https://solar.limziyang.ml/static/models/video_7/3DModel.glb',
        'https://solar.limziyang.ml/static/measurement/eco_horizon.png',
        'https://solar.limziyang.ml/static/ECO_HORIZON.PNG',
        700, 'domestic');
  end $$;
  ```
- **MIRROR**: `supabase/seed.sql:6-75` block + `0003_drop_tariff.sql:1-2` migration style.
- **GOTCHA**:
  - `delete from projects where owner_id = dev_owner` is **destructive**. Confirm with user that no real customer data lives under that dev uuid before running. Safer variant: scope by `name in (...)` to only the 9 known-fabricated rows.
  - Use explicit UUIDs (not `gen_random_uuid()`) so deep-links survive re-seeds.
- **VALIDATE**: Apply via `npx supabase db reset` locally, or `mcp__supabase__apply_migration` on remote. Then `select count(*) from projects where owner_id = '63f727fb-1514-4acc-9202-46df12d06093'` returns `5`.

### Task 6: Rewrite `supabase/seed.sql`
- **ACTION**: Replace contents of `supabase/seed.sql` with the same `delete + insert` block from Task 5 (minus the `alter table` lines — `seed.sql` runs after migrations).
- **MIRROR**: current `seed.sql:6-75`.
- **GOTCHA**: Keep the same fixed UUIDs as Task 5 so seed is idempotent against the migration.
- **VALIDATE**: reseed cleanly via CLI; row count = 5.

### Task 7: Support absolute-URL GLBs in `Mini3DPreview`
- **ACTION**: Edit `frontend/src/components/data/Mini3DPreview.tsx`.
- **IMPLEMENT**:
  ```tsx
  const path = project.modelGlbPath;
  const isAbsolute = !!path && /^https?:\/\//i.test(path);
  const { data: signed } = useSignedUrl(
    isAbsolute || !path ? undefined : "project-models",
    isAbsolute ? undefined : path ?? undefined,
  );
  const glbUrl = isAbsolute ? path : signed;
  ```
  Add an `<img className="absolute inset-0 w-full h-full object-cover">` overlay when `project.thumbnailUrl` is set and the GLB hasn't loaded; fade out on first frame via `onCreated` on `<Canvas>`.
- **MIRROR**: hook usage at `Mini3DPreview.tsx:37-42`.
- **IMPORTS**: `useState`.
- **GOTCHA**:
  - `useSignedUrl` (`projects-store.ts:90-97`) requires both args truthy to enable — passing `undefined` keeps the query disabled.
  - `useGLTF` (drei) fetches via `fetch()` and respects CORS. `solar.limziyang.ml` must serve `Access-Control-Allow-Origin: *` on `/static/models/*.glb`. If not, the canvas stays empty. Test before merging.
- **VALIDATE**: Clients page renders the real building geometry for each card (not `RoofScene`).

### Task 8: Wire ProjectDetail to absolute GLBs + full deep-link
- **ACTION**: Edit `frontend/src/pages/ProjectDetail.tsx`.
- **IMPLEMENT**:
  1. Replace lines 25-28 with the same `isAbsolute` branch from Task 7.
  2. Replace the anchor at lines 85-94 with `<a href={buildSimulatorUrl(project)} ...>`:
     ```ts
     function buildSimulatorUrl(p: Project): string {
       const params = new URLSearchParams();
       if (p.modelGlbPath) params.set("model", p.modelGlbPath);
       params.set("lat", String(p.lat));
       params.set("lng", String(p.lon));
       if (p.monthlyUsageKwh != null) params.set("usage", String(p.monthlyUsageKwh));
       if (p.tariffType) params.set("tariff", tariffCode(p.tariffType));
       return `${__SIMULATOR_URL__}/simulator?${params.toString()}`;
     }
     function tariffCode(t: string): string {
       // accept both display-label legacy rows and the new codes
       if (t === "Domestik" || t === "Domestik (Rumah)") return "domestic";
       if (t === "Komersial Voltan Rendah") return "commercial_lv";
       if (t === "Komersial Voltan Sederhana") return "commercial_mv";
       return t; // already a code
     }
     ```
- **MIRROR**: `Workspace3DConverter.tsx:24` URL builder style.
- **GOTCHA**: DB field is `lon` but simulator expects `lng` — rename at the boundary inside `buildSimulatorUrl`.
- **VALIDATE**: From any project page, "Open in simulator" opens a URL like `https://solar.limziyang.ml/simulator?model=https%3A%2F%2F...&lat=3.12808&lng=101.65101&usage=5000&tariff=commercial_lv`; the simulator wizard pre-populates.

### Task 9: Register the 3 pending report JSONs
- **ACTION**: Edit `frontend/src/data/project-reports.ts` + create 3 placeholder JSON files.
- **IMPLEMENT**:
  ```ts
  export type ProjectReportId =
    | "eco-horizon" | "ssu-um" | "household" | "star-grocer" | "rainbow";
  const projectReportLoaders: Record<ProjectReportId, () => Promise<ProjectReport>> = {
    "eco-horizon": () => import("./reports/eco_horizon.json").then((m) => m.default),
    "ssu-um":      () => import("./reports/ssu_um.json").then((m) => m.default),
    "household":   () => import("./reports/household.json").then((m) => m.default),
    "star-grocer": () => import("./reports/star_grocer.json").then((m) => m.default),
    "rainbow":     () => import("./reports/rainbow.json").then((m) => m.default),
  };
  ```
  Each placeholder JSON: `{ "_placeholder": true, "site": { "latitude": <lat>, "longitude": <lon> } }`.
- **MIRROR**: `project-reports.ts:7-10`.
- **GOTCHA**: `ProjectReport` is currently `typeof ecoHorizonReport | typeof ssuUmReport`. Broaden the union to include the placeholder shape **or** widen to `Record<string, unknown>` + add a runtime `_placeholder` guard before `ExportedSceneViewer` consumes it. In `ProjectDetail.tsx:38-43`, short-circuit `setReport(null)` if the loaded JSON has `_placeholder === true` so the page falls back to `MeshViewer` with the GLB.
- **VALIDATE**: `tsc --noEmit` clean. Navigate to a placeholder project — page loads, no console errors.

### Task 10: Verify the empty-state of `SitesNeedingAttention`
- **ACTION**: Read-only check at `Monitoring.tsx:142-191`.
- **IMPLEMENT**: nothing — filter at `:143-145` already returns 0 entries when all rows are `ready`.
- **VALIDATE**: `/app/monitoring` shows `0` next to the heading and "Every site is in good shape."

### Task 11: Pause for user-pasted report JSONs (video_4/5/6)
- **ACTION**: STOP and ask the user to paste `household.json`, `star_grocer.json`, `rainbow.json` into `frontend/src/data/reports/`.
- **IMPLEMENT (second pass after paste)**: for each JSON read `systemSummary.systemCapacity`, `energyProduction.annualTotal`, `financial.annualSavings`, `financial.paybackPeriod`, `systemSummary.totalPanels`; update (a) the migration insert, (b) `seed.sql`, (c) `MOCK_PROJECTS`. Replace the `0, 0, 0, 0, 0` placeholders. Re-apply migration or run `update projects set ... where id='22222222-...';` per row.
- **GOTCHA**: JSON values are quoted strings with units. Parse helper:
  ```ts
  const num = (s: string) => parseFloat(String(s).replace(/[^0-9.\-]/g, ""));
  const mwhToKwh = (s: string) => num(s) * 1000;
  ```
- **VALIDATE**: every Clients card shows non-zero kWp/yield/savings.

---

## Testing Strategy

### Manual smoke-test matrix
| Path | Expected |
|---|---|
| `/app/monitoring` | Header `5 sites · live`. SSU+Eco totals: 181.1 kWp, 253 MWh, RM 37,043 (until other 3 JSONs land). Attention list shows `0` and empty-state copy. |
| `/app/clients` | 5 cards in order SSU, Star Grocer, Rainbow, Household, Eco Horizon. Thumbnails are the real building images. 3D GLB rotates on each card. |
| `/app/projects/11111111-...` (SSU) | Title `SSU UM No.2 Electrical Substation`. Lat/lon `3.1281, 101.6510`. MeshViewer renders the GLB. Open-in-simulator href contains `lat=3.128080&lng=101.651010&usage=5000&tariff=commercial_lv`. |
| `/app/projects/44444444-...` (Household) | Page loads. Report placeholder → MeshViewer fallback. Open-in-simulator URL contains `usage=600&tariff=domestic`. |
| Cold reload with Supabase offline | MOCK_PROJECTS fallback fires; same 5 cards render. |

### Edge Cases Checklist
- [ ] `modelGlbPath` absolute URL where `solar.limziyang.ml` doesn't set CORS — Mini3DPreview shows the `<img>` thumbnail + Loading badge; `console.warn` surfaces the failure.
- [ ] `modelGlbPath` is `null` (legacy row) — falls back to `<RoofScene>` as today.
- [ ] `tariffType` stored as display string `"Domestik (Rumah)"` — `tariffCode()` maps to `domestic` before the deep-link.
- [ ] User navigates to a deleted row's URL — existing `Project not found.` empty state covers it.
- [ ] React-Query cache is stale after reseed — soft-reload fetches fresh; otherwise `queryClient.invalidateQueries({ queryKey: ['projects'] })`.

---

## Validation Commands

### Static Analysis
```bash
cd frontend && npx tsc --noEmit
```
EXPECT: zero errors.

### Lint
```bash
cd frontend && npm run lint
```
EXPECT: no new errors.

### Local dev (manual UI verify)
```bash
cd frontend && npm run dev
```
EXPECT: `/app/clients` shows 5 cards; each `*.glb` request in Network tab goes to `solar.limziyang.ml`.

### Supabase migration
```bash
# Local stack:
npx supabase db reset
# Remote (via MCP):
# mcp__supabase__apply_migration name="0004_replace_projects_seed"
```
EXPECT: `select count(*) from projects where owner_id = '63f727fb-1514-4acc-9202-46df12d06093'` returns `5`.

### Production build
```bash
cd frontend && npm run build && npm run preview
```
EXPECT: build succeeds; preview matches dev.

### Manual deep-link verification
- [ ] Click "Open in simulator" on each of the 5 detail pages.
- [ ] Confirm simulator wizard pre-fills with the right lat/lng/usage/tariff.
- [ ] Confirm the GLB loaded in the simulator matches the one shown on the project page.

---

## Acceptance Criteria
- [ ] Supabase `projects` table contains exactly 5 rows for `dev_owner`, matching the table above.
- [ ] `MOCK_PROJECTS` array length is 5.
- [ ] `/app/monitoring` "Sites needing attention" count = 0.
- [ ] `/app/clients` renders 5 cards, each with non-empty `thumbnailUrl` rendered as `<img>` and a working 3D preview from the external GLB.
- [ ] Every "Open in simulator" anchor passes `model`, `lat`, `lng`, `usage`, `tariff` URL params.
- [ ] `grep -r` returns empty for `Setia Alam`, `Link House`, `Corner Lot`, `Surau Rooftop Pilot`, `Triple Shoplot`, `4-storey Office Block` inside `frontend/src` and `supabase/`.
- [ ] No hard-coded numbers in component code — every kWp/yield/savings is read from `Project` (sourced from Supabase or `MOCK_PROJECTS` → `CASE_STUDY_BUILDINGS` + report JSONs).

## Completion Checklist
- [ ] Code follows discovered patterns (camelCase TS ↔ snake_case DB, `rowToProject` mapper, `useSignedUrl` for storage paths, plain URL for absolute).
- [ ] All `_placeholder: true` report JSONs replaced with user-pasted exports before merge.
- [ ] `buildSimulatorUrl` is the single source for the deep-link.
- [ ] Mini3DPreview gracefully handles CORS failures (Loading badge persists + thumbnail visible).
- [ ] Migration reversible (`delete from projects where id in ('11111111-...', ...)`).

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `solar.limziyang.ml` lacks CORS headers for `.glb`/`.png` | Med | High — 3D previews silently fail | Test in browser; if fails, add `Access-Control-Allow-Origin: *` on the nginx, or proxy through `vite.config.ts` server.proxy in dev + a Cloudflare Worker in prod |
| Old rows stored `tariffType` as display string | Med | Med — simulator ignores `tariff=Domestik+(Rumah)` | `tariffCode()` mapper inside `buildSimulatorUrl` |
| Destructive `delete from projects where owner_id = dev_owner` wipes real work | Low (it's the dev account) | High if any | Pre-check: `select id, name from projects where owner_id = dev_owner;` and confirm with user before running |
| `useGLTF` memory growth on long demos | Low | Low | Existing `useMemo(scene clone)` mitigates |
| User-pasted JSON has different schema than `ssu_um.json` | Med | Med | Task 11 parser is unit-aware; surface diff to user before merge |

## Notes
- Keep `__SIMULATOR_URL__` as the single base; do not hard-code `https://solar.limziyang.ml` outside `vite.config.ts:8-11`.
- Fixed UUIDs are deliberately readable so deep-links remain stable across reseeds.
- Once 3 pending report JSONs land, consider auto-generating `monthlyKwh[12]` from `energyProduction.monthlyAvg` — Sparkline + Yield-vs-Target both benefit.
- If user prefers string IDs (`PRJ-CS-SSU-UM`) over UUIDs, schema doesn't allow it (column is `uuid`). Separate migration needed.
