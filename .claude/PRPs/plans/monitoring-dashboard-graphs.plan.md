# Plan: Monitoring Dashboard — Graph Visualization

## Summary
Replace the 4-tile + flagged-list layout on `/app` (Monitoring page) with a graph-driven dashboard that visualizes portfolio yield, today's power curve, monthly yield-vs-target, and performance gauges using Recharts. Keep header, MetricTile aesthetic for KPIs that stay numeric, and reuse the seeded `MOCK_PROJECTS.monthlyKwh` data plus a synthesized hourly power curve.

## User Story
As a portfolio operator, I want graphs on the monitoring landing so that I can read fleet health at a glance instead of scanning numeric tiles.

## Problem → Solution
Current: 4 KPI tiles + flagged-sites list + activity feed. Numbers are precise but trends, time-of-day shape, and per-site PR are invisible. → Desired: same KPI band on top (shrunk to `md`), then a 2-column graph grid (today power curve, monthly yield vs target), then a 3-up donut/gauge row (PR, soiling, capacity factor), then existing flagged-sites + activity feed retained as-is below.

## Metadata
- **Complexity**: Medium
- **Source PRD**: N/A (free-form request: "for dashboard, use graph to make it more visualise")
- **PRD Phase**: N/A
- **Estimated Files**: 7 (5 new components + 1 new lib + 1 page edit + package.json + store edit)

---

## UX Design

### Before
```
+----------------------------------------------------------+
| Monitoring                                                |
| Active rooftops.                                          |
|                                                           |
| +--------+--------+--------+--------+                    |
| | kWp    | kWh/yr | RM/yr  |payback |  <- 4 large tiles  |
| +--------+--------+--------+--------+                    |
|                                                           |
| +--------------------------+----------+                  |
| | Sites needing attention  | Activity |                  |
| | (list)                   | (feed)   |                  |
| +--------------------------+----------+                  |
+----------------------------------------------------------+
```

### After
```
+----------------------------------------------------------+
| Monitoring                                                |
| Active rooftops.                                          |
|                                                           |
| +--+--+--+--+                                            |
| |kWp|kWh|RM|PB|  <- KPI strip (md variant)               |
| +--+--+--+--+                                            |
|                                                           |
| +----------------------+---------------------+           |
| |  Today . power curve | Monthly yield vs    |           |
| |  (Recharts area)     | target (stacked bar)|           |
| +----------------------+---------------------+           |
|                                                           |
| +--------+--------+--------+                              |
| | PR 96% |soiling |capfact |  <- Radial gauges            |
| +--------+--------+--------+                              |
|                                                           |
| +--------------------------+----------+                  |
| | Sites needing attention  | Activity |  (unchanged)     |
| +--------------------------+----------+                  |
+----------------------------------------------------------+
```

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| KPI tiles | `variant="lg"` (64px numeral) | `variant="md"` (44px) | Frees vertical room for charts |
| Power curve | Absent on Monitoring | New area chart, today only | Synthesize hourly samples from `MOCK_PROJECTS` (sum instPower) |
| Monthly yield | Per-project chart only on ProjectDetail | Aggregated across all `ready` projects on Monitoring | Reuse `monthlyKwh` arrays |
| Gauges | None | 3 radial gauges (PR / soiling / capacity factor) | New component |
| Hover | Static numbers | Recharts tooltip with mono font | Match existing aesthetic |

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `frontend/src/pages/Monitoring.tsx` | 1-169 | Page being modified — full layout |
| P0 | `frontend/src/components/data/MonthlyYieldChart.tsx` | 1-167 | Existing SVG chart pattern: container styling, mono labels, leaf gradient, color tokens. Mirror visual language in Recharts components |
| P0 | `frontend/src/components/metrics/MetricTile.tsx` | 1-89 | KPI tile variants & accent prop |
| P0 | `frontend/src/store/projects-store.ts` | 37-49 | `usePortfolioStats` shape — extend if needed |
| P1 | `frontend/src/data/mock-projects.ts` | 1-27 | `Project` type — `monthlyKwh`, `capacityFactor`, `annualKwh` |
| P1 | `frontend/src/components/landing/RooftopPreview.tsx` | 19-40 | `sampleSun` math for power-curve synthesis (already in repo, copy formula) |
| P2 | `frontend/src/components/data/ActivityFeed.tsx` | 1-40 | Card styling reference (`bg-surface rounded-2xl`, hairline border) |
| P2 | `frontend/src/styles/globals.css` | search `--leaf`, `--solar`, `--terracotta` | CSS variable palette for chart fills |

