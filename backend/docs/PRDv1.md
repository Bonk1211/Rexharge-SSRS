# RexCharge Solar Layout Studio — PRD v1.0

**Version:** v1.0 · **Date:** 2026-05-05 · **Team:** 4 · **Cycle:** 20 days · **Repo:** `Rexcharge-frontend/3d-generator/`

> *v1.0 supersedes v0 (parametric form-driven roof generator). v0 took typed dimensions and produced a hip-roof GLB; v1 ingests real photos or drone imagery, reconstructs the actual roof, and ships the full layout-to-yield-to-PDF pipeline.*

---

## 1. Executive Summary

A web app that turns rooftop photos or drone imagery into an optimised PV layout, an annual yield estimate, and an engineering PDF, in under three minutes per site.

Three core mechanisms:
1. **Dual-intake reconstruction** — Meshroom photogrammetry for handheld photos; DJI Terra OBJ ingest or ODM for drone captures. Same downstream mesh format, same simulation core.
2. **Geometry-aware layout** — Open3D RANSAC plane segmentation + greedy grid packer + per-panel shading raycast against the actual reconstructed mesh. No flat-roof assumption.
3. **Malaysia-grounded yield** — pvlib + PVGIS TMY for the site's lat/long, Trina Vertex N thermal model at 50°C cell temp, TNB tariff blocks, ATAP NEM 3.0 sell-back.

> *PVsyst-driven design takes a Malaysian EPC engineer 1–3 hours per residential roof — measure, CAD, mark obstacles, simulate, write up. RexCharge does the same job in under 3 minutes from drone footage, end-to-end, with a downloadable PDF.*

---

## 2. Problem Statement

Malaysia's ATAP rollout depends on EPC designers producing accurate kWp + kWh yield projections per rooftop. The incumbent workflow — manual measurement, CAD drafting, PVsyst simulation, written report — burns **1–3 engineer-hours per residential project** and longer for commercial. At RM 80–150/hour blended cost, every 1,000-roof pipeline carries **RM 80k–450k of avoidable design labour**, and human estimation errors translate directly into module count mismatches and revised quotes after site visits.

The market gap: no tool that takes a drone capture and outputs a contract-ready layout + yield + bill-savings PDF without an engineer in the loop.

---

## 3. Goals & Judging Alignment

| Theme 3 deliverable | How v1 addresses it |
|---|---|
| Generates optimised panel layout from uploaded roof image | `panel_packer.py` runs on segmented planes from real reconstructed mesh — not a 2D pixel mask |
| Calculates total installed capacity (kWp) with 620 W panels | Configurable in `panel_packer.py`; default Trina Vertex N 620 W bifacial |
| Estimates annual energy yield with Malaysian irradiance data | `solar_optimizer.calculate_poa()` pulls PVGIS TMY for site lat/long, caches to `backend/data/tmy_{lat}_{lon}.csv` |
| Optimisation logic respects spacing + obstacle constraints | Shapely buffer at 0.4 m edge / 0.5 m obstacle; greedy grid pack per plane polygon |
| Detects usable roof boundaries from image | Open3D RANSAC plane fit on upward-normal face cluster |
| Identifies obstacles via image processing | Heightmap diff vs roof plane (≥ 0.15 m → obstacle); not 2D segmentation, full 3D |
| User-defined north orientation | `CompassWidget.jsx` quaternion overlay + EXIF GPS bearing prefill |

---

## 4. Feature Scope

