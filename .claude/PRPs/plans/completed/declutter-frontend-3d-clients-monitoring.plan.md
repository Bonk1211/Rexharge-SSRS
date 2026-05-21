# Plan: Declutter Frontend Around 3D Capture → External Simulator → Clients & Monitoring

## Summary
Restructure the React/Vite frontend so it owns exactly two concerns: (1) capturing/processing rooftop input into a 3D model, and (2) post-simulation client management + project monitoring. The PV-yield simulator lives at an external URL (`https://solar.limziyang.ml`) and is reached via a clear hand-off button. Anything not serving those two concerns (poetic hero copy, ATAP pills, marketing-style activity feeds, broken settings/notifications/profile buttons, duplicate portfolio/captures/reports pages) is removed or collapsed. The frontend stretches **full viewport width** (no `max-w` caps). The "New project" CTA is a **demo stub**: clicking it opens a dialog explaining the demo state — no DB write happens. Mock data is **seeded with multiple projects** so Monitoring and Clients show real numbers, not zeros. The result is a calmer surface with three top-level destinations: **New Project**, **Clients**, **Monitoring**.

## User Story
As a solar-installation operator,
I want one focused workspace for getting rooftops into a 3D model, jumping to the external simulator, and then managing clients and operating projects,
So that I am not buried in scattered tabs, decorative copy, and overlapping list views.

## Problem → Solution
**Current state:** TopBar nav has Workspace/Captures/Reports/Portfolio plus search, ATAP pill, bell, help, settings, profile. `ProjectRail` sidebar appears on most pages with its own search and a second nav (Overview, 3D Converter, Simulator). Dashboard mixes editorial headline, portfolio metrics, projects grid, activity feed, irradiance map, ATAP RM callout. Captures/Reports/Portfolio are heavy stubs reusing the same projects list with different framing. Simulator is buried as a sidebar external link. Five-section Analysis page already covers everything an Analysis/Reports view needs.

**Desired state:** Three top-level routes only — **New Project** (capture → 3D), **Clients** (project list = client list), **Monitoring** (per-project operational view + portfolio rollup). Hand-off to external simulator is a primary CTA inside the project detail page after a model exists. Sidebar `ProjectRail` is removed; navigation is single-source via `TopBar`. Decorative copy and unused adornments are stripped. Dashboard becomes a compact monitoring overview; Captures/Reports/Portfolio stubs are deleted.

## Metadata
- **Complexity**: Large
- **Source PRD**: N/A — free-form request
- **PRD Phase**: N/A
- **Estimated Files**: ~18 (delete 7, edit 8, create 3)

---

## UX Design

### Before
```
┌────────────────────────────────────────────────────────────────────┐
│ TopBar: [Logo] Workspace Captures Reports Portfolio  [search] ATAP │
│         [+ New project] [bell] [help] [gear] [user]                │
├──────────────┬─────────────────────────────────────────────────────┤
│ ProjectRail  │ Editorial hero                                      │
│ search       │   "Sun on glass, measured in ringgit."              │
│ ─ Workspace  │ Hero metrics grid (kWp / kWh / RM / payback)        │
│   Overview   │ Sites in pipeline (cards)                           │
│   3D Conv.   │ ActivityFeed | IrradianceMap | ATAP RM RoiCallout   │
│   ↗ Sim      │ Footer with tariff bylines                          │
│ ─ Projects   │                                                     │
│   …list…     │   (every page also shows ProjectRail + this main)   │
└──────────────┴─────────────────────────────────────────────────────┘
```

