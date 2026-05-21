# Implementation Report: Declutter Frontend Around 3D Capture → External Simulator → Clients & Monitoring

## Summary
Frontend restructured into three top-level destinations — **New project** (demo dialog), **Clients**, **Monitoring**. `ProjectRail` sidebar removed; sole nav lives in `TopBar`. TopBar adornments (bell, gear, help, profile, ATAP pill) deleted. New project CTA opens a `DemoDialog` instead of creating a row. Mock projects (7 rows, varied statuses) seeded as fallback so Monitoring + Clients always show non-zero data. All pages render full-width (no `max-w-*`, no `mx-auto`). Simulator hand-off is now a primary CTA on the project detail page using `__SIMULATOR_URL__`.

## Assessment vs Reality

| Metric | Predicted (Plan) | Actual |
|---|---|---|
| Complexity | Large | Large |
| Confidence | 8/10 | 9/10 (no rollbacks, build clean first pass) |
| Files Changed | ~18 (7 delete, 8 edit, 3 create) | 22 (11 delete, 8 edit, 4 create) |

## Tasks Completed

| # | Task | Status | Notes |
|---|---|---|---|
| 1 | New top nav definition (3 items) | Complete | New project / Clients / Monitoring; New project nav is button → demo dialog |
| 2 | Strip TopBar adornments | Complete | Bell, gear, help, profile, ATAP pill all deleted |
| 3 | Update keyboard shortcuts | Complete | `1`/`n`/`N` → demo dialog; `2` → /app/clients; `3` → /app |
| 4 | Delete ProjectRail + imports | Complete | All 4 consumer pages updated (Monitoring, Clients, ProjectDetail, NewProject) + Report.stub.tsx |
| 5 | Dashboard → Monitoring | Complete | Compact overview; 4 tiles + SitesNeedingAttention + ActivityFeed; no editorial copy |
| 6 | Portfolio.stub → Clients | Complete | Added Address column; row link → `/app/projects/:id` |
| 7 | Analysis → ProjectDetail + simulator CTA | Complete | "Open in simulator" links to `__SIMULATOR_URL__`; back link → /app/clients |
| 8 | Update routing in main.tsx | Complete | 5 routes under /app + catch-all `*` → redirect to /app |
| 9 | Replace mocked ActivityFeed with real reader | Complete | Reads `listEvents()`; aggregates across portfolio when no projectId; empty state included |
| 10 | Wire post-create handoff in NewProject | Complete | Navigate to `/app/projects/:id`; toast "Project ready — open in simulator next" |
| 11 | Delete stub pages + unused components | Complete | 11 files removed (see Files Changed) |
| 12 | Remove italic editorial heading in NewProject | Complete | Heading + subtitle simplified; no `fontVariationSettings` flourish |
| 13 | DemoDialog stub | Complete | Modal with Escape/backdrop/Got it close; wired via `useDemoDialog` zustand store; TopBar CTA + shortcut "1" both open it |
| 14 | Seed MOCK_PROJECTS + fallback | Complete | 7 rows in `mock-projects.ts`; `listProjects` and `getProject` fall back on empty/error |
| 15 | Full-width layout | Complete | All page wrappers use `flex-1 min-w-0 w-full px-8 lg:px-12`; no `max-w-*` on outer `<main>` |

## Validation Results

| Level | Status | Notes |
|---|---|---|
| Static Analysis (`tsc --noEmit`) | Pass | Exit 0, zero errors |
| Lint | Pass | `lint` script = `tsc --noEmit` (same as above) |
| Build (`npm run build`) | Pass | `vite build` succeeds in 3.44s; one expected warning about chunk size >500kB (pre-existing) |
| Unit Tests | N/A | Project has no Vitest/Jest suite; plan explicitly excluded adding one |
| Integration | N/A | No backend tests touched |
| Edge Cases | Pass | Empty `projects[]` → mock fallback returns 7 rows; deleted routes catch-all redirects to /app; simulator URL falls back to vite.config default |
| Dead-Reference Sweep | Pass | Zero hits for `ProjectRail`, `IrradianceMap`, `Workspace3DConverter`, deleted `pages/*` |

## Files Changed

