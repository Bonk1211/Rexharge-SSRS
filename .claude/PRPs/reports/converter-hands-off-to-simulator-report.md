# Implementation Report: Hand Off Rendered GLB Directly to External Simulator

## Summary
Workspace 3D converter no longer routes to the project wizard. After GLB render, user fills a 4-field site-context form (lat, lng, usage, tariff) then clicks "Open in simulator". GLB is uploaded to Supabase Storage (`project-models/<owner>/scratch/<ts>_reconstructed_model.glb`), a 24-hour signed URL is generated, and the simulator is opened in a new tab with all five query parameters.

## Assessment vs Reality

| Metric | Predicted (Plan) | Actual |
|---|---|---|
| Complexity | Medium | Medium |
| Confidence | 9/10 | 9/10 (single-pass, zero rework) |
| Files Changed | 3 | 3 |

## Tasks Completed

| # | Task | Status | Notes |
|---|---|---|---|
| 1 | Add `uploadScratchGlb` helper to `projects-api.ts` | Complete | Inserted before `uploadAsset`; reuses `supabase` + `DEV_OWNER_ID`; skips `project_assets` insert |
| 2 | Create `SiteContextForm` component | Complete | Lat / Lng / Usage / Tariff inputs; `sm:grid-cols-4` layout |
| 3 | Rewrite `Workspace3DConverter.tsx` | Complete | `handleOpenSimulator` replaces `handleSave`; `window.open` to `${__SIMULATOR_URL__}/simulator?...` |
| 4 | Smoke-validate (tsc + grep + build) | Complete | All clean |

## Validation Results

| Level | Status | Notes |
|---|---|---|
| Static Analysis (`tsc --noEmit`) | Pass | Exit 0 at every checkpoint |
| Lint | Pass | `lint` = `tsc --noEmit` in this repo |
| Build (`npm run build`) | Pass | Vite build succeeded in 3.41s |
| Dead-Reference Sweep | Pass | Zero hits for `Save as new project` / `handleSave` / `Packaging files`. `prefilledFiles` remains only in `NewProject.tsx` (wizard's incoming-state safety net — expected by plan) |
| Unit Tests | N/A | No Vitest/Jest suite in repo |
| Integration | N/A | Manual QA owed (requires live Supabase + simulator) |

## Files Changed

| File | Action | Notes |
|---|---|---|
| `frontend/src/lib/projects-api.ts` | UPDATED | Added `uploadScratchGlb` (8 lines) before `uploadAsset` |
| `frontend/src/components/workspace3d/SiteContextForm.tsx` | CREATED | 87 lines; controlled inputs for lat / lng / usage / tariff |
| `frontend/src/pages/Workspace3DConverter.tsx` | UPDATED | Full rewrite — `handleSave` → `handleOpenSimulator`; new state for `context`/`uploading`; renders `SiteContextForm` + new CTA |

## Deviations from Plan

None. Implemented exactly as planned.

## Issues Encountered

None. Each task type-checked clean on first run.

## Tests Written

None — repo has no test infrastructure. Manual QA owed (see below).

## Manual QA Owed

- [ ] Visit `/app/workspace/3d-converter`, upload photos, click Generate, wait for render.
- [ ] Verify Site context form appears below model.
- [ ] Fill lat/lng/usage/tariff. Confirm CTA disables until lat, lng, usage are non-empty.
- [ ] Click "Open in simulator". Network tab: PUT to `/storage/v1/object/project-models/<owner>/scratch/...`, then POST to `/storage/v1/object/sign/project-models/...` with `expiresIn: 86400`.
- [ ] New tab opens to `https://solar.limziyang.ml/simulator?model=<signed_url>&lat=...&lng=...&usage=...&tariff=domestic`. Decode `model` param — must be signed Supabase URL.
- [ ] Force a network failure mid-click: toast surfaces the error, button re-enables.

## Risks Still Open

- **Simulator URL contract**: Plan trusts the user-provided example URL. If the simulator actually expects different param names or extra fields (e.g. `gmap`), adjust `URLSearchParams` in `Workspace3DConverter.tsx`.
- **Bucket CORS**: `project-models` bucket signed URLs must be reachable from `solar.limziyang.ml`. Supabase default CORS allows `*`; verify in manual QA.
- **Popup blocker**: `window.open` runs after `await`. Most browsers tolerate this because the chain started from a user click; if blocked, fall back to `window.location.href = url`.
- **Scratch GLBs accumulate**: No cleanup. Out of scope; add Storage lifecycle rule later.

## Next Steps

- Manual QA against live simulator at `https://solar.limziyang.ml/simulator`.
- `/code-review` before PR.
- (Optional follow-up) Extend `ProjectDetail.tsx`'s existing "Open in simulator" link to also append `model`/`lat`/`lng`/`usage`/`tariff` once those fields are on the `Project` type.
