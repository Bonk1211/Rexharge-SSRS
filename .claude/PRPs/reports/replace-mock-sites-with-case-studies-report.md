# Implementation Report: Replace Hallucinated Mock Sites With 5 Real Case-Study Buildings

## Summary
Rewrote the source-of-truth for the Clients / Monitoring portfolio so every visible site is one of the 5 real drone-photogrammetry case studies (`video_2` SSU UM, `video_5` Star Grocer, `video_6` Rainbow, `video_4` Household, `video_7` Eco Horizon). Frontend now resolves absolute GLB URLs (skipping Supabase signed-URL path), the project-detail "Open in simulator" button passes `model + lat + lng + usage + tariff` query params, and Mini3DPreview fades a real `<img>` thumbnail over the canvas while the GLB downloads. A Supabase migration + new seed are written to disk; **applying them to remote Supabase is gated on user confirmation** because the migration deletes all rows under `dev_owner`.

## Assessment vs Reality

| Metric | Predicted (Plan) | Actual |
|---|---|---|
| Complexity | Medium | Medium |
| Confidence | 7/10 | 7/10 — held; one type-narrowing fixup mid-run |
| Files Changed | ~10 + 3 placeholders | 11 (5 created, 6 updated) |

## Tasks Completed

| # | Task | Status | Notes |
|---|---|---|---|
| 1 | Create `case-study-buildings.ts` constants | Complete | Includes `tariffCodeFromString()` helper used by Task 8 |
| 2 | Extend `Project` type with `thumbnailUrl` | Complete | Optional field, backwards-compatible |
| 3 | Rewrite `MOCK_PROJECTS` to 5 case studies | Complete | SSU + Eco numbers from JSON; Star/Rainbow/Household zeroed pending paste |
| 4 | Map new DB columns in `projects-api.ts` | Complete | Both `rowToProject` mapper and `camelToSnake` updated |
| 5 | Add Supabase migration `0004_*.sql` | Written to disk | **Not yet applied** — see Open Items |
| 6 | Rewrite `supabase/seed.sql` | Complete | Idempotent with the migration (shared fixed UUIDs) |
| 7 | Mini3DPreview: absolute-URL bypass + thumbnail overlay | Complete | `<img>` fades out via `onLoaded` callback from `GlbModel` |
| 8 | ProjectDetail: absolute-GLB + `buildSimulatorUrl` | Complete | Tariff display strings auto-mapped to codes via `tariffCodeFromString` |
| 9 | Register 3 placeholder report JSONs | Complete | `{ _placeholder: true }` shape; loader runtime-guards via `isPlaceholderReport` |
| 10 | Verify SitesNeedingAttention empty state | Complete | Read-only — filter at `Monitoring.tsx:143-145` already returns 0 for an all-`ready` portfolio |
| 11 | Pause for user-pasted report JSONs | **PAUSED** | Awaiting `household.json`, `star_grocer.json`, `rainbow.json` from user |

## Validation Results

| Level | Status | Notes |
|---|---|---|
| Type Check (`tsc --noEmit`) | Pass | One mid-run failure fixed by splitting `ProjectReport` into `FullProjectReport \| PlaceholderReport` + `isPlaceholderReport` guard |
| Lint (`npm run lint` = `tsc --noEmit`) | Pass | Same command as type-check in this project |
| Production Build (`npm run build`) | Pass | 5 report chunks emitted (`ssu_um`, `eco_horizon`, `household`, `star_grocer`, `rainbow`) |
| Hallucinated-name grep | Pass | Zero matches for `Setia Alam`, `Link House`, `Corner Lot`, `Surau Rooftop Pilot`, `Triple Shoplot`, `4-storey Office Block` in `frontend/src/` + `supabase/` |
| Integration (browser smoke) | NOT RUN | Requires user-visible verify — see Open Items §3 |

## Files Changed