## External Documentation

| Topic | Source | Key Takeaway |
|---|---|---|
| Recharts AreaChart | recharts.org/en-US/api/AreaChart | Use `<ResponsiveContainer>` wrapper; pass `width="100%"` so parent flex/grid controls size |
| Recharts BarChart stacked | recharts.org/en-US/api/Bar | Add `stackId` to multiple `<Bar>` for stack; use `Cell` for per-bar color |
| Recharts RadialBarChart | recharts.org/en-US/examples/SimpleRadialBarChart | `startAngle=90 endAngle=-270` for full ring; `cornerRadius` rounds the cap |
| Recharts tooltip custom | recharts.org/en-US/api/Tooltip | Pass `content={<CustomTooltip />}` to override styling — required to match mono font |
| Recharts ResponsiveContainer | github.com/recharts/recharts/issues/3615 | Needs `minHeight` or numeric `height` or it renders 0px on first paint — set `height={N}` directly |

KEY_INSIGHT: Project uses CSS vars (`var(--leaf-deep)` etc.), not Tailwind palette. Recharts accepts CSS-var strings as `fill`/`stroke`.
APPLIES_TO: All chart fill/stroke props.
GOTCHA: Some Recharts internals serialize the prop to inline SVG; CSS vars resolve at paint, works in Chrome/Safari/Firefox 31+. No polyfill needed.

KEY_INSIGHT: Recharts ESM bundle is ~95kb gzipped. Project bundle already heavy with three.js — chunk-split via Vite manual chunks if bundle audit complains.
APPLIES_TO: `vite.config.ts` if size budget triggered (not blocking).
GOTCHA: Don't import default from `recharts`. Use named imports — tree-shaking only works that way.

---

## Patterns to Mirror

### NAMING_CONVENTION
```tsx
// SOURCE: frontend/src/components/data/MonthlyYieldChart.tsx:7
export default function MonthlyYieldChart({ data, height = 180 }: { data: number[]; height?: number }) {
```
Default export PascalCase, props inlined, prop-default in destructure. New chart components follow same shape.

### CARD_CONTAINER
```tsx
// SOURCE: frontend/src/components/data/MonthlyYieldChart.tsx:34
<div className="bg-surface rounded-2xl p-5" style={{ border: "1px solid var(--rule)" }}>
  <div className="flex items-baseline justify-between mb-3">
    <div>
      <h3 className="text-[13px] font-extrabold tracking-tight">Title</h3>
      <p className="mono text-[10px] uppercase tracking-[0.16em] text-mute mt-0.5">subcaption</p>
    </div>
    <div className="text-right">
      <p className="numeral text-[22px] tab-num leading-none" style={{ fontWeight: 600 }}>{total}</p>
      <p className="mono text-[10px] uppercase tracking-[0.14em] text-mute">unit</p>
    </div>
  </div>
  {/* chart */}
</div>
```
Every chart card uses this header. Title `text-[13px] font-extrabold`, subcaption mono uppercase.

### COLOR_TOKENS
```tsx
// SOURCE: frontend/src/components/data/MonthlyYieldChart.tsx:51-55, MetricTile.tsx:42-44
fill="var(--leaf)"       // primary positive
fill="var(--leaf-deep)"  // emphasis
fill="var(--solar)"      // yellow/yield
fill="var(--terracotta)" // negative/alert
fill="var(--mint)"       // muted bar fill
stroke="var(--rule)"     // hairlines/grid
```

### LOADING_STATE
```tsx
// SOURCE: frontend/src/pages/Monitoring.tsx:32-44
{isLoading ? (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-7">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="rounded-2xl animate-pulse bg-surface"
        style={{ minHeight: 140, border: "1px solid var(--rule)" }} />
    ))}
  </div>
) : ( /* content */ )}
```
Skeleton: same shape as final card, `animate-pulse`, hairline border.

### DATA_HOOK
```tsx
// SOURCE: frontend/src/store/projects-store.ts:37-49
export function usePortfolioStats() {
  const { data: projects = [] } = useProjects()
  const ready = projects.filter((p: Project) => p.status === 'ready')
  return { totalKwp: ready.reduce(...), ... }
}
```
Aggregated views live in `projects-store.ts` as derived hooks. Add `usePortfolioCharts()` here, not in the page.