### After
```
┌────────────────────────────────────────────────────────────────────┐
│ TopBar: [Logo]  New project   Clients   Monitoring     [search]    │
│         [user]                                                     │
├────────────────────────────────────────────────────────────────────┤
│ Monitoring (default landing for /app)                              │
│   ┌────────────────────────────┬─────────────────────────────┐     │
│   │ Portfolio totals · 4 tiles │ Sites needing attention     │     │
│   │ kWp · kWh · savings · pb   │ (failed / processing only)  │     │
│   └────────────────────────────┴─────────────────────────────┘     │
│   Recent activity (compact list, no decoration)                    │
│                                                                    │
│   ─── per project (click row) ────────────────────────────────     │
│   Project name + status                                            │
│   3D viewer | yield chart | actions: [Open simulator ↗] [Report]   │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ New project (upload → process → output 3D model)                   │
│   Step 1 Site setup  → Step 2 Intake mode → Step 3 Upload + 3D     │
│   On model ready → "Open in simulator ↗" → ext. URL (new tab)      │
│   Also → "Save project" → returns to Clients list                  │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ Clients (= projects, treated as customers)                         │
│   Single table: name · address · kWp · status · last activity      │
│   Row click → Monitoring detail for that project                   │
└────────────────────────────────────────────────────────────────────┘
```

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| Top nav items | Workspace, Captures, Reports, Portfolio | New project, Clients, Monitoring | 4 → 3 destinations |
| Sidebar rail | Always-on `ProjectRail` with second nav | Removed | Sole nav lives in `TopBar` |
| Default `/app` landing | Editorial dashboard | Monitoring overview | Numeric only |
| Simulator entry | Sidebar external link | Primary CTA on project detail after model exists | Clearer hand-off |
| Captures/Reports/Portfolio routes | Three stub pages | Removed (Portfolio → Clients; Reports lives inside project detail) | One way to view a project |
| TopBar adornments | ATAP pill + bell + help + gear + profile + search + CTA | search + CTA only | bell/gear/profile/help all removed — clicked, nothing useful showed |
| New project CTA | Real wizard that writes Supabase row | Demo dialog explaining the stubbed state | No accidental writes during demo |
| Dashboard hero | Poetic headline + decorative SVG | Plain `<h1>` "Monitoring" + small subtitle | Function over flourish |
| Page width | `max-w-[1400px]` centred | Full viewport width, left-aligned padding only | More room for tables and viewers |
| Overview values | All zero (no projects in DB) | Real numbers from seeded mock fallback | Demo shows something useful |

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `frontend/src/main.tsx` | 1-43 | Sole place routes are registered |
| P0 | `frontend/src/App.tsx` | 1-17 | App shell wraps `TopBar` + `<Outlet/>` |
| P0 | `frontend/src/components/chrome/TopBar.tsx` | 1-209 | Nav array `NAV` (lines 31-42) drives the top tabs; SearchInput + Pill adornments removed |
| P0 | `frontend/src/components/chrome/ProjectRail.tsx` | 1-285 | Component being removed — every page that imports it must drop the wrapper `<div className="flex">…<ProjectRail/>` |
| P0 | `frontend/src/pages/Dashboard.tsx` | 1-266 | Rebuilt as `Monitoring.tsx` overview; current file is the reference for which data is genuinely useful |
| P0 | `frontend/src/pages/Workspace3DConverter.tsx` | 1-74 | Capture/process surface; merge into the New Project wizard's upload step rather than living as its own route |
| P0 | `frontend/src/pages/NewProject.tsx` | 1-557 | Wizard already calls `Workspace3DSection` for photos mode; needs a post-create "Open in simulator" CTA and a return path |
| P0 | `frontend/src/pages/Analysis.tsx` | 1-262 | Becomes the per-project Monitoring detail; reuse 5-section structure, but rename/relabel and add simulator CTA |
| P1 | `frontend/src/vite-env.d.ts` | 1-3 | `__SIMULATOR_URL__` global is defined here — use it for the hand-off button |
| P1 | `frontend/vite.config.ts` | 1-34 | Confirms simulator URL injection (`__SIMULATOR_URL__` is `https://solar.limziyang.ml`) |
| P1 | `frontend/src/store/projects-store.ts` | 1-83 | `useProjects`, `usePortfolioStats` — already provides everything Monitoring needs |
| P1 | `frontend/src/components/data/ProjectCard.tsx` | all | Reused in Clients list (or simplified to row form) |
| P1 | `frontend/src/components/data/ActivityFeed.tsx` | 1-40 | Stub data; either delete or replace with `listEvents()` from `projects-api.ts` |
| P2 | `frontend/src/pages/Portfolio.stub.tsx` | 1-87 | Table layout is the basis for the new Clients page |
| P2 | `frontend/src/lib/projects-api.ts` | 1-203 | API surface; `listEvents(projectId)` exists for real activity feed |
| P2 | `frontend/src/lib/use-shortcuts.ts` | all | Update key bindings to new nav (1=New, 2=Clients, 3=Monitoring) |
| P2 | `frontend/src/components/chrome/CompactMark.tsx` | all | Logo, stays |
| P2 | `frontend/src/pages/Landing.tsx` | reference | Marketing landing at `/` — out of scope but keep linking to `/app` |

## External Documentation
No external research needed — feature uses established internal patterns (React Router v6 `Outlet`, TanStack Query hooks already wired, Tailwind classes + CSS vars in `globals.css`, Phosphor icons via `@/icons`).

---

## Patterns to Mirror

### NAMING_CONVENTION — PascalCase pages, camelCase hooks/helpers, kebab in URLs
```ts
// SOURCE: frontend/src/pages/Dashboard.tsx:13, frontend/src/store/projects-store.ts:22
export default function Dashboard() { … }
export function useProjects() { … }
// Route paths: /app, /app/projects/:id/analysis, /app/workspace/3d-converter
```

### TOP_NAV_DEFINITION — `NavItem[]` with shortcut + match predicate
```tsx
// SOURCE: frontend/src/components/chrome/TopBar.tsx:23-42
const NAV: NavItem[] = [
  {
    to: "/app",
    label: "Workspace",
    shortcut: "1",
    Icon: House,
    match: (p) => p === "/app" || p === "/app/" || p.startsWith("/app/workspace") || p.startsWith("/app/projects"),
  },
  { to: "/app/captures", label: "Captures", shortcut: "2", Icon: Stack },
  …
];
```

### ROUTING — single `BrowserRouter`, `App` is the shell with `<Outlet/>`
```tsx
// SOURCE: frontend/src/main.tsx:21-43
<Route path="/app" element={<App />}>
  <Route index element={<Dashboard />} />
  <Route path="workspace/3d-converter" element={<Workspace3DConverter />} />
  …
</Route>
```

### PAGE_SHELL — every page renders `<div className="flex"><ProjectRail/><main … /></div>`
```tsx
// SOURCE: frontend/src/pages/Dashboard.tsx:18-20, Analysis.tsx:69-73, NewProject.tsx:158-162, Workspace3DConverter.tsx:29-33
return (
  <div className="flex">
    <ProjectRail />
    <main className="flex-1 min-w-0">…</main>
  </div>
);
```
**This is the pattern being removed.** New shell: `<main className="flex-1 min-w-0 w-full px-8 lg:px-12 py-10">…</main>` directly under the App `<Outlet/>`. **No `max-w-*`, no `mx-auto`** — every page stretches full viewport width, left-aligned, with only horizontal padding.