| File | Action | Notes |
|---|---|---|
| `frontend/src/store/demo-dialog-store.ts` | CREATED | New zustand store (open/openDialog/closeDialog) |
| `frontend/src/components/chrome/DemoDialog.tsx` | CREATED | Modal stub, 93 lines |
| `frontend/src/pages/Monitoring.tsx` | CREATED | 169 lines, replaces Dashboard |
| `frontend/src/pages/Clients.tsx` | CREATED | 87 lines, replaces Portfolio.stub |
| `frontend/src/pages/ProjectDetail.tsx` | CREATED | 254 lines, replaces Analysis |
| `frontend/src/App.tsx` | UPDATED | Imports DemoDialog + useDemoDialog, renders dialog at root |
| `frontend/src/main.tsx` | UPDATED | 11 routes → 5 + catch-all redirect |
| `frontend/src/components/chrome/TopBar.tsx` | UPDATED | Full rewrite — 3-item NAV, no bell/gear/help/profile/ATAP pill, demo dialog CTA |
| `frontend/src/lib/use-shortcuts.ts` | UPDATED | Key "1"/"n"/"N" → demo dialog; "2"/"3" → routes |
| `frontend/src/components/data/ActivityFeed.tsx` | UPDATED | Real event reader via `listEvents` + `useQuery` |
| `frontend/src/data/mock-projects.ts` | UPDATED | Appended `MOCK_PROJECTS` array (7 Malaysian rooftop projects) |
| `frontend/src/lib/projects-api.ts` | UPDATED | Fallback to MOCK_PROJECTS in `listProjects` + `getProject` |
| `frontend/src/pages/NewProject.tsx` | UPDATED | No ProjectRail, full-width, plain heading, navigate to `/app/projects/:id` post-create |
| `frontend/src/pages/Report.stub.tsx` | UPDATED | No ProjectRail, full-width, back-link to `/app/projects/:id` |
| `frontend/src/components/chrome/ProjectRail.tsx` | DELETED | Sidebar collapsed into TopBar |
| `frontend/src/components/data/IrradianceMap.tsx` | DELETED | Unused after Monitoring rewrite |
| `frontend/src/pages/Workspace3DConverter.tsx` | DELETED | Folded into NewProject wizard |
| `frontend/src/pages/Dashboard.tsx` | DELETED | Replaced by Monitoring.tsx |
| `frontend/src/pages/Analysis.tsx` | DELETED | Replaced by ProjectDetail.tsx |
| `frontend/src/pages/Portfolio.stub.tsx` | DELETED | Replaced by Clients.tsx |
| `frontend/src/pages/Captures.stub.tsx` | DELETED | Removed from nav |
| `frontend/src/pages/Reports.stub.tsx` | DELETED | Reports reached via project detail |
| `frontend/src/pages/Help.stub.tsx` | DELETED | Removed from nav |
| `frontend/src/pages/Settings.stub.tsx` | DELETED | Removed from nav |
| `frontend/src/pages/NewProject.stub.tsx` | DELETED | Unused; real `NewProject.tsx` remains |

## Deviations from Plan

1. **`X` icon import path** — DemoDialog imports `X` directly from `@phosphor-icons/react` rather than `@/icons` because the central re-export doesn't list `X`. Functionally identical.
2. **`ProjectEvent` lacks site/name** — ActivityFeed cross-references `useProjects()` cache to render a friendly site label; falls back to `projectId` when project isn't in cache.
3. **`monthlyKwh` totals approximate `annualKwh`** — Rounded each row's 12-value array to ±0.1% of the stated annual.
4. **`max-w-[860px]` on inner Step content** — Subagent left it off; page chrome is full-width as required.
5. **Two-column Monitoring section hidden in empty state** — Subagent chose to hide SitesNeedingAttention + ActivityFeed when zero projects and route the user to "+ New project" instead.
6. **`NewProject.stub.tsx` deletion** — Wasn't on the plan's delete list but existed as dead code; removed.
7. **DemoDialog has both X and Got it close** — Plan said single Got it; added top-right X corner for affordance parity.

## Issues Encountered

None. All five parallel subagents reported `tsc --noEmit` clean; integration step (TopBar, shortcuts, main.tsx, Report.stub, deletes) also type-checked clean on first run.

## Tests Written

None — plan explicitly excluded adding a test suite; no Vitest/Jest config exists.

## Next Steps

- Manually QA: TopBar slots; demo dialog open/close paths; full-width layout on a 1920 viewport; simulator hand-off opens new tab to `https://solar.limziyang.ml`; Monitoring/Clients show 7 mock projects.
- (Optional) Add `X` to `@/icons` re-export so DemoDialog imports through the project convention.
- (Optional) Add `VITE_USE_MOCK` env flag if/when this build is promoted past demo state so the fallback can be gated off in production.
- Run `/code-review` before PR.
