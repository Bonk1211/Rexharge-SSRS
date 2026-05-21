# Implementation Report: Clients Card Grid with 3D Preview

## Summary
Replaced the data table on `/app/clients` with a 3-column responsive card grid. Each card shows a live rotating 3D preview on top (real GLB via signed URL when `modelGlbPath` set; procedural `RoofScene` fallback otherwise) and the existing project details below.

## Assessment vs Reality

| Metric | Predicted (Plan) | Actual |
|---|---|---|
| Complexity | Medium | Medium |
| Confidence | 8/10 | Held |
| Files Changed | 3 | 3 (1 new + 2 updated) |

## Tasks Completed

| # | Task | Status | Notes |
|---|---|---|---|
| 1 | `Mini3DPreview` | Complete | r3f Canvas, `dpr=[1, 1.5]`, `powerPreference: low-power`, no shadows, autoRotate-only OrbitControls |
| 2 | Update `ProjectCard` | Complete | Replaced `<ThumbArtwork />` with `<Mini3DPreview project={project} />`; wrapped in `pointer-events-none` div so parent `<Link>` receives clicks; added `pointer-events-none` to StatusPill + intake-label overlays; deleted local `ThumbArtwork` helper (lines 117-161) |
| 3 | Clients grid | Complete | Removed `<table>`; kept header + SummaryCells + HairlineRule; new caption "Each card opens the site's analysis view."; trimmed unused imports (`StatusPill`, `ArrowUpRight`, `fmtYears`, `Link`) |

## Validation Results

| Level | Status | Notes |
|---|---|---|
| Static Analysis | Pass | `npm run lint` (tsc --noEmit) clean |
| Unit Tests | N/A | No test runner in project |
| Build | Pass | `npm run build` 7.18s. Bundle warning pre-existing (three.js + recharts); +6kB JS vs baseline |
| Integration | N/A | Visual only — recommend `npm run dev` |
| Edge Cases | Pass (code-level) | Empty projects -> empty-state message; null `modelGlbPath` -> RoofScene fallback (default path for all mock data) |

## Files Changed

| File | Action | Lines |
|---|---|---|
| `frontend/src/components/data/Mini3DPreview.tsx` | CREATED | +84 |
| `frontend/src/components/data/ProjectCard.tsx` | UPDATED | +6 / -47 (ThumbArtwork removed) |
| `frontend/src/pages/Clients.tsx` | UPDATED | rewritten: 50 lines (was 87) |

## Deviations from Plan
- **None** of substance. Inline change: dropped `Link` from Clients.tsx imports (was used only by the removed table). Plan implicitly covered via "Remove imports no longer used".

## Issues Encountered
- Fact-Forcing Gate fired before each Write/Edit (3 retries). No logic impact.
- A user-side edit to `Monitoring.tsx` (compacted layout) landed mid-implementation; left untouched per instruction.

## Tests Written
None. No test runner; manual visual QA required.

## Next Steps
- [ ] Visual QA: `cd frontend && npm run dev`, open `/app/clients` — verify rotating models, card click navigates to `/app/projects/:id/analysis`
- [ ] Check WebGL context count in DevTools if portfolio grows past ~12 cards
- [ ] `/code-review` for pattern adherence
- [ ] `/prp-pr` when ready