### DATA_FETCH — TanStack Query hook + camelCase project type
```tsx
// SOURCE: frontend/src/pages/Dashboard.tsx:14-15
const { data: projects = [], isLoading } = useProjects();
const stats = usePortfolioStats();
```

### EXTERNAL_LINK — `__SIMULATOR_URL__` injected by Vite
```tsx
// SOURCE: frontend/src/components/chrome/ProjectRail.tsx:64-67
<WorkspaceExternalLink
  href={__SIMULATOR_URL__}
  label="Simulator"
  …
/>
// declaration: frontend/src/vite-env.d.ts:2
declare const __SIMULATOR_URL__: string;
```

### CTA_BUTTON — pill, ink background, bold text-paper
```tsx
// SOURCE: frontend/src/pages/Dashboard.tsx:155-162, Analysis.tsx:108-117
<Link
  to="/app/projects/new"
  className="px-5 h-10 inline-flex items-center gap-2 rounded-full text-[13px] font-bold tracking-tight text-paper"
  style={{ background: "var(--ink)" }}
>
  <Plus weight="bold" size={14} />
  New project
</Link>
```

### ACTIVE_NAV_STATE — leaf-tint background + leaf-deep text
```tsx
// SOURCE: frontend/src/components/chrome/TopBar.tsx:131-148
style={{
  background: active ? "var(--leaf-tint)" : "transparent",
  color: active ? "var(--leaf-deep)" : "var(--ink-2)",
}}
```

### TYPOGRAPHY_TOKENS — `numeral`, `mono`, `tab-num`, `text-[NN.Npx]`
```tsx
// SOURCE: frontend/src/pages/Portfolio.stub.tsx:14-18
<div className="mono text-[10.5px] uppercase tracking-[0.24em] text-leaf-deep mb-2">Portfolio</div>
<h1 className="numeral text-[44px] leading-[1] tracking-[-0.03em] text-ink" style={{ fontWeight: 600 }}>
  All sites in the book.
</h1>
```
**Use these unchanged.** Drop italic editorial spans (`fontVariationSettings: "'opsz' 144, 'SOFT' 100"`); keep `numeral` / `mono` / `tab-num`.

### CSS_VARS — colors and surfaces are CSS variables, never hex
```ts
// SOURCE: frontend/src/styles/globals.css (via class usage everywhere)
// --ink, --paper, --leaf, --leaf-deep, --leaf-tint, --rule, --surface, --surface-2, --mute, --dim, --terracotta
```

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `frontend/src/main.tsx` | UPDATE | Replace 11 routes with 5 (Landing `/`, App shell `/app` → index Monitoring + `projects/new` + `clients` + `projects/:id`) |
| `frontend/src/App.tsx` | UPDATE | Remove dependency on removed page state; keep `TopBar` + `Outlet` |
| `frontend/src/components/chrome/TopBar.tsx` | UPDATE | New `NAV` (3 items: New project, Clients, Monitoring); strip ATAP `<Pill>`, bell, help, gear; keep search + profile (collapsed) + logo |
| `frontend/src/components/chrome/ProjectRail.tsx` | DELETE | Sidebar collapsed into TopBar |
| `frontend/src/pages/Dashboard.tsx` | RENAME → `Monitoring.tsx` + UPDATE | Strip editorial hero, decorative SVG band, RoiCallout, IrradianceMap; keep 4 portfolio tiles + a compact "sites needing attention" list + slim activity (`listEvents` once any project exists) |
| `frontend/src/pages/Workspace3DConverter.tsx` | DELETE | Functionality already lives inside `NewProject.tsx` step 2 via `Workspace3DSection` |
| `frontend/src/pages/NewProject.tsx` | UPDATE | On successful create, navigate to project detail with an "Open in simulator" hero CTA (`window.open(__SIMULATOR_URL__, "_blank")`) + secondary "Back to clients"; remove `ProjectRail` wrapper |
| `frontend/src/pages/Analysis.tsx` | RENAME → `ProjectDetail.tsx` + UPDATE | Remove `ProjectRail`; replace "Send to client" with "Open in simulator ↗" (external `__SIMULATOR_URL__`); keep 5-section flow because it _is_ the monitoring detail |
| `frontend/src/pages/Portfolio.stub.tsx` | RENAME → `Clients.tsx` + UPDATE | Already a project table; rename heading + subtitle to client/customer framing; row click → `/app/projects/:id` |
| `frontend/src/pages/Captures.stub.tsx` | DELETE | Stub data, no real backend wiring; superseded by NewProject upload step |
| `frontend/src/pages/Reports.stub.tsx` | DELETE | Reports already reachable via project detail's `Download report` button |
| `frontend/src/pages/Help.stub.tsx` | DELETE | Removed from nav and TopBar |
| `frontend/src/pages/Settings.stub.tsx` | DELETE | Removed from nav |
| `frontend/src/pages/Report.stub.tsx` | KEEP (route stays) | Still reached from project detail "Download report"; no UI change |
| `frontend/src/components/data/ActivityFeed.tsx` | UPDATE | Drop hard-coded `items` array; accept `projectId?` prop and read `listEvents()` (or render empty when no events) |
| `frontend/src/components/data/IrradianceMap.tsx` | DELETE-on-import-removal | Only used by Dashboard; remove after Monitoring page no longer imports it |
| `frontend/src/lib/use-shortcuts.ts` | UPDATE | Re-map number-key shortcuts to the new 3 destinations |
| `frontend/src/data/mock-projects.ts` | UPDATE | Export a `MOCK_PROJECTS: Project[]` array of 6–8 realistic seeded rows (KL/Selangor/Penang sites, varied `status`, real `kwp`/`annualKwh`/`annualSavingsRm`/`monthlyKwh`); type definitions stay |
| `frontend/src/lib/projects-api.ts` | UPDATE | `listProjects()` falls back to `MOCK_PROJECTS` when the Supabase call returns an empty array or errors, so the demo shows non-zero numbers |
| `frontend/src/components/chrome/DemoDialog.tsx` | CREATE | Modal stub shown when "New project" CTA is clicked — explains demo state, has a single "Got it" button |