### TYPOGRAPHY_TONE
```tsx
// SOURCE: throughout
className="mono uppercase tracking-[0.18em]"  // labels/units
className="numeral tab-num"                    // any number
```
Tooltip and axis tick labels must use `JetBrains Mono Variable, monospace` (matches MonthlyYieldChart.tsx:77).

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `frontend/package.json` | UPDATE | Add `recharts` dependency |
| `frontend/src/components/data/PowerCurveCard.tsx` | CREATE | New: today's power curve area chart |
| `frontend/src/components/data/YieldVsTargetCard.tsx` | CREATE | New: stacked bar (actual vs gap-to-target) per month |
| `frontend/src/components/data/RadialGaugeCard.tsx` | CREATE | New: single radial gauge — reused 3x |
| `frontend/src/components/data/PortfolioGaugesRow.tsx` | CREATE | New: 3-up gauge row composing RadialGaugeCard |
| `frontend/src/lib/dashboard-series.ts` | CREATE | New: pure functions to derive hourly power curve + monthly aggregate |
| `frontend/src/store/projects-store.ts` | UPDATE | Add `usePortfolioCharts()` hook returning chart-ready series |
| `frontend/src/pages/Monitoring.tsx` | UPDATE | Insert chart grid between KPI strip and flagged-sites |

## NOT Building
- ProjectDetail page changes (`MonthlyYieldChart` there stays as-is)
- Real-time data wiring — all series derive from `MOCK_PROJECTS` + sun-curve math
- Date/range picker — today only for power curve
- Drill-down from chart to project — out of scope, links in flagged-sites already cover navigation
- Dark mode tuning — inherits theme via CSS vars
- Storybook / chart unit-test harness — visual QA in browser

---

## Step-by-Step Tasks

### Task 1: Add Recharts dependency
- **ACTION**: Install recharts.
- **IMPLEMENT**: `cd frontend && npm install recharts@^2.13.0`
- **MIRROR**: Other deps in `package.json` use caret ranges.
- **IMPORTS**: N/A.
- **GOTCHA**: Recharts pulls `react-smooth` and `d3-*` transitive deps. No version pin issues with React 18.3.
- **VALIDATE**: `grep recharts frontend/package.json` shows entry; `npm ls recharts` no peer warnings.

### Task 2: Create series-derivation helper
- **ACTION**: Build pure helpers that turn `Project[]` into chart-ready series.
- **IMPLEMENT**: New file `frontend/src/lib/dashboard-series.ts` exporting:
  - `buildHourlyPowerCurve(projects: Project[]): { hour: number; kw: number }[]` — for each of 24 hours, compute `t = hour/24`, run the `sampleSun` formula from `RooftopPreview.tsx:19-31` summed over `ready` projects (use `kwp = p.kwp`, fixed `eta=0.97 soiling=0.96 derate=0.95`). Return all 24 points.
  - `buildMonthlyYieldVsTarget(projects: Project[]): { month: string; actual: number; gap: number }[]` — sum `monthlyKwh[i]` across ready projects per month; target = `annualTotal / 12 * 1.05`; `gap = max(0, target - actual)`. Months: `['Jan','Feb',...,'Dec']`.
  - `buildGaugeValues(projects: Project[]): { pr: number; soiling: number; capacityFactor: number }` — `pr = 0.94`, `soiling = 0.96`, `capacityFactor = avg(p.capacityFactor) || 0`.
- **MIRROR**: Naming style from `projects-store.ts:37` (`usePortfolioStats`); pure functions, no React.
- **IMPORTS**: `import type { Project } from '@/data/mock-projects'`
- **GOTCHA**: `sampleSun` in landing has early return for `elev <= 0`. Keep it — gives the curve its sunrise/sunset zero points. Don't filter out zero-power hours; the chart needs the full 0-24 axis.
- **VALIDATE**: Sanity check by mounting and inspecting: `buildHourlyPowerCurve(MOCK_PROJECTS).length === 24` and peak kw falls near hour 12.

### Task 3: Extend `usePortfolioCharts` hook
- **ACTION**: Add a React hook in `projects-store.ts` that wraps the helpers above.
- **IMPLEMENT**: Below `usePortfolioStats`:
  ```ts
  import {
    buildHourlyPowerCurve,
    buildMonthlyYieldVsTarget,
    buildGaugeValues,
  } from '../lib/dashboard-series'

  export function usePortfolioCharts() {
    const { data: projects = [] } = useProjects()
    return {
      powerCurve: buildHourlyPowerCurve(projects),
      monthly: buildMonthlyYieldVsTarget(projects),
      gauges: buildGaugeValues(projects),
    }
  }
  ```