| # | Feature | Status | Priority |
|---|---|---|---|
| F1 | Photo intake (Meshroom photogrammetry) | ships v1 | P0 |
| F2 | Drone intake (DJI Terra OBJ + ODM fallback + MP4 frame extract) | ships v1 | P0 |
| F3 | Demo-mode shortcut (pre-baked GLB from `data/*.PNG`) | ships v1 | P0 |
| F4 | Mesh calibration (scale + true north) | ships v1 | P0 |
| F5 | Roof plane segmentation (Open3D RANSAC) ⭐ | ships v1 | P0 |
| F6 | Obstacle detection (heightmap diff) | ships v1 | P0 |
| F7 | Greedy grid panel packer | ships v1 | P0 |
| F8 | Per-panel shading raycast ⭐ | ships v1 | P0 |
| F9 | pvlib yield engine with Malaysia thermal derate | v0 ships, v1 extends | P0 |
| F10 | TNB tariff + ATAP NEM 3.0 bill engine | ships v1 | P0 |
| F11 | WeasyPrint PDF report with Playwright snapshots | ships v1 | P0 |
| F12 | react-three-fiber viewer with sun-path animation | v0 ships viewer, v1 extends | P0 |
| F13 | Live parameter slider (setback, gap, tilt) | ships v1 | P1 |
| F14 | Parametric fallback (existing `model_generator.py`) | v0 ships | P2 |

---

## 5. Feature Detail

### F1 — Photo Intake (Meshroom)

`backend/workers/photogrammetry.py` → `POST /api/projects/{id}/intake/photos`

Accepts a zip of 10–25 JPEG/PNG photos, validates with PIL, dedupes by SHA-256, enqueues a Celery job that shells out to `meshroom_batch -i ./inputs -o ./output`. GPU job runs ~8 min on RTX 3060; CPU fallback ~25 min. Output `texturedMesh.obj` is converted via Open3D to decimated `model.glb` ≤ 25 MB. Cache key = SHA-256 of sorted-zip bundle, so repeat uploads hit cache in < 200ms.

| Sub-step | Implementation |
|---|---|
| Upload | FastAPI `multipart/form-data`, capped 500 MB |
| Validation | `PIL.Image.verify()` + EXIF probe |
| Job enqueue | Celery task `reconstruct_from_photos` with bundle hash as idempotency key |
| Reconstruction | Meshroom CLI primary; ODM Docker fallback on Meshroom non-zero exit |
| Mesh cleanup | Open3D quadric decimation to ≤ 100k faces |
| Side effect | Writes `minio://projects/{id}/mesh/model.glb`, sets `project.mesh_status = ready` |

Falls back to ODM (`opendronemap/odm:latest`) if Meshroom exits non-zero — same OBJ output schema, downstream code is engine-agnostic.

### F2 — Drone Intake (Three Sub-paths) ⭐

`backend/workers/drone.py` → `POST /api/projects/{id}/intake/drone`

Three sub-paths, all converging on the same `model.glb`:

| Sub-path | Trigger | Pipeline |
|---|---|---|
| `drone:images` | zip of geotagged JPEGs | Same as F1 but EXIF GPS pre-fills lat/long + scale; no manual calibration needed |
| `drone:video` | `.mp4` upload | `ffmpeg -i in.mp4 -vf fps=1 frame_%04d.jpg` → drop into `drone:images` path |
| `drone:terra` | zip of `model.obj + .mtl + texture.png + .tfw` from DJI Terra | Skip photogrammetry; `pyproj` reprojects `.tfw` from UTM 47N/48N to WGS84; mesh ready in ~5s |

The `drone:terra` sub-path is the recommended live-demo input — completes the entire pipeline (mesh load → layout → yield → PDF) in **< 30 seconds** because reconstruction is offloaded to operator's laptop.

### F3 — Demo Mode

`frontend/src/pages/Intake.jsx` → button `Use sample site (Bukit Jalil)`

Loads `backend/outputs/demo_bukit_jalil.glb` (pre-baked from existing `data/*.PNG` 11-shot drone set). Skips reconstruction entirely. Total time-to-PDF on demo mode: **< 9 seconds**, reproducible on any laptop.

### F4 — Calibration

`backend/pipeline/calibration.py` → `POST /api/projects/{id}/calibrate`

Two-axis calibration: scale + heading.

| Input | Source |
|---|---|
| Metric scale | Drone EXIF GPS + altitude → known GSD; OR user clicks 2 mesh points + types real distance (m) |
| True north | Drone EXIF GPS bearing across photo set; OR `CompassWidget.jsx` quaternion drag |

Writes `project.scale_meters_per_unit` and `project.north_quaternion` to Postgres. Mesh is rotated and unit-scaled in `bpy` headless before downstream stages.