## NOT Building

- A real-time simulator integration — the simulator is an external URL, opened in a new tab. No `<iframe>`, no postMessage bridge.
- A new client/customer data model — projects ARE the clients for now. Adding contacts, billing, or CRM fields is out of scope.
- Auth changes, Supabase schema migrations, or anything backend-side.
- Restyling the marketing Landing page at `/`.
- Internationalisation, dark-mode toggles, or theme work.
- Replacing TanStack Query, Tailwind, or Phosphor icons.
- Any change to the 3D pipeline itself (mesh generation, GLB upload). Only the surface around it.
- Re-implementing `Analysis.tsx`'s viewer sections from scratch — they are reused as-is inside `ProjectDetail.tsx`.

---

## Step-by-Step Tasks

### Task 1: Add new top nav definition
- **ACTION**: Replace `NAV` constant in `TopBar.tsx`.
- **IMPLEMENT**: 3 items — `{ to: "/app/projects/new", label: "New project", shortcut: "1", Icon: Plus }`, `{ to: "/app/clients", label: "Clients", shortcut: "2", Icon: Buildings }`, `{ to: "/app", label: "Monitoring", shortcut: "3", Icon: WaveSine, match: (p) => p === "/app" || p === "/app/" || p.startsWith("/app/projects/") && !p.startsWith("/app/projects/new") }`.
- **MIRROR**: `TOP_NAV_DEFINITION`
- **IMPORTS**: `Plus, Buildings, WaveSine` from `@/icons` (all already exported).
- **GOTCHA**: The `match` predicate matters because `/app/projects/:id` should highlight Monitoring, while `/app/projects/new` should highlight New project. Test both paths.
- **VALIDATE**: Click each nav item; only the matching tab is `leaf-tint`.

### Task 2: Strip TopBar adornments (delete bell, gear, help, profile, ATAP pill)
- **ACTION**: From `TopBar.tsx` JSX (lines 70-121 in current file) remove: the ATAP `<Pill>`, the bell button, the help `<Link>`, the gear `<Link>`, and the profile `<Link>` circle.
- **IMPLEMENT**: Keep only `CompactMark` logo, nav, search, and the "New project" CTA (made into a demo dialog trigger in Task 13). The TopBar has 4 visual slots after this — no profile, no bell, no gear, no help, no ATAP pill.
- **MIRROR**: `CTA_BUTTON`.
- **IMPORTS**: Remove `Bell, GearSix, Sparkle, User` from imports if unused elsewhere. `toast` may also drop if the bell was its only caller.
- **GOTCHA**: The `Pill` helper component becomes dead code — delete the function too. Reason for removing profile: user reported it goes nowhere useful; we don't have a profile page in scope, so removing is cleaner than fixing.
- **VALIDATE**: TopBar has exactly: logo · nav · search · CTA. No bell, no gear, no help, no profile, no ATAP pill.

### Task 3: Update keyboard shortcuts
- **ACTION**: Edit `frontend/src/lib/use-shortcuts.ts` so `1/2/3` map to `/app/projects/new`, `/app/clients`, `/app`.
- **IMPLEMENT**: Mirror the existing handler structure (whatever the file currently does — read it first); only the path table changes.
- **MIRROR**: existing handler shape in the file.
- **IMPORTS**: none new.
- **GOTCHA**: Don't intercept `1/2/3` while focus is inside an input. The current implementation likely already handles that — preserve the guard.
- **VALIDATE**: `1`, `2`, `3` navigate correctly when focus is on the page body.

### Task 4: Delete `ProjectRail` and its imports
- **ACTION**: Delete `frontend/src/components/chrome/ProjectRail.tsx`. Remove the import + `<ProjectRail />` JSX from every page that uses it (`Dashboard.tsx`, `Analysis.tsx`, `NewProject.tsx`, `Workspace3DConverter.tsx`).
- **IMPLEMENT**: Replace `<div className="flex"><ProjectRail /><main className="flex-1 min-w-0">…</main></div>` with `<main className="flex-1 min-w-0">…</main>` (or just inline whatever was inside `<main>`).
- **MIRROR**: `PAGE_SHELL` — but the new shell drops the sidebar.
- **IMPORTS**: Remove `import ProjectRail from "@/components/chrome/ProjectRail"` from each consumer.
- **GOTCHA**: `ProjectRail` was the only on-page consumer of `__SIMULATOR_URL__`. Keep the global declaration; it will be re-used in Task 8.
- **VALIDATE**: `grep -r "ProjectRail" frontend/src` returns no hits. App still compiles.