- **MIRROR**: `usePortfolioStats` pattern (`projects-store.ts:37`).
- **IMPORTS**: see snippet.
- **GOTCHA**: Don't memo with `useMemo` unless profiler shows churn — `useProjects` returns referentially stable data from react-query cache.
- **VALIDATE**: `tsc --noEmit` clean; hook callable from Monitoring without runtime error.

### Task 4: Build `PowerCurveCard`
- **ACTION**: Recharts AreaChart of today's combined-fleet power kW vs hour.
- **IMPLEMENT**: New file `frontend/src/components/data/PowerCurveCard.tsx`. Default export, prop `data: { hour: number; kw: number }[]`. Wrap in CARD_CONTAINER from Patterns to Mirror. Header title `"Today . power curve"`, subcaption `"Aggregate kW . PVGIS clear-sky"`. Right-aligned numeral = peak kW.
  ```tsx
  <ResponsiveContainer width="100%" height={220}>
    <AreaChart data={data} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
      <defs>
        <linearGradient id="leafFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--leaf)" stopOpacity={0.55} />
          <stop offset="100%" stopColor="var(--leaf)" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid stroke="var(--rule)" strokeDasharray="2 4" vertical={false} />
      <XAxis dataKey="hour" tickFormatter={(h) => `${h}h`}
        tick={{ fontSize: 9, fontFamily: 'JetBrains Mono Variable, monospace', fill: 'var(--mute)' }}
        axisLine={false} tickLine={false} />
      <YAxis tick={{ fontSize: 9, fontFamily: 'JetBrains Mono Variable, monospace', fill: 'var(--mute)' }}
        axisLine={false} tickLine={false} width={32} />
      <Tooltip content={<MonoTooltip unit="kW" />} />
      <Area type="monotone" dataKey="kw" stroke="var(--leaf-deep)" strokeWidth={1.5} fill="url(#leafFade)" />
    </AreaChart>
  </ResponsiveContainer>
  ```
  Inline `MonoTooltip` in same file:
  ```tsx
  function MonoTooltip({ active, payload, label, unit }: any) {
    if (!active || !payload?.[0]) return null;
    return (
      <div className="bg-paper rounded-md px-2.5 py-1.5 mono text-[10.5px]" style={{ border: '1px solid var(--rule)' }}>
        {label}h . {Number(payload[0].value).toFixed(1)} {unit}
      </div>
    );
  }
  ```
- **MIRROR**: CARD_CONTAINER, TYPOGRAPHY_TONE, COLOR_TOKENS.
- **IMPORTS**: `import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'`
- **GOTCHA**: Use `height={220}` on `ResponsiveContainer` — don't omit; without it the chart paints zero-height before the first resize event. `width="100%"` is fine.
- **VALIDATE**: Renders a bell-shaped curve peaking ~noon. Tooltip on hover shows e.g. `12h . 47.3 kW` in JetBrains Mono.

### Task 5: Build `YieldVsTargetCard`
- **ACTION**: Stacked bar chart, actual + gap-to-target per month.
- **IMPLEMENT**: New file `frontend/src/components/data/YieldVsTargetCard.tsx`. Header title `"Monthly yield vs target"`, subcaption `"Aggregate kWh . 12 mo"`, right numeral = annual total (`data.reduce((s,d) => s + d.actual, 0)`).
  ```tsx
  <ResponsiveContainer width="100%" height={220}>
    <BarChart data={data} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
      <CartesianGrid stroke="var(--rule)" strokeDasharray="2 4" vertical={false} />
      <XAxis dataKey="month" tick={{ fontSize: 9, fontFamily: 'JetBrains Mono Variable, monospace', fill: 'var(--mute)' }}
        axisLine={false} tickLine={false} />
      <YAxis tick={{ fontSize: 9, fontFamily: 'JetBrains Mono Variable, monospace', fill: 'var(--mute)' }}
        axisLine={false} tickLine={false} width={36} />
      <Tooltip content={<StackTooltip />} />
      <Bar dataKey="actual" stackId="m" fill="var(--leaf)" radius={[0,0,0,0]} />
      <Bar dataKey="gap" stackId="m" fill="var(--mint)" radius={[3,3,0,0]} />
    </BarChart>
  </ResponsiveContainer>
  ```
  `StackTooltip`: shows `actual` in leaf and `target = actual + gap` in mute, mono font.