### F5 — Roof Plane Segmentation ⭐

`backend/pipeline/roof_segmenter.py` → invoked after calibrate

Open3D `segment_plane(distance_threshold=0.05, ransac_n=3, num_iterations=1000)` iterated until residual point set < 1000. Filters to upward-facing planes via `normal · ẑ > 0.7`. Each plane's inlier point cloud → α-shape polygon (alphashape α=0.5) → real-world area.

| Plane | Filter | Output |
|---|---|---|
| Upward | normal · ẑ > 0.7 | kept |
| Vertical (walls) | \|normal · ẑ\| < 0.2 | dropped |
| Tiny | area < 5 m² | dropped (< 1 panel won't fit) |
| Overhang | extends beyond building footprint convex hull | dropped |

Writes `project.roof_planes[]` as JSON: `{plane_id, normal, polygon_2d, area_m2, tilt_deg, azimuth_deg}`.

### F6 — Obstacle Detection

`backend/pipeline/obstacle_detector.py`

For each roof plane, projects all mesh points within 2 m above the plane onto plane-local 2D coords. Anything ≥ 0.15 m above plane surface clusters via DBSCAN (eps=0.3) → obstacle polygon. Catches water tanks, parapets, rooftop AC compressors, vent stacks.

Writes `project.obstacles[]` as `{plane_id, polygon, height_m, type:auto}`. UI lets user reclassify or add manual polygons.

### F7 — Greedy Grid Panel Packer

`backend/pipeline/panel_packer.py` → `POST /api/projects/{id}/layout`

Per roof plane, in plane-local 2D:

| Rule | Default | Source |
|---|---|---|
| Module dimensions | 2.4 m × 1.3 m | Trina Vertex N 620 W bifacial spec |
| Edge setback | 0.4 m | UBBL fire access requirement |
| Obstacle setback | 0.5 m | conservative shading + maintenance buffer |
| Inter-row gap | 0.05 m portrait | flush-mount; rows tilt with roof |
| Flat-roof tilt | 10° south-facing | low-tilt for Malaysia 3°N latitude |
| Flat-roof row spacing | computed from winter solstice 9 AM sun elevation | no-shade-on-neighbour rule |

Greedy grid: rotate panel grid by plane azimuth, sweep rows aligned to longest plane edge, drop any panel whose polygon intersects (edge buffer ∪ obstacle buffer). Output: `project.panels[]` as `[{center_xyz, tilt, azimuth, plane_id}, ...]`.

Total kWp = `len(panels) × 0.620`. Updates live (debounced 300ms) when user changes setback/gap/module sliders in `frontend/src/pages/RoofAnalysis.jsx`.

### F8 — Per-Panel Shading Raycast ⭐

`backend/shading_engine.py`

For each panel, samples 8 sun positions/day across a TMY year (2920 rays/panel). `trimesh.ray.RayMeshIntersector` against the full reconstructed mesh. Per-panel shading factor = Σ(unblocked-ray DNI) / Σ(all-ray DNI).

Vectorised: 50 panels × 2920 rays = 146k raycasts in **~1.8 s** on M1 Pro. Result cached at `minio://projects/{id}/shading.npz`.

This is what differentiates v1 from v0's flat assumption. v0 assumed unobstructed plane irradiance; v1 catches the actual shadow cast by, e.g., a parapet onto the southwest panels at 4 PM.

### F9 — pvlib Yield Engine (extended from v0)

`backend/solar_optimizer.py` (existing, extended)

| Function | v0 status | v1 change |
|---|---|---|
| `get_irradiance_data(lat, lon)` | ships PVGIS TMY + clear-sky fallback | unchanged |
| `calculate_poa(lat, lon, tilt, azimuth)` | ships Perez transposition | unchanged, called per panel |
| `calculate_pr_details(tilt_deg)` | ships Malaysia thermal derate (cell 50°C, Trina temp coef 0.29%/°C, soiling 2-5%, wiring 2%, mismatch 2%, inverter 1.4%) | unchanged |
| `simulate_yield(panels, shading_factors)` | did not exist | v1 ships — multiplies POA × shading × 0.620 kWp × hours per panel, sums to annual kWh |

Annual kWh runs across all panels in **< 700 ms** (panels share the same TMY dataframe).

### F10 — TNB Tariff + ATAP NEM Bill Engine

`backend/bill_engine.py` → invoked after yield

| Tariff | Rate | Source |
|---|---|---|
| TNB Domestic block 1 (1–200 kWh) | RM 0.218/kWh | TNB 2024 published |
| TNB Domestic block 2 (201–300) | RM 0.334 | |
| TNB Domestic block 3 (301–600) | RM 0.516 | |
| TNB Domestic block 4 (601–900) | RM 0.546 | |
| TNB Domestic block 5 (901+) | RM 0.571 | |
| TNB Non-Domestic LV | RM 0.435 flat | typical commercial |
| ATAP NEM 3.0 export rate | RM 0.30/kWh | System Marginal Price proxy, configurable via `env: ATAP_SMP_RM` |

Self-consumption assumption: residential 60%, commercial 80% (override via uploaded load profile CSV). Computes monthly bill before/after, annual savings, payback at RM 4,500/kWp CAPEX (`env: CAPEX_RM_PER_KWP`).

### F11 — PDF Report

`backend/report.py` → `GET /api/projects/{id}/report.pdf`

WeasyPrint renders `templates/report.html` (Tailwind print stylesheet). 3D scene snapshots captured by Playwright headless against `http://frontend/projects/{id}/viewer?snapshot=true`. Pages in order: cover (site photo + iso 3D render) → executive summary (kWp, kWh/yr, RM/yr, payback) → site analysis (planes + obstacles top-down) → layout (top-down + iso) → monthly yield bar chart → financial table → assumptions appendix (cites PVGIS, TNB tariff date, ATAP SMP, CAPEX assumption).

Renders in **~4 s** for a typical 50-panel report.

### F12 — react-three-fiber Viewer (extended from v0)

`frontend/src/components/MeshViewer.jsx` (existing, extended)

v0 displayed parametric hip-roof + flat panel grid. v1 ships:

| Layer | Toggle |
|---|---|
| Reconstructed mesh (textured GLB) | base |
| Roof plane polygons (semi-transparent green) | toggle |
| Obstacle polygons (semi-transparent red) | toggle |
| Panel meshes (blue, tilted to plane) | toggle |
| Per-panel shading heatmap (colour-mapped 0–1 factor) | toggle |
| Sun-path arc (24 h, draggable scrubber) | toggle |
| North arrow | always |

All driven by drei's `<Html>`, `<Sky>`, and a custom `<SunPath>` from `@react-three/drei` examples.

### F13 — Live Parameter Sliders

`frontend/src/pages/RoofAnalysis.jsx`

Setback (0.2–1.0 m), gap (0–0.2 m), module size, tilt assumption. Slider change → debounced 300 ms → `POST /api/projects/{id}/layout` → viewer re-renders. Backend hot-path runs in **< 400 ms p95** because shading factors are pre-cached and only the packer rerun.

### F14 — Parametric Fallback

`backend/model_generator.py` (v0, untouched)

Kept as a `?mode=parametric` route for users without photos. v0 form (length/width/height/pitch/porch) still works end-to-end. Useful for sales pre-quotes before site survey.

---

## 6. User Flow

```
[User] -> /new
   |
   ├─ Step 1: Site setup
   │     ├─ Pin map -> lat/long
   │     ├─ TNB tariff: Domestic | Non-Domestic LV
   │     └─ Monthly bill (RM)
   │
   ├─ Step 2: Intake (tabs)
   │     ├─ Photos       -> POST /api/projects/{id}/intake/photos    ──── Celery: meshroom_batch
   │     ├─ Drone images -> POST /api/projects/{id}/intake/drone     ──── Celery: meshroom + EXIF parse
   │     ├─ Drone video  -> POST /api/projects/{id}/intake/drone     ──── ffmpeg fps=1 -> meshroom
   │     ├─ DJI Terra    -> POST /api/projects/{id}/intake/drone     ──── pyproj reproject (skip recon)
   │     └─ Demo site    -> load pre-baked GLB                       ──── < 9 s total
   │
   │     ▼ SSE progress stream
   │
   ├─ Step 3: Calibrate
   │     ├─ Auto-prefill from EXIF if available
   │     ├─ User: 2-click distance OR confirm
   │     └─ User: drag compass arrow OR confirm
   │             -> POST /api/projects/{id}/calibrate
   │
   ├─ Step 4: Roof analysis (auto-runs)
   │     ├─ pipeline/roof_segmenter.py    -> project.roof_planes[]
   │     ├─ pipeline/obstacle_detector.py -> project.obstacles[]
   │     └─ User edits obstacle polygons
   │
   ├─ Step 5: Layout (live)
   │     ├─ pipeline/panel_packer.py      -> project.panels[]
   │     ├─ shading_engine.py             -> per-panel factors (cached)
   │     ├─ solar_optimizer.simulate_yield -> annual kWh
   │     ├─ bill_engine.py                -> RM/year, payback
   │     └─ Sliders re-trigger packer (debounced 300ms)
   │
   └─ Step 6: Report
         └─ GET /api/projects/{id}/report.pdf -> WeasyPrint + Playwright
```

---

## 7. Tech Stack

| Service | Role |
|---|---|
| React 18 + Vite + Tailwind + shadcn/ui | Frontend shell, wizard, dashboard |
| react-three-fiber + drei | 3D viewer, sun path, layered overlays |
| FastAPI + Pydantic v2 (Python 3.12, uv) | API gateway, project CRUD |
| Celery + Redis | Long-running reconstruction jobs |
| PostgreSQL | Project + panel + plane state |
| minio (S3-compatible) | Photos, meshes, shading caches, PDFs |
| Meshroom 2023.3 (CLI, AliceVision) | Primary photogrammetry engine |
| OpenDroneMap (Docker `opendronemap/odm`) | Fallback photogrammetry |
| DJI Terra (operator-side) | Highest-quality drone reconstruction; uploaded as OBJ bundle |
| Open3D 0.18 | RANSAC plane fit, mesh decimation, point cloud ops |
| trimesh 4.5 + RayMeshIntersector | Per-panel shading raycast |
| Blender 4.x `bpy` (headless) | Pretty cover-page render for PDF |
| pvlib 0.11 + PVGIS TMY | Solar position, Perez POA, Malaysia TMY |
| pyproj | UTM ↔ WGS84 reprojection for drone georef |
| WeasyPrint + Playwright | HTML→PDF report + viewer screenshots |
| ffmpeg | Drone video frame extraction (1 fps) |
| Docker Compose | Local demo orchestration |

---

## 8. Architecture Overview

```
[Browser: React + r3f]
   │
   │ HTTPS
   ▼
[FastAPI: backend/main.py]
   ├─ /api/projects                       -> Postgres (projects, panels, planes)
   ├─ /api/projects/{id}/intake/photos    -> minio raw upload + Celery enqueue
   ├─ /api/projects/{id}/intake/drone     -> sub-path dispatch (images/video/terra)
   ├─ /api/projects/{id}/calibrate        -> pipeline/calibration.py
   ├─ /api/projects/{id}/analyze          -> roof_segmenter + obstacle_detector
   ├─ /api/projects/{id}/layout           -> panel_packer + shading_engine + solar_optimizer + bill_engine
   ├─ /api/projects/{id}/stream           -> SSE progress events from Redis pubsub
   ├─ /api/projects/{id}/report.pdf       -> report.py (WeasyPrint + Playwright snapshot)
   └─ /models/{file}                      -> minio passthrough (existing v0 endpoint)
   │
   ▼ enqueue
[Celery worker: backend/workers/]
   ├─ photogrammetry.py    -> Meshroom CLI -> Open3D cleanup -> minio mesh/model.glb
   ├─ drone.py             -> ffmpeg | pyproj | Meshroom | ODM
   └─ snapshot.py          -> Playwright headless -> minio reports/cover.png
   │
   ▼ pubsub
[Redis] ─── progress events ───┐
   │                            │
   ▼                            ▼
[Postgres]                 [SSE to browser]

[minio]
   ├─ projects/{id}/raw/*.jpg
   ├─ projects/{id}/mesh/model.glb
   ├─ projects/{id}/shading.npz
   ├─ projects/{id}/data/tmy_{lat}_{lon}.csv  (cached PVGIS)
   └─ projects/{id}/reports/report.pdf
```

---

## 9. Demo Script

**Total: 3 min 30 s**

### Opening (30 s)

Show two browser tabs side-by-side: PVsyst on the left (open project, manual roof drawing in CAD), RexCharge on the right (login screen).

> *"A Malaysian EPC engineer takes 1–3 hours per residential roof in PVsyst. Watch us do the same job in 9 seconds."*

### Act 1 — Demo-mode end-to-end (1 min)

Click `New Project` → pin Bukit Jalil on map → tariff `Domestic`, monthly bill `RM 480` → click `Use sample site`.

Pre-baked GLB loads in viewer in < 5 s. Roof analysis auto-runs: 2 planes detected (south-facing main + west-facing porch), 1 water-tank obstacle flagged red. Layout pops: **38 panels, 23.5 kWp**.

Right panel updates live: **31,240 kWh/year, RM 12,800/year saved, 4.2-year payback, 25-year ROI 480%**.

> *"This took 9 seconds. Every number is from pvlib running on PVGIS TMY data for that exact lat/long."*

### Act 2 — Live drone upload (1 min 30 s)

Switch to `New Project` → upload a 38 MB DJI Terra OBJ bundle (commercial site, captured this morning).

Mesh loads in 7 s — full textured rooftop. Calibration auto-fills from `.tfw` georeference. Roof analysis runs: **4 planes, 3 obstacles** (HVAC compressor, parapet wall, vent stack).

Layout: **84 panels, 52.1 kWp, 70,360 kWh/year, RM 28,930/year saved, 3.8-year payback**.

Toggle shading heatmap → southwest corner panels glow yellow (parapet shadow at 4 PM). Drag sun-path scrubber from sunrise to sunset; watch the parapet shadow sweep across 4 panels between 14:00 and 17:00.

> *"This is what's wrong with flat-irradiance assumptions — those 4 panels lose 11% annual yield to a 1.2 m parapet. PVsyst will not catch this without a manual 3D model that takes another hour to build."*

### Act 3 — Slider + report (1 min)

Drag `obstacle setback` from 0.5 m to 0.8 m → 4 panels disappear → kWp drops to 49.6 → RM/year drops to RM 27,490. Drag back. Drag `module size` from 620 W to 550 W → panel count rises to 92 but kWp drops to 50.6.

Click `Download PDF`. PDF opens in 4 s — 8-page engineering report with iso render, monthly yield chart, panel schedule, financial table, assumptions appendix citing PVGIS, TNB 2024 tariff, RM 4,500/kWp CAPEX.

### Close (30 s)

> *"PVsyst takes 1–3 hours. RexCharge takes 9 seconds for cached sites, 30 seconds for fresh drone uploads, 8 minutes including photogrammetry from raw photos. Same physics, faster delivery, contract-ready PDF."*

---

## 10. Solar Math Reference

| Step | Formula / call | File |
|---|---|---|
| Solar position | `pvlib.solarposition.get_solarposition(times, lat, lon)` | `solar_optimizer.py` |
| Plane-of-array | `pvlib.irradiance.get_total_irradiance(...)` Perez transposition | `solar_optimizer.calculate_poa()` |
| Cell temp derate | `temp_loss = (50 - 25) × 0.0029 = 7.25%` | `solar_optimizer.calculate_pr_details()` |
| Soiling | `0.02 + 0.03 × max(0, 1 - tilt/10)` | `solar_optimizer.calculate_pr_details()` |
| Inverter loss | `0.014` (Sigen 98.6% efficiency) | `solar_optimizer.calculate_pr_details()` |
| PR | `1 - soil - temp - mismatch - wiring - inverter` | `solar_optimizer.calculate_pr_details()` |
| Per-panel shading | `Σ(unblocked DNI) / Σ(total DNI)` over 2920 ray samples | `shading_engine.py` |
| Annual kWh | `Σ_panels Σ_hours (POA × shading × 0.620 × PR)` | `solar_optimizer.simulate_yield()` |
| Bill saving | `Σ_months (bill_before(kWh_grid) - bill_after(kWh_grid - kWh_self))` + `kWh_export × ATAP_SMP` | `bill_engine.py` |
| Payback | `kWp × 4500 / annual_RM_savings` | `bill_engine.py` |

---

## 11. Schema

`backend/schema.sql`:

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  tariff TEXT NOT NULL CHECK (tariff IN ('domestic', 'non_domestic_lv')),
  monthly_bill_rm NUMERIC(10,2),
  capex_rm_per_kwp NUMERIC(10,2) DEFAULT 4500,
  intake_mode TEXT CHECK (intake_mode IN ('photos','drone_images','drone_video','drone_terra','demo','parametric')),
  mesh_status TEXT DEFAULT 'pending',
  scale_meters_per_unit DOUBLE PRECISION,
  north_quaternion DOUBLE PRECISION[],
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE roof_planes (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  normal DOUBLE PRECISION[3],
  polygon_2d JSONB,            -- [[x,y], ...] in plane-local
  area_m2 NUMERIC(10,2),
  tilt_deg NUMERIC(5,2),
  azimuth_deg NUMERIC(6,2)
);

CREATE TABLE obstacles (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  plane_id UUID REFERENCES roof_planes(id),
  polygon_2d JSONB,
  height_m NUMERIC(5,2),
  type TEXT,
  source TEXT CHECK (source IN ('auto','user'))
);

CREATE TABLE panels (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  plane_id UUID REFERENCES roof_planes(id),
  center_xyz DOUBLE PRECISION[3],
  tilt_deg NUMERIC(5,2),
  azimuth_deg NUMERIC(6,2),
  watt INTEGER DEFAULT 620,
  shading_factor NUMERIC(5,4)
);

CREATE TABLE simulations (
  project_id UUID PRIMARY KEY REFERENCES projects(id),
  total_kwp NUMERIC(8,2),
  annual_kwh NUMERIC(12,2),
  annual_savings_rm NUMERIC(10,2),
  payback_years NUMERIC(5,2),
  monthly_kwh JSONB,           -- [jan, feb, ...]
  computed_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 12. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Meshroom slow / fails on demo laptop | Pre-baked GLB at `backend/outputs/demo_bukit_jalil.glb`; `Use sample site` button skips Celery entirely |
| Photogrammetry fails on poor photos | Meshroom non-zero exit triggers ODM fallback in `workers/photogrammetry.py:_fallback_engine()` |
| Photo scale ambiguous (Tab A) | Mandatory 2-click calibration in `Calibrate.jsx`; refuses to advance until `scale_meters_per_unit` set |
| DJI Terra license unavailable | OBJ ingest path treats DJI Terra as one of three input formats; ODM Docker is free path |
| Large mesh (>200 MB) hangs browser | Open3D quadric decimation in `mesh_cleanup.py` enforces ≤ 100k faces / ≤ 25 MB GLB before serving viewer |
| Shading raycast too slow | 8 samples/day not 24; vectorised `RayMeshIntersector`; results cached at `minio://projects/{id}/shading.npz` keyed on mesh+panel hash |
| PVGIS endpoint down | `solar_optimizer.get_irradiance_data()` falls back to `pvlib.location.Location.get_clearsky()` Ineichen model — deterministic, offline-safe |
| TNB tariff stale | Rates in `bill_engine.TNB_DOMESTIC_BLOCKS` dict, cited with date; appendix in PDF prints source date so judges see what we used |
| Roof segmentation noisy on complex geometry | RANSAC distance threshold 0.05 m + min 1000 inliers; failed plane → user draws polygon manually in `RoofAnalysis.jsx` |
| Demo network drops | Docker Compose fully local; PVGIS TMY pre-cached at `backend/data/tmy_3.06_101.66.csv`; no external calls during demo |

---

## 13. Success Metrics

| Metric | Target |
|---|---|
| Demo-mode time-to-PDF (cached GLB) | p50 < 9 s, p95 < 15 s |
| Drone Terra upload time-to-PDF | p50 < 30 s, p95 < 60 s |
| Photo-set time-to-PDF (10 photos, GPU) | p50 < 8 min, p95 < 12 min |
| Photo-set time-to-PDF (10 photos, CPU fallback) | p50 < 25 min |
| Layout slider response (setback/gap/module change) | p95 < 400 ms |
| Shading raycast (50 panels × 2920 rays) | p50 < 2 s |
| Mesh viewer FPS (50-panel scene, M1 Pro) | ≥ 50 fps |
| Annual kWh accuracy vs PVsyst on benchmark site | within ±8% |
| Roof plane detection recall on demo dataset | ≥ 90% of human-annotated planes |
| PDF generation | p50 < 4 s, p95 < 8 s |

---

## 14. Endpoints Cheat Sheet

| Method | Path | Handler |
|---|---|---|
| POST | `/api/projects` | `main.create_project` |
| GET | `/api/projects/{id}` | `main.get_project` |
| POST | `/api/projects/{id}/intake/photos` | `main.intake_photos` → `workers.photogrammetry.reconstruct_from_photos` |
| POST | `/api/projects/{id}/intake/drone` | `main.intake_drone` → `workers.drone.dispatch` (sub-path on payload type) |
| GET | `/api/projects/{id}/stream` | `main.sse_progress` |
| POST | `/api/projects/{id}/calibrate` | `main.calibrate` → `pipeline.calibration.apply` |
| POST | `/api/projects/{id}/analyze` | `main.analyze` → `roof_segmenter` + `obstacle_detector` |
| POST | `/api/projects/{id}/layout` | `main.layout` → `panel_packer` + `shading_engine` + `solar_optimizer.simulate_yield` + `bill_engine` |
| GET | `/api/projects/{id}/report.pdf` | `main.report` → `report.render` |
| POST | `/generate-model` | `main.create_model` (v0 parametric, retained) |
| GET | `/models/{filename}` | `main.get_model` (v0, retained) |

---

## 15. Version Diff

| Area | v0 (current `3d-generator/` repo, commit `46612f0`) | v1 (this PRD) |
|---|---|---|
| Intake | typed dimensions only (`length`, `width`, `height`, `pitch`, `porch_*`) | photos / drone images / drone video / DJI Terra OBJ / demo / parametric (kept as fallback) |
| Roof model | parametric hip-roof generator (`model_generator._hip_roof`) | reconstructed mesh from photogrammetry |
| Roof segmentation | n/a (parametric, planes known a priori) | Open3D RANSAC on real point cloud |
| Obstacle detection | hardcoded porch box from form | heightmap diff above plane, DBSCAN clustering |
| Panel layout | grid on 2 known parametric faces | greedy grid pack on N detected planes with edge + obstacle setback |
| Shading | shapely 2D polygon shadow zones (`_add_shadow_meshes`) | 3D raycast per panel × 2920 sun samples against actual mesh |
| Yield | `solar_optimizer.calculate_poa()` per plane (already ships PVGIS + Perez + Malaysia thermal derate) | extended: `simulate_yield(panels, shading_factors)` aggregates per-panel POA × per-panel shading |
| Bill calc | not in repo | `bill_engine.py` with TNB Domestic/Non-Domestic blocks + ATAP NEM 3.0 |
| Report | not in repo | WeasyPrint + Playwright snapshots, 8-page engineering PDF |
| Frontend | single-page form + 3D viewer | wizard (Intake → Calibrate → Analyse → Layout → Report) + project list |
| Storage | local `backend/outputs/*.glb` written directly | minio S3-compatible, mesh + shading + reports + cached TMY |
| Jobs | synchronous `generate_model` | Celery + Redis for reconstruction; SSE progress stream |
| North alignment | n/a (axis-aligned by construction) | EXIF GPS prefill + `CompassWidget.jsx` quaternion drag |
| Scale | n/a (parametric) | EXIF altitude OR 2-click + distance |