### Task 5: Rename Dashboard → Monitoring and simplify
- **ACTION**: Rename `frontend/src/pages/Dashboard.tsx` → `Monitoring.tsx`. Rewrite the page to be a compact monitoring overview.
- **IMPLEMENT**: Top of page: small uppercase eyebrow "Monitoring", `<h1>` "Active rooftops." (no italic span, no decorative SVG). 4 `MetricTile`s from `usePortfolioStats()` in a single row. Below: two columns — left `<SitesNeedingAttention />` (filter `projects` where `status === 'processing' || status === 'failed'`, render compact rows), right `<ActivityFeed />` (real, see Task 9). Drop `IrradianceMap`, `RoiCallout`, `NewProjectCard`, `todayKL`, `Footer`.
- **MIRROR**: `TYPOGRAPHY_TOKENS`, `DATA_FETCH`, `CSS_VARS`.
- **IMPORTS**: `useProjects`, `usePortfolioStats`, `MetricTile`, `ActivityFeed`, `Link` from react-router-dom, status icons from `@/icons`.
- **GOTCHA**: When the projects list is empty, show a one-line empty state pointing at `/app/projects/new`; don't keep the giant 36-line empty hero from the old Dashboard.
- **VALIDATE**: `/app` renders in under 1 viewport on a 1440×900 screen.

### Task 6: Rename Portfolio.stub → Clients
- **ACTION**: Rename `frontend/src/pages/Portfolio.stub.tsx` → `Clients.tsx`.
- **IMPLEMENT**: Change eyebrow "Portfolio" → "Clients", h1 "All sites in the book." → "Clients & sites." Subtitle: "One row per client project. Click a row to monitor." Each row's "Site" link must point to `/app/projects/:id` (new canonical) instead of `/app/projects/:id/analysis`. Keep the 4 summary cells but rename "Sites · ready / total" → "Active · total".
- **MIRROR**: `TYPOGRAPHY_TOKENS`, existing table structure.
- **IMPORTS**: same as current stub.
- **GOTCHA**: The table tries to display `p.address` indirectly through name only — leave layout intact; this is a copy + link change, not a redesign.
- **VALIDATE**: Row click navigates to `/app/projects/<id>` (Task 7 ensures that route exists).

### Task 7: Rename Analysis → ProjectDetail; add simulator CTA
- **ACTION**: Rename `frontend/src/pages/Analysis.tsx` → `ProjectDetail.tsx`. Keep all 5 sections (Layout, Yield, Roof, Schedule, Report) — they constitute the monitoring detail.
- **IMPLEMENT**: In the header action bar (currently "Send to client" + "Download report"), replace "Send to client" with `<a href={__SIMULATOR_URL__} target="_blank" rel="noreferrer">` styled exactly like the existing surface-2 secondary button, label "Open in simulator", icon `ArrowUpRight`. Keep "Download report" as-is. Change the "← Workspace" back-link target to `/app/clients`.
- **MIRROR**: `EXTERNAL_LINK`, `CTA_BUTTON`.
- **IMPORTS**: `ArrowUpRight` from `@/icons` (already used elsewhere).
- **GOTCHA**: `__SIMULATOR_URL__` is a Vite `define` global — keep `vite-env.d.ts` unchanged. Use it directly in JSX, not via `import.meta.env`.
- **VALIDATE**: Clicking "Open in simulator" opens a new tab to `https://solar.limziyang.ml`.

### Task 8: Update routing in `main.tsx`
- **ACTION**: Rewrite the `<Routes>` block.
- **IMPLEMENT**:
  ```tsx
  <Route path="/" element={<Landing />} />
  <Route path="/app" element={<App />}>
    <Route index element={<Monitoring />} />
    <Route path="clients" element={<Clients />} />
    <Route path="projects/new/*" element={<NewProject />} />
    <Route path="projects/:id" element={<ProjectDetail />} />
    <Route path="projects/:id/report" element={<Report />} />
  </Route>
  ```
  Imports adjust accordingly: `Monitoring`, `Clients`, `ProjectDetail` (renamed files); drop `Dashboard`, `Analysis`, `Workspace3DConverter`, `Captures`, `Reports`, `Portfolio`, `Help`, `Settings`.
- **MIRROR**: `ROUTING`
- **IMPORTS**: see above.
- **GOTCHA**: `Report.stub.tsx` stays — the route `/app/projects/:id/report` is reached from inside `ProjectDetail`. Don't accidentally delete it.
- **VALIDATE**: `npm run build` succeeds; manually visit each of the 5 routes.

### Task 9: Replace mocked `ActivityFeed` with real event reader
- **ACTION**: Rewrite `frontend/src/components/data/ActivityFeed.tsx` to read from `listEvents(projectId)` when given an id, or aggregate the most recent events across all projects on the Monitoring page.
- **IMPLEMENT**: Add `projectId?: string` prop. If absent, fetch `useProjects()` then `Promise.all(projects.map(p => listEvents(p.id)))` via a small `useEvents()` hook in `projects-store.ts` (or inline `useQuery` with key `["events", "all"]`). Render the last 5 events newest-first using the same hairline timeline + icon mapping the file already has. If zero events, render a single muted line "No activity yet — create a project to begin."
- **MIRROR**: `DATA_FETCH`, existing `config` icon/colour table in `ActivityFeed.tsx`.
- **IMPORTS**: `listEvents` from `@/lib/projects-api`, `useQuery` from `@tanstack/react-query`.
- **GOTCHA**: The aggregated fetch can be slow if there are many projects — cap at 10 most recent projects, or move to a single backend query later. For this pass, simple `Promise.all` is acceptable since the dev dataset is small.
- **VALIDATE**: With no events in Supabase, the feed shows the empty state. With at least one project + `logEvent`, the row appears.

