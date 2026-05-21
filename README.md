# Rexcharge

Solar planning demo. Drone photos → 3D bungalow model → browser viewer with panel layout + yield estimates. Stack: React/Vite frontend, FastAPI backend, Supabase persistence, Hunyuan3D for mesh generation.

---

## Repo Layout

```
Rexcharge-frontend/
├── frontend/           # Vite + React + TS + Tailwind + R3F dashboard
├── backend/            # FastAPI + trimesh + pvlib procedural model + Hunyuan3D scripts
├── client-dashboard/   # Built dashboard artifact (dist only)
├── supabase/           # SQL migrations + seed
├── Agent.md            # Phase 1/2 build plan (Hunyuan3D feasibility → viewer)
├── IMPLEMENTATION.md   # Frontend ↔ Supabase wiring spec
└── HANDOFF.md          # Handoff notes
```

---

## Frontend (`frontend/`)

Dashboard for managing solar projects. Routes: Dashboard, Analysis, NewProject wizard, Workspace3DConverter, plus stub pages (Captures, Reports, Tariffs, Portfolio, Settings, Help).

### Stack
- React 18 + TypeScript 5.7
- Vite 6
- Tailwind 3.4
- React Three Fiber + Drei + three.js — 3D viewer
- TanStack Query — server state
- Zustand — client state
- React Router 6
- Supabase JS — DB + storage
- Sonner — toasts
- Motion — animation
- Phosphor Icons

### Run

```bash
cd frontend
npm install
cp .env.local.example .env.local   # if present; else create
npm run dev                         # vite dev server on :5173
npm run build                       # tsc -b && vite build
npm run preview                     # serve built bundle
npm run lint                        # tsc --noEmit type check
```

### Env vars

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_DEV_OWNER_ID=<seeded auth.users uuid>   # dev-only, no auth UI yet
```

> Note: tariff handling has been removed. The `tariff` column + `tariff_kind` enum are dropped via `supabase/migrations/0003_drop_tariff.sql`.

---

## Backend (`backend/`)

FastAPI service. Two roles:

1. **Procedural model generator** — `model_generator.py` builds a parametric bungalow GLB from dimensions (length, width, height, roof pitch, porch, panel size). Uses `trimesh` for mesh ops, `pvlib` for solar yield, `shapely` for roof geometry.
2. **Hunyuan3D pipeline** — `scripts/run_hunyuan_shape.py` and `run_hunyuan_texture.py` generate meshes from drone photos. Targets RTX 3080 (~10GB VRAM). Shape-only first, texture only if VRAM allows. See [Agent.md](Agent.md) Phase 1.

### Endpoints

- `POST /generate-model` — body: building + panel params. Returns `{ model_url, stats }`.
- `GET /models/{filename}` — serves GLB from `outputs/`.

### Run

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

CORS allows `http://localhost:5173`.

### Hunyuan3D feasibility test

Before integrating into web flow:

```bash
nvidia-smi                                # confirm GPU + VRAM
python scripts/run_hunyuan_shape.py       # one image, shape-only, low VRAM
```

Success = mesh exported as GLB/OBJ/PLY, no OOM. See [Agent.md](Agent.md) §Phase 1 for criteria.

---

## Supabase

### Schema — `supabase/migrations/`
- `0001_init.sql` — `projects`, `project_assets`, `project_events`, enums, RLS
- `0002_storage_policies.sql` — bucket policies
- `0003_drop_tariff.sql` — drops `projects.tariff` + `tariff_kind` enum

Tables:
- `projects` — site metadata, lat/lon, energy stats, asset paths
- `project_assets` — uploaded files (source photos, GLB, measurement img, data JSON)
- `project_events` — audit log
- Enums: `project_status`, `intake_mode`
- RLS: owner-only via `auth.uid()`

### Storage buckets (private)
| Bucket | Holds |
|---|---|
| `project-models` | `.glb` 3D models |
| `project-images` | measurement / thumbnail images |
| `project-data` | `data.json` analysis blobs |

Path convention: `{owner_id}/{project_id}/{filename}`.

### Apply migrations

```bash
# via Supabase SQL editor — paste 0001_init.sql then 0002_storage_policies.sql
# or via CLI
npx supabase db push
```

Regenerate types after schema change:

```bash
npx supabase gen types typescript --project-id <PROJECT_ID> \
  > frontend/src/lib/db-types.ts
```

Seed dev data: run `supabase/seed.sql` after setting a dev `auth.users` row and matching `VITE_DEV_OWNER_ID`.

---

## Project Flow

```
NewProject wizard
 ├─ Step 1 Site setup    — name, address, lat/lon
 ├─ Step 2 Intake mode   — drone_terra | drone_video | photos | demo
 ├─ Step 3 Upload        — GLB (required unless demo), measurement img, data.json
 └─ Step 4 Review        — create row, upload files, log event, → /projects/:id/analysis
```

Analysis page loads project via `useProject(id)`, signs GLB URL from `project-models`, hands to `Workspace3DSection`.

---

## Dev Quickstart

Two terminals:

```bash
# terminal A — backend
cd backend && source .venv/bin/activate && uvicorn main:app --reload --port 8000

# terminal B — frontend
cd frontend && npm run dev
```

Open <http://localhost:5173>.

---

## Scope Rules (from Agent.md)

- Visual demo only. Not photogrammetry, not engineering-grade.
- Hunyuan3D is generative — output may hallucinate building details.
- Approximate dimensions OK. No measurement-accuracy claims.
- Shape-only generation before texture.
- Manual pre-generation acceptable for demo stability.

---

## Known Limitations

- RTX 3080 VRAM caps Hunyuan3D quality settings.
- Full texture generation may need higher-VRAM GPU or cloud.
- Single-user dev mode — no auth UI yet (seed `auth.users` manually).
- `client-dashboard/` is a built artifact, not a source tree.

---

## Docs

- [Agent.md](Agent.md) — Hunyuan3D feasibility + build phases
- [IMPLEMENTATION.md](IMPLEMENTATION.md) — Supabase wiring spec, acceptance checklist
- [HANDOFF.md](HANDOFF.md) — handoff notes
