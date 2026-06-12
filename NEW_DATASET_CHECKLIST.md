# New Dataset Checklist — 3D Converter

Fill this in and hand it back when you want a new dataset (photos / drone video / 3D model)
added to the converter page, with the "Open in simulator" redirect rewritten to match.

The redirect is built in `frontend/src/pages/Workspace3DConverter.tsx` → `openInSimulator()`:

```
https://solar.limziyang.ml/simulator
  ?model=<URL-encoded path on simulator server>
  &lat=<decimal degrees>
  &lng=<decimal degrees>
  &usage=<monthly kWh>
  &tariff=<tariff type>
  &gmap=<URL-encoded image path on simulator server>
```

---

## 1. Dataset identity

| Field | Your value | Notes |
|---|---|---|
| Dataset name / label | | Shows in history card / sample button, e.g. "Sentul 05" |
| Mode | photos / drone | Which intake tab this dataset belongs to |
| Replace existing or add new? | replace / add | If add: should it be selectable alongside the current one? |

## 2. Local assets (this repo — go under `frontend/public/models/`)

| Field | Your value | Notes |
|---|---|---|
| Folder name | | e.g. `video_8` → `frontend/public/models/video_8/` |
| Photo files | | Path or zip of rooftop photos (PNG/JPG, 3–48). Photos mode only |
| Drone video file | | `.mp4`. Drone mode only |
| 3D model file | | `.glb` — feeds the in-page MeshViewer and the "Download .glb" button |

> These local copies only power the in-page viewer/previews/download.
> They do NOT affect the simulator redirect.

## 3. Simulator server assets (`solar.limziyang.ml` — NOT this repo)

The simulator loads files from its own `/static/` directory. The files must already
exist on that server; give me the exact paths:

| Field | Your value | Example |
|---|---|---|
| `model` path | | `/static/models/video_8/3DModel.glb` |
| `gmap` image path | | `/static/measurement/eco_horizon.png` |

> If these are not uploaded on the simulator server, the redirect will 404 even
> though everything looks fine locally.

## 4. URL parameters

| Param | Your value | Example | Notes |
|---|---|---|---|
| `lat` | | `5.237826` | Decimal degrees, −90…90 |
| `lng` | | `100.452277` | Decimal degrees, −180…180 |
| `usage` | | `700` | Monthly consumption, kWh |
| `tariff` | | `domestic` | Tariff type the simulator expects |

## 5. Behavior choices

- [ ] Hardcode `lat`/`lng` from section 4 into the redirect URL
- [ ] OR use the "Rooftop location" inputs on the page (user-entered values), falling back to section 4 when empty

## 6. Supabase — not needed for this

Checked: the converter page never touches Supabase in the demo flow.

- Photos load from local demo files, the GLB is served from `frontend/public/models/`,
  and the simulator redirect is a hardcoded external URL — no DB rows, no storage buckets.
- `uploadScratchGlb` / `getSignedUrl` are imported in `Workspace3DConverter.tsx` but never
  called (leftover from the stripped backend flow).
- The Projects list also reads from the static `PROJECTS` array, not from Supabase.

Supabase only becomes relevant if you ALSO want the dataset registered as a project record
(`projects` table + `project-models` storage bucket). If so, additionally provide:

| Field | Your value | Notes |
|---|---|---|
| Project name / address | | For the `projects` row |
| Register in Supabase? | yes / no | Default: no |

---

## 7. Return link: simulator → this app (Clients + Monitoring)

The simulator (`solar.limziyang.ml`) is an external app — this repo cannot add a
"back" button there. What I can do is build the exact URL string; you (or whoever
owns the simulator) paste it into the simulator's back/exit button.

Deep-link targets in this app (React Router, `frontend/src/main.tsx`):

| Page | URL path | Notes |
|---|---|---|
| Monitoring (dashboard) | `/app` | Index page |
| Clients | `/app/clients` | |
| Project detail | `/app/projects/<uuid>` | `<uuid>` must exist in `frontend/src/data/case-study-buildings.ts` |

> None of these routes read query params today (`?foo=bar` is ignored). If you want
> the simulator to pass state back (e.g. chosen usage/tariff, highlight a project),
> that is a code change in this repo — say so and describe the desired behavior.

Provide:

| Field | Your value | Example | Notes |
|---|---|---|---|
| Deployed base URL of this app | | `https://app.rexcharge.example` | The origin the simulator should link back to |
| Target page | monitoring / clients / project detail | `project detail` | |
| Project `uuid` (if project detail) | | `66666666-6666-4666-8666-666666666666` | Existing uuid, or "new" — see below |
| Open in same tab or new tab? | same / new | `same` | Converter currently opens simulator in a NEW tab, so "back" in the same tab won't return — same-tab back-link recommended |
| Pass state back via query params? | no / describe | `no` | Requires code change here if yes |

### If the back-link should land on a NEW dataset's project page

Project detail pages are generated from the static registry, not Supabase. The new
dataset must be registered in this repo:

- `frontend/src/data/case-study-buildings.ts` — new entry: `uuid`, `name`, `address`,
  `lat`, `lon`, `thumbnailHue`, `reportId`, `modelGlbUrl`, `measurementImgUrl`,
  `thumbnailUrl`, `monthlyUsageKwh`, `tariffCode`
- `frontend/src/data/reports/<name>.json` — report file supplying `kwp`, `annualKwh`,
  `annualSavingsRm`, `paybackYears`, `panels`, `capacityFactor` (same shape as
  `eco_horizon.json`)

So for a full round trip (converter → simulator → back to monitoring/client page of
the same dataset), provide sections 1–5 PLUS the registry fields above.

---

### Minimal example (filled)

```
Dataset:   Sentul 05, drone mode, add as new
Local:     frontend/public/models/video_8/{rexharge_video_8.mp4, 3DModel.glb}
Simulator: model=/static/models/video_8/3DModel.glb
           gmap=/static/measurement/sentul_05.png
Params:    lat=5.237826  lng=100.452277  usage=700  tariff=domestic
Behavior:  use page Rooftop location inputs, fallback to params above
Return:    https://app.rexcharge.example/app/projects/66666666-6666-4666-8666-666666666666
           same tab, no query params
```