### Task 10: Wire up post-create hand-off in NewProject
- **ACTION**: In `frontend/src/pages/NewProject.tsx`, after `await createProject…` and the file uploads succeed, navigate to `/app/projects/${project.id}` (Task 8 changed the canonical detail path) and show a one-time toast: "Project ready — open in simulator." On `ProjectDetail.tsx`, the "Open in simulator" CTA (Task 7) is already prominent, so no extra modal is needed.
- **IMPLEMENT**: Change line 144 `navigate(\`/app/projects/${project.id}/analysis\`)` → `navigate(\`/app/projects/${project.id}\`)`. Adjust the toast text from `"Project created"` to `"Project ready — open in simulator next"`.
- **MIRROR**: existing `toast.success` + `navigate` flow.
- **IMPORTS**: none new.
- **GOTCHA**: The wizard already handles the photos-mode 3D conversion via `Workspace3DSection`. Don't re-implement that — only the navigation target changes.
- **VALIDATE**: Run through the wizard end-to-end; land on `/app/projects/<id>` with the simulator button visible.

### Task 11: Delete stub pages and unused components
- **ACTION**: `git rm frontend/src/pages/{Captures,Reports,Portfolio,Help,Settings,Workspace3DConverter,Dashboard,Analysis}.{stub.,}tsx` — keep `Report.stub.tsx`. Delete `frontend/src/components/data/IrradianceMap.tsx`.
- **IMPLEMENT**: `git rm` (or filesystem delete) for the listed files. Ensure nothing imports them by `grep -r "IrradianceMap\|Captures\|Reports\|Portfolio\|Help\|Settings\|Workspace3DConverter" frontend/src` post-delete. Note: the renamed files (`Monitoring`, `Clients`, `ProjectDetail`) replace `Dashboard`, `Portfolio.stub`, `Analysis`.
- **MIRROR**: N/A
- **IMPORTS**: prune from `main.tsx`.
- **GOTCHA**: Do this AFTER tasks 5/6/7 land — otherwise the renames lose their source content. If using `git mv` the rename is the deletion; `Captures`, `Reports`, `Help`, `Settings`, `Workspace3DConverter`, `IrradianceMap` are true deletes.
- **VALIDATE**: `npx tsc --noEmit` returns clean.

### Task 12: Remove unused icons + dead code in NewProject hero copy
- **ACTION**: In `NewProject.tsx`, simplify the page heading (lines 167-178). Strip the italic `<span style={{ fontVariationSettings… }}>` flourish, keep the wizard step indicator + a plain `<h1>` "New project".
- **IMPLEMENT**: Replace the editorial header with a one-line eyebrow + `<h1 className="numeral text-[32px] tracking-[-0.02em] text-ink" style={{ fontWeight: 600 }}>New project</h1>` + one short subtitle. Same treatment for `Monitoring.tsx` and `Clients.tsx` (Task 5/6) — confirm the editorial italic spans are gone.
- **MIRROR**: `TYPOGRAPHY_TOKENS` minus the `fontVariationSettings` italic span.
- **IMPORTS**: prune unused.
- **GOTCHA**: Avoid mass renames of all italic spans across the codebase — only the three page headings change. Keep utility classes alone.
- **VALIDATE**: Visual scan; no `'opsz' 144` strings remain on these three pages.

### Task 13: Make "New project" CTA a demo-only dialog stub
- **ACTION**: Create `frontend/src/components/chrome/DemoDialog.tsx`. Convert every "New project" `<Link to="/app/projects/new">` and every `navigate("/app/projects/new")` call into a button that opens this dialog instead.
- **IMPLEMENT**:
  - `DemoDialog.tsx` exports a small controlled modal: `<DemoDialog open onClose>` with content "Demo build — project creation is disabled. The wizard, 3D conversion, and simulator hand-off are wired but no project rows are written to the database." Single "Got it" button closes it.
  - Style with existing CSS vars: `background: var(--surface)`, `border: 1px solid var(--rule)`, backdrop `bg-ink/40`, centred via `fixed inset-0 grid place-items-center z-50`.
  - Each call site stores `const [demoOpen, setDemoOpen] = useState(false)` and binds the CTA `onClick={() => setDemoOpen(true)}`.
  - Touch sites: `TopBar.tsx` (the pill-shaped "New project" CTA), `Monitoring.tsx` empty state, `Clients.tsx` if it has a CTA, and the TopBar shortcut handler in `use-shortcuts.ts` (`1` should also pop the dialog, not navigate).
  - Keep the `/app/projects/new` route registered so `NewProject.tsx` is still type-checked, but it becomes unreachable from the UI.
- **MIRROR**: `CTA_BUTTON` shape (ink background, paper text); `CSS_VARS`.
- **IMPORTS**: `useState`, `X` icon from `@/icons` for the dialog close button.
- **GOTCHA**: Close on `Escape` and on backdrop click. Use `useEffect` to add/remove the `keydown` listener — don't leak.
- **VALIDATE**: Click any "+ New project" surface; dialog appears; "Got it" closes it; no navigation to `/app/projects/new`; pressing `1` while focus is on body also opens the dialog.