| File | Action | Notes |
|---|---|---|
| `frontend/src/data/case-study-buildings.ts` | CREATED | Single source of truth for the 5 buildings + `tariffCodeFromString` helper |
| `frontend/src/data/mock-projects.ts` | UPDATED | Added `thumbnailUrl?: string \| null` to `Project`; replaced 7 fabricated entries with 5 case studies sourced from constants |
| `frontend/src/lib/projects-api.ts` | UPDATED | `rowToProject` maps `thumbnail_url`, `monthly_usage_kwh`, `tariff_type`; `camelToSnake` updated for update payloads |
| `frontend/src/components/data/Mini3DPreview.tsx` | UPDATED | Absolute-URL bypass via regex; `<img>` overlay with fade-out via `onLoaded` callback |
| `frontend/src/pages/ProjectDetail.tsx` | UPDATED | `buildSimulatorUrl` helper; absolute-GLB support; placeholder-report short-circuit |
| `frontend/src/data/project-reports.ts` | UPDATED | 3 new ids registered; `FullProjectReport` exported; `isPlaceholderReport` guard added |
| `frontend/src/data/reports/household.json` | CREATED | Placeholder until user paste |
| `frontend/src/data/reports/star_grocer.json` | CREATED | Placeholder until user paste |
| `frontend/src/data/reports/rainbow.json` | CREATED | Placeholder until user paste |
| `supabase/migrations/0004_replace_projects_seed.sql` | CREATED | **Not applied** — pending user confirmation |
| `supabase/seed.sql` | UPDATED | Matches the migration (same fixed UUIDs) |

## Deviations from Plan
- **Type narrowing**: plan suggested widening `ProjectReport` to `Record<string, unknown>` + runtime guard. Actual approach split the union: `FullProjectReport` (existing typed union) + `PlaceholderReport` (placeholder shape), union exported as `ProjectReport`. `ProjectDetail` state is `useState<FullProjectReport | null>`, so `ExportedSceneViewer` keeps its strict `ExportedSceneReport` prop contract. Cleaner than runtime-only checking.

## Issues Encountered
1. **TS2322 on `<ExportedSceneViewer report={report} />`** — initial `useState<ProjectReport | null>` widened too far. Fixed via the type split above. Single iteration.
2. **CORS untested**: `solar.limziyang.ml` static assets must serve `Access-Control-Allow-Origin: *` for `useGLTF` to fetch the `.glb`. Plan flagged this as the top risk; verification requires loading the dev server in a browser — see Open Items §3.

## Open Items (User Action Required)

### 1. Apply the Supabase migration
The migration file is on disk but **not** applied. Two paths:

```bash
# A) Local stack — destroys local DB only
npx supabase db reset

# B) Remote — destructive; confirm dev_owner row contents first
# (via the supabase MCP) mcp__supabase__apply_migration name="0004_replace_projects_seed"
```

Before running B, the plan recommends:
```sql
select id, name from projects where owner_id = '63f727fb-1514-4acc-9202-46df12d06093';
```
If that returns anything other than the 9 known-fabricated rows, scope the `delete` tighter by name before applying.

### 2. Paste the 3 missing report JSONs
For `video_4` Household, `video_5` Star Grocer, `video_6` Rainbow — replace each placeholder at `frontend/src/data/reports/{household,star_grocer,rainbow}.json` with the real export. After paste, update the matching row's `kwp / annualKwh / annualSavingsRm / paybackYears / panels` in:
- `frontend/src/data/mock-projects.ts` (fallback)
- `supabase/migrations/0004_replace_projects_seed.sql` (or a follow-up `0005_*.sql` if `0004` is already applied remotely)
- `supabase/seed.sql` (idempotent reseed)

### 3. CORS sanity check
Open `/app/clients` in the dev browser with DevTools → Network. Each `*.glb` should load 200 from `solar.limziyang.ml`. If any block with a CORS error, ask the nginx owner to add `Access-Control-Allow-Origin: *` on `/static/`.

## Next Steps
- [ ] Apply migration (Open Items §1) — request confirmation before running
- [ ] Paste report JSONs (§2) and rerun the affected hunks
- [ ] Browser-verify CORS + 3D rendering on Clients + ProjectDetail (§3)
- [ ] `/code-review` once §1-3 are done
- [ ] `/prp-pr` to open the pull request