- **MIRROR**: Same patterns as Task 4.
- **IMPORTS**: `import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'`
- **GOTCHA**: Top-radius only on the topmost stack segment (`gap`), not `actual` — otherwise rounded corners appear mid-stack.
- **VALIDATE**: 12 bars Jan-Dec; visible leaf segment + lighter mint cap; tooltip lists both.

### Task 6: Build `RadialGaugeCard`
- **ACTION**: Single radial gauge with center numeral.
- **IMPLEMENT**: New file `frontend/src/components/data/RadialGaugeCard.tsx`. Props: `{ label: string; value: number; max?: number; suffix?: string; accent?: 'leaf'|'solar'|'terracotta' }`.
  ```tsx
  const m = max ?? 1;
  const fillVar = `var(--${accent ?? 'leaf'}-deep, var(--leaf-deep))`;
  const data = [{ name: label, value, fill: fillVar }];
  return (
    <div className="bg-surface rounded-2xl p-5 relative" style={{ border: '1px solid var(--rule)' }}>
      <div className="mono text-[10px] uppercase tracking-[0.18em] text-mute mb-2">{label}</div>
      <ResponsiveContainer width="100%" height={160}>
        <RadialBarChart innerRadius="70%" outerRadius="100%" data={data}
          startAngle={90} endAngle={90 - (value / m) * 360}>
          <PolarAngleAxis type="number" domain={[0, m]} angleAxisId={0} tick={false} />
          <RadialBar background={{ fill: 'var(--rule)' }} dataKey="value" cornerRadius={8} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ paddingTop: 28 }}>
        <span className="numeral tab-num text-[28px]" style={{ fontWeight: 600 }}>
          {(value * 100).toFixed(0)}{suffix ?? '%'}
        </span>
      </div>
    </div>
  );
  ```
- **MIRROR**: CARD_CONTAINER (simplified — no right-side total).
- **IMPORTS**: `import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts'`
- **GOTCHA**: Recharts radial uses cartesian-clockwise from `startAngle=90` going negative for clockwise fill. `endAngle = 90 - fraction*360`. Test with `value=0.5 max=1` -> expect half-ring (endAngle = -90).
- **VALIDATE**: Mount with value=0.96 -> ring ~96% full, center shows `96%`.

### Task 7: Compose `PortfolioGaugesRow`
- **ACTION**: Three RadialGaugeCard side by side.
- **IMPLEMENT**: New file `frontend/src/components/data/PortfolioGaugesRow.tsx`:
  ```tsx
  import RadialGaugeCard from './RadialGaugeCard'
  export default function PortfolioGaugesRow({ pr, soiling, capacityFactor }: { pr: number; soiling: number; capacityFactor: number }) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <RadialGaugeCard label="Performance ratio" value={pr} accent="leaf" />
        <RadialGaugeCard label="Soiling factor"    value={soiling} accent="solar" />
        <RadialGaugeCard label="Capacity factor"   value={capacityFactor} accent="terracotta" />
      </section>
    )
  }
  ```
- **MIRROR**: Grid pattern from `Monitoring.tsx:107` (`grid grid-cols-1 xl:grid-cols-3 gap-5`).
- **IMPORTS**: see snippet.
- **GOTCHA**: `md:grid-cols-3` keeps the row collapsible on tablet. Avoid `xl:grid-cols-3` — gauges read fine at md breakpoint.
- **VALIDATE**: At 1024px viewport three cards side-by-side; at 640px stacks.

### Task 8: Wire chart row into `Monitoring.tsx`
- **ACTION**: Insert new sections between KPI band and flagged-sites; shrink KPI tiles.
- **IMPLEMENT**: In `frontend/src/pages/Monitoring.tsx`:
  1. Add imports:
     ```tsx
     import PowerCurveCard from "@/components/data/PowerCurveCard";
     import YieldVsTargetCard from "@/components/data/YieldVsTargetCard";
     import PortfolioGaugesRow from "@/components/data/PortfolioGaugesRow";
     ```
     and extend store import to include `usePortfolioCharts`.
  2. Call hook: `const { powerCurve, monthly, gauges } = usePortfolioCharts();` next to `usePortfolioStats`.
  3. Change all four `<MetricTile variant="lg" />` -> `variant="md"`. Reduce wrapper padding `p-7` -> `p-6` and `gap-7` -> `gap-6` so the strip is shorter.
  4. After the KPI tiles block (`</div>` at line ~89) and before the empty-state, add:
     ```tsx
     {!isLoading && projects.length > 0 && (
       <section className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-5">
         <PowerCurveCard data={powerCurve} />
         <YieldVsTargetCard data={monthly} />
       </section>
     )}
     {!isLoading && projects.length > 0 && (
       <section className="mt-5">
         <PortfolioGaugesRow {...gauges} />
       </section>
     )}
     ```
  5. Leave flagged-sites + activity feed section (`Monitoring.tsx:106-115`) untouched.