### Task 14: Seed mock projects so Monitoring + Clients show real numbers
- **ACTION**: Export a typed `MOCK_PROJECTS: Project[]` from `frontend/src/data/mock-projects.ts`. Update `listProjects()` in `frontend/src/lib/projects-api.ts` to fall back to this array.
- **IMPLEMENT**:
  - In `mock-projects.ts`, add 6–8 entries with realistic Malaysian sites. Example shape (vary numbers across rows; do not all be the same):
    ```ts
    export const MOCK_PROJECTS: Project[] = [
      {
        id: "PRJ-2026-0001",
        name: "Bukit Jalil — Detached Residence",
        address: "L23 Jalan Akhirat, Bukit Jalil 57000 KL",
        lat: 3.0578, lon: 101.6612,
        intakeMode: "photos",
        status: "ready",
        capturedAt: "2026-04-12T10:30:00+08:00",
        thumbnailHue: 120,
        kwp: 12.4, annualKwh: 17_280, annualSavingsRm: 9_240, paybackYears: 5.9,
        monthlyKwh: [1320, 1280, 1500, 1490, 1480, 1410, 1420, 1450, 1430, 1440, 1380, 1360],
        panels: 20, planes: 3, obstacles: 2, capacityFactor: 0.159,
        reportId: null, modelGlbPath: null, measurementImgPath: null, dataJsonPath: null,
      },
      // …5–7 more rows covering all statuses: ready, processing, draft, failed
    ];
    ```
  - Spread `status` across rows: at least 3 `ready`, 1 `processing`, 1 `draft`, 1 `failed`. This makes `usePortfolioStats` non-zero and `SitesNeedingAttention` (Monitoring) non-empty.
  - In `projects-api.ts`, modify `listProjects` so that if `error` is set OR `data` is `null`/empty, it logs once to `console.warn("[projects-api] using MOCK_PROJECTS fallback")` and returns `MOCK_PROJECTS` instead of throwing. Real Supabase data still wins when present.
- **MIRROR**: existing `rowToProject` mapping for field shapes; existing `Project` type from `mock-projects.ts`.
- **IMPORTS**: `MOCK_PROJECTS` into `projects-api.ts`.
- **GOTCHA**: Do NOT silently swallow Supabase errors that are not "empty" — log a warning and still return mock data, but keep the warning. Real prod calls should not be masked.
- **VALIDATE**: With Supabase unreachable (`VITE_SUPABASE_URL` invalid), `/app` shows non-zero portfolio totals, multiple sites in the Clients table, and at least one row in "Sites needing attention".

### Task 15: Full-width layout — drop `max-w-[1400px]` from every page
- **ACTION**: Across `Monitoring.tsx`, `Clients.tsx`, `ProjectDetail.tsx`, `NewProject.tsx`, remove every `max-w-[1400px]`, `max-w-[860px]`, and `mx-auto` from the outer `<main>` and any `<section>` wrappers.
- **IMPLEMENT**: Each page's outer wrapper becomes `<main className="flex-1 min-w-0 w-full px-8 lg:px-12 py-10">…</main>`. Inner content uses normal flex/grid without width caps. Charts, tables, and viewers expand to fill.
- **MIRROR**: updated `PAGE_SHELL` (full width, no max-w, no mx-auto).
- **IMPORTS**: none.
- **GOTCHA**: `NewProject.tsx` currently switches between `max-w-[1400px]` (photos step) and `max-w-[860px]` (other steps) — drop both. The wizard step content can keep an inner `max-w-[860px]` on the form column if you want readable line lengths, but the page chrome must be full-width.
- **VALIDATE**: On a 1920-wide viewport, content reaches both edges (minus `px-8 lg:px-12` gutters). Nothing is centred with empty bands on either side.

---

## Testing Strategy

### Unit Tests
The current frontend has no Vitest/Jest suite under `frontend/src/`. Do not add one as part of this plan — that is its own scope. Validation is by type-check + manual smoke test.

| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| `tsc --noEmit` | repo state | exit 0 | no |
| Wizard create | demo intake, valid lat/lon | navigates to `/app/projects/<id>` | no |
| Wizard create | photos intake, GLB generated | navigates to `/app/projects/<id>`; project shows GLB viewer | yes |
| Simulator CTA on detail page | click | new tab to `__SIMULATOR_URL__` | no |
| Monitoring with zero projects | empty `projects` array | empty-state line + "New project" CTA | yes |
| Clients row click | click row | `/app/projects/<id>` | no |
| Keyboard `1`/`2`/`3` | focus on body | navigates to /new, /clients, /app | no |
| Keyboard `1` | focus inside `<input>` | does NOT navigate | yes |

### Edge Cases Checklist
- [ ] No projects yet — Monitoring shows empty state, not a broken hero.
- [ ] Project with `status === 'failed'` appears in "Sites needing attention".
- [ ] Project with `modelGlbPath === null` — `ProjectDetail` still renders (falls back to `ExportedSceneViewer` already handled in the existing code).
- [ ] Direct visit to a deleted route (e.g. `/app/portfolio`) — React Router renders nothing; add a catch-all `<Route path="*" element={<Navigate to="/app" replace />} />` inside the `/app` shell.
- [ ] Simulator URL not set in env — `__SIMULATOR_URL__` falls back to `https://solar.limziyang.ml` per `vite.config.ts:8-12`. No crash.
- [ ] Window-blocked popup on the simulator link — `<a target="_blank">` is user-initiated, so no blocker; verify with `rel="noreferrer"`.

---

## Validation Commands

### Static Analysis
```bash
cd frontend && npx tsc --noEmit
```
EXPECT: Zero type errors.

```bash
cd frontend && npm run lint 2>/dev/null || true
```
EXPECT: No new warnings vs. main.

### Build
```bash
cd frontend && npm run build
```
EXPECT: Vite build succeeds; bundle includes `__SIMULATOR_URL__` as a string literal.

### Dev-Server Smoke Test
```bash
cd frontend && npm run dev
```
Visit in order:
- `http://localhost:5174/` — Landing renders.
- `http://localhost:5174/app` — Monitoring with 4 metric tiles.
- `http://localhost:5174/app/clients` — table of projects.
- `http://localhost:5174/app/projects/new` — wizard step 1.
- After create: `/app/projects/<id>` — detail with "Open in simulator" button.

