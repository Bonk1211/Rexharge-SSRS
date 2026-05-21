# Implementation Report: Monitoring Dashboard — Graph Visualization

## Summary
Added Recharts-driven graph row to `/app` (Monitoring page): power curve area chart, monthly yield-vs-target stacked bar, and 3-up radial gauges (PR, soiling, capacity factor). Shrunk KPI tiles from `lg` to `md` to free vertical room. Existing flagged-sites + activity feed unchanged.

## Assessment vs Reality

| Metric | Predicted (Plan) | Actual |
|---|---|---|
| Complexity | Medium | Medium |
| Confidence | 8/10 | Held — single-pass, no rollback |
| Files Changed | 8 | 8 (5 new + 3 updated) |

## Tasks Completed

| # | Task | Status | Notes |
|---|---|---|---|
| 1 | Install recharts | Complete | Resolved to `recharts@^2.15.4` (caret allowed newer than planned `^2.13`) |
| 2 | `lib/dashboard-series.ts` | Complete | Inlined `sunInstantPowerKw` instead of importing from `RooftopPreview` — landing kept self-contained |
| 3 | `usePortfolioCharts` hook | Complete | |
| 4 | `PowerCurveCard` | Complete | Added `interval={2}` on XAxis so hour labels don't crowd at small width — minor polish, not in plan |
| 5 | `YieldVsTargetCard` | Complete | Added `tickFormatter` to YAxis (kWh → `k` suffix) for readability — minor polish |
| 6 | `RadialGaugeCard` | Complete | Added optional `hint` prop for sub-label under center numeral — minor enhancement |
| 7 | `PortfolioGaugesRow` | Complete | Wired hints: "PR · weather-adjusted", "post-monsoon avg", "annual kWh / (kWp·8760)" |
| 8 | Wire `Monitoring.tsx` | Complete | KPI strip: `p-7 gap-7 lg` → `p-6 gap-6 md` |

## Validation Results

| Level | Status | Notes |
|---|---|---|
| Static Analysis | Pass | `npm run lint` (tsc --noEmit) clean |
| Unit Tests | N/A | Project has no test runner (per plan) |
| Build | Pass | `npm run build` succeeds in 4.68s. Bundle warning > 500kb expected (three.js + recharts; not introduced by this change) |
| Integration | N/A | Visual; recommend manual `npm run dev` to verify |
| Edge Cases | Pass (code-level) | `projects.length > 0` guard skips chart sections when empty; division-by-zero guarded in `buildGaugeValues` |

## Files Changed

| File | Action | Lines |
|---|---|---|
| `frontend/package.json` | UPDATED | +1 (`recharts` dep) |
| `frontend/src/lib/dashboard-series.ts` | CREATED | +82 |
| `frontend/src/store/projects-store.ts` | UPDATED | +14 |
| `frontend/src/components/data/PowerCurveCard.tsx` | CREATED | +119 |
| `frontend/src/components/data/YieldVsTargetCard.tsx` | CREATED | +119 |
| `frontend/src/components/data/RadialGaugeCard.tsx` | CREATED | +91 |
| `frontend/src/components/data/PortfolioGaugesRow.tsx` | CREATED | +37 |
| `frontend/src/pages/Monitoring.tsx` | UPDATED | +30 / -8 |

## Deviations from Plan
- **Hour-curve formula source**: plan suggested importing `sampleSun` from `RooftopPreview.tsx`. Inlined the math in `dashboard-series.ts` instead — keeps the landing module self-contained (it owns its animation state) and dashboard module purely declarative. Trade-off: two copies of the formula. Acceptable; both are small.
- **Recharts version**: plan said `^2.13.0`, installed `^2.15.4` (npm resolved latest in range). No API differences relevant to used components.
- **Minor polish (out-of-spec but harmless)**:
  - XAxis `interval={2}` on PowerCurveCard prevents crowded labels
  - YAxis `tickFormatter` (`k` suffix) on YieldVsTargetCard improves readability
  - `hint` prop on RadialGaugeCard for context under center numeral

## Issues Encountered
- None blocking. Fact-Forcing Gate fired on every Write/Edit — required restating callers/I/O facts before each operation. Cost: ~6 retries, no logic impact.

## Tests Written
None. Project has no test runner (`package.json` `lint` script is `tsc --noEmit` only). Plan explicitly skipped introducing one.

## Next Steps
- [ ] Visual QA: `cd frontend && npm run dev`, open `/app`, verify chart row renders + tooltips work
- [ ] `/code-review` for pattern adherence
- [ ] `/prp-pr` if pushing to feature branch (currently on `main`)
- [ ] Optional: extract `sampleSun` into shared helper if a third caller appears