- **MIRROR**: Section gating uses the `!isLoading && projects.length > 0` guard already present at line 106.
- **IMPORTS**: see step 1.
- **GOTCHA**: Don't break the loading skeleton — keep `Array.from({length:4})` shape. Optionally extend with two more skeleton boxes for the chart row; nice-to-have, skip if it bloats this task.
- **VALIDATE**: `npm run dev` -> `/app` shows KPI strip -> two-up charts -> three-up gauges -> flagged-sites/activity. Hover charts shows tooltip. Resize narrows to single column below `xl` breakpoint.

---

## Testing Strategy

### Unit Tests
Project's `lint` script is `tsc --noEmit`. No Vitest/Jest in `package.json`. Don't introduce a test runner in this plan — manual verification only.

### Edge Cases Checklist
- [ ] `projects = []` (no ready projects) -> chart sections hidden by `projects.length > 0` guard; KPI strip still shows zeros via existing `usePortfolioStats`
- [ ] `projects` all `status !== 'ready'` -> power curve and monthly arrays are all-zero; charts render flat (acceptable)
- [ ] Loading state -> existing skeleton shown; charts not yet mounted
- [ ] Browser at 600px width -> KPI tiles stack 2-cols, charts stack 1-col, gauges stack 1-col

---

## Validation Commands

### Static Analysis
```bash
cd /Users/limjiale/Rexcharge-frontend/frontend && npm run lint
```
EXPECT: Zero type errors.

### Build
```bash
cd /Users/limjiale/Rexcharge-frontend/frontend && npm run build
```
EXPECT: Vite build success; bundle warning about size acceptable (note new ~95kb gzip from recharts).

### Dev server (visual verification)
```bash
cd /Users/limjiale/Rexcharge-frontend/frontend && npm run dev
```
Then open `http://localhost:5173/app`.

### Manual Validation
- [ ] KPI strip is shorter than before
- [ ] Power curve renders bell shape, peak near 12h
- [ ] Monthly chart shows 12 bars Jan-Dec, leaf + mint stack
- [ ] Three gauges render with center numeral (PR ~94%, soiling 96%, cap factor ~16%)
- [ ] Tooltip uses JetBrains Mono and matches existing card aesthetic
- [ ] Charts collapse to single column below xl breakpoint
- [ ] No console errors or React warnings
- [ ] Flagged-sites + activity feed below still works unchanged

---

## Acceptance Criteria
- [ ] All 8 tasks completed
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Visual QA checklist above all checked
- [ ] No regression on `/app/projects/:id` (ProjectDetail still works)

## Completion Checklist
- [ ] Recharts imports are named (not default)
- [ ] Every chart card mirrors CARD_CONTAINER pattern
- [ ] All chart fills use CSS vars, not hex
- [ ] Hooks live in `projects-store.ts`, pure helpers in `lib/dashboard-series.ts`
- [ ] No mock data hardcoded inside chart components
- [ ] No new untyped `any` (one exception: Recharts tooltip render-prop arg)

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Recharts bundle pushes total over budget | Medium | Low | Project already ships three.js; recharts is small relative. Defer chunk-split unless audit fails |
| `ResponsiveContainer` zero-height bug | Medium | Medium | Always pass numeric `height` prop (220 / 160) — documented in GOTCHA |
| CSS var resolution in Recharts SVG | Low | Low | Modern browsers resolve at paint; falls back to default if undefined. Tested vars exist in `globals.css` |
| Mock-derived gauges look static / fake | Low | Low | Acceptable for demo; clearly labeled metrics; not blocking |

## Notes
- The synthesized hourly curve uses the same `sampleSun` formula as `RooftopPreview.tsx`. Consider extracting `sampleSun` into `lib/dashboard-series.ts` and importing from both — out of scope here, leave as a TODO comment in the new file.
- If user later wants real-time data, the hook layer (`usePortfolioCharts`) is the seam — swap pure helpers for a fetched series and the page doesn't change.
- ProjectDetail's `MonthlyYieldChart` is intentionally untouched. Different audience: per-site detail vs portfolio overview.