### Dead-Reference Sweep
```bash
grep -rn "ProjectRail\|IrradianceMap\|Captures\|Workspace3DConverter\|Dashboard\.tsx" frontend/src
```
EXPECT: only matches in deleted/renamed file paths (i.e. zero hits after rename + delete).

### Manual Validation
- [ ] TopBar has exactly: logo, 3 nav items, search, "New project" CTA. No bell, no ATAP pill, no help, no gear, no profile.
- [ ] Sidebar `ProjectRail` is not visible on any `/app` route.
- [ ] `/app` page fits in one viewport on 1440×900.
- [ ] `1`/`2`/`3` keyboard shortcuts work; pressing them inside the search input does not navigate; `1` opens the demo dialog instead of navigating.
- [ ] "+ New project" CTA opens a demo dialog. "Got it" closes it. Escape closes it. Backdrop click closes it. No navigation to `/app/projects/new`.
- [ ] Monitoring page shows non-zero portfolio totals (seeded mock data).
- [ ] Clients table shows 6–8 rows with varied statuses.
- [ ] "Sites needing attention" lists at least one processing/failed row.
- [ ] On a 1920-wide viewport, page content uses full width with only `px-8 lg:px-12` gutters — no centred max-width band.
- [ ] "Open in simulator" on a project detail opens `https://solar.limziyang.ml` in a new tab.

---

## Acceptance Criteria
- [ ] Three top-level destinations in nav: New project, Clients, Monitoring.
- [ ] `ProjectRail` deleted from the codebase.
- [ ] `Dashboard`, `Analysis`, `Workspace3DConverter`, `Captures`, `Reports`, `Portfolio`, `Help`, `Settings` page files removed or renamed; only the 5 routes in Task 8 remain under `/app`.
- [ ] Bell, gear, help, profile buttons and ATAP pill are deleted from `TopBar.tsx`.
- [ ] "+ New project" CTA opens `DemoDialog`; no DB write path is reachable from the UI.
- [ ] `MOCK_PROJECTS` is seeded with 6–8 varied-status rows and is the fallback when Supabase returns empty/error.
- [ ] All page wrappers are full width (no `max-w-[1400px]`, no `mx-auto` on outer `<main>`).
- [ ] Simulator hand-off is a primary CTA on the project detail page, using `__SIMULATOR_URL__`.
- [ ] No editorial italic-axis spans remain on the three page headings (Monitoring, Clients, New project).
- [ ] `tsc --noEmit` and `npm run build` both pass.

## Completion Checklist
- [ ] Code follows discovered patterns (naming, CSS vars, typography tokens, CTA shape).
- [ ] Error handling on data hooks unchanged (TanStack Query handles it).
- [ ] No hardcoded URLs — use `__SIMULATOR_URL__`.
- [ ] No leftover imports of deleted files.
- [ ] No leftover stub data in `ActivityFeed.tsx`.
- [ ] Dead-reference sweep is clean.
- [ ] Self-contained — no questions needed during implementation.

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `Analysis.tsx` rename misses internal anchor IDs (`sec-layout`, …) | Low | Medium | They are scoped to the page; only the filename changes. Keep IDs verbatim. |
| `IrradianceMap` is imported somewhere we did not grep | Low | Low | Run the dead-reference sweep before deleting. |
| Removing `Help`/`Settings` routes breaks an external link or bookmark | Low | Low | Add catch-all `*` route → redirect to `/app`. |
| `__SIMULATOR_URL__` not defined when running tests / SSR | Low | Low | Already declared in `vite-env.d.ts`; Vite injects at build time. No SSR in this app. |
| `usePortfolioStats` returns NaN for `avgPayback` when zero ready projects | Low | Low | Hook already guards `ready.length ? … : 0`. |
| Wizard's `prefilledFiles` flow (from the old `Workspace3DConverter` route) loses its entry point | Low | Medium | The standalone converter route is removed; `NewProject` wizard already calls `Workspace3DSection` directly in step 2. The `location.state.prefilledFiles` handler can be deleted or kept as a no-op safety net. |
| Mock fallback masks a real Supabase outage in production | Medium | Medium | The fallback logs `console.warn` on every use; demo build is the intended target. If this ever ships to prod, gate the fallback behind `import.meta.env.DEV` or a `VITE_USE_MOCK` flag. |
| `DemoDialog` swallows real wizard reachability — engineers can't QA the create flow | Low | Low | The route `/app/projects/new` stays registered; manual address-bar visit reaches the wizard. Only the UI entry points are stubbed. |
| Full-width layout makes long lines unreadable on ultrawide displays | Medium | Low | Tables and headers are fine full-width; for paragraph copy inside the wizard, keep an inner `max-w-[860px]` on the form column only. |

## Notes
- Three-section mental model: **Capture (frontend) → Simulate (external URL) → Operate (frontend)**. Keep that in mind when reviewing — anything that does not serve one of those three is candidate for cut.
- `Landing.tsx` at `/` is the marketing front door; do not touch in this plan.
- Backend (`/Users/limjiale/Rexcharge-frontend/backend`) and Supabase schema are unchanged. If a future plan adds a real "clients" table separate from `projects`, this plan's renaming of "Portfolio → Clients" makes that migration trivial.
- The simulator URL is currently hard-coded to `https://solar.limziyang.ml` for all environments in `vite.config.ts`. If multiple environments later need different simulator domains, only that one file changes — the rest of this plan uses `__SIMULATOR_URL__` consistently.
