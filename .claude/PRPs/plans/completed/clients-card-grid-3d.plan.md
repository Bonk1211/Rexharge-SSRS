# Plan: Clients Page — Card Grid with 3D Model Preview

## Summary
Replace the table on `/app/clients` with a 3-column card grid where each card has a live 3D model placeholder on top and project details below. Reuse the existing `ProjectCard` component (already shaped for gallery use, currently uncalled) and swap its `ThumbArtwork` SVG with a new lightweight `Mini3DPreview` component that loads `modelGlbPath` via `useSignedUrl` and falls back to the procedural `RoofScene` when no GLB is uploaded.

## User Story
As a sales/account user viewing the Clients page, I want each client project shown as a card with a rotating 3D model preview and its key metrics underneath so that I can recognize the site visually and compare projects without opening each one.

## Problem -> Solution
Current: dense data table — readable but no visual anchor; no sense of physical site. -> Desired: 3-per-row grid of cards; each card top half = live spinning 3D model (real GLB when present, procedural rooftop fallback otherwise); bottom half = name, address, kWp/kWh/savings, sparkline.

## Metadata
- **Complexity**: Medium
- **Source PRD**: N/A (free-form: "on client page, show client project using card 3 project in one row, in the card there will be a place holder to show their 3d model, and below it is the detail of the project")
- **PRD Phase**: N/A
- **Estimated Files**: 3 (1 new component, 2 updates)

---

## UX Design

### Before
```
+------------------------------------------------------------+
| Clients                                                     |
| Clients & sites.                                            |
| One row per client project. Click a row to open monitoring. |
|                                                             |
| [4 SummaryCells]                                            |
|                                                             |
| ----- Clients -----                                         |
| +-------------------------------------------------------+   |
| | ID | Client | Address | kWp | kWh/yr | Saving | ...  |   |
| +-------------------------------------------------------+   |
| | PRJ-001 | Bukit Jalil | Jalan ... | 12.4 kWp | ...    |   |
| | PRJ-002 | PJ Light-ind | Jalan ... | 52.08 kWp | ...  |   |
| | ...                                                    |   |
| +-------------------------------------------------------+   |
+------------------------------------------------------------+
```

### After
```
+------------------------------------------------------------+
| Clients                                                     |
| Clients & sites.                                            |
| Each card opens the site's analysis view.                   |
|                                                             |
| [4 SummaryCells]                                            |
|                                                             |
| ----- Clients -----                                         |
| +-----------+ +-----------+ +-----------+                  |
| | [3D MODEL]| | [3D MODEL]| | [3D MODEL]|                  |
| | rotating  | | rotating  | | rotating  |                  |
| +-----------+ +-----------+ +-----------+                  |
| | name      | | name      | | name      |                  |
| | addr      | | addr      | | addr      |                  |
| | kWp kWh $ | | kWp kWh $ | | kWp kWh $ |                  |
| | spark·time| | spark·time| | spark·time|                  |
| +-----------+ +-----------+ +-----------+                  |
| +-----------+ +-----------+ +-----------+                  |
| | ...       | | ...       | | ...       |                  |
| +-----------+ +-----------+ +-----------+                  |
+------------------------------------------------------------+
```

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| Project row | `<tr>` clickable -> `/app/projects/:id` | Whole card `<Link>` -> `/app/projects/:id/analysis` | ProjectCard already routes to analysis |
| Thumbnail | None (table) | Live r3f Canvas, autoRotate | `Mini3DPreview` |
| GLB fallback | N/A | Procedural `RoofScene` | When `modelGlbPath` is null |
| Sparkline | Not shown | Visible bottom of card | Already in ProjectCard |
| Layout | One column table, scroll vertically | Grid: 1 col mobile, 2 col md, 3 col xl | Standard breakpoints |
| Page caption | "One row per client project. Click a row to open the monitoring view." | "Each card opens the site's analysis view." | Match new affordance |

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `frontend/src/pages/Clients.tsx` | 1-87 | Page being modified — header + summary cells stay, table goes |
| P0 | `frontend/src/components/data/ProjectCard.tsx` | 1-161 | Existing gallery card (uncalled) — exact shape to reuse. ThumbArtwork at 117-161 to replace |
| P0 | `frontend/src/components/viewer/MeshViewer.tsx` | 16-29, 41-80 | GLB loader pattern (`useGLTF`, cloning, center on origin); Canvas setup for heavy viewer (light it down for cards) |
| P0 | `frontend/src/scene/RoofScene.tsx` | 1-50 | Procedural fallback scene used when no GLB |
| P0 | `frontend/src/store/projects-store.ts` | 76-83 | `useSignedUrl(bucket, path)` — hook to resolve `modelGlbPath` to signed URL |
| P1 | `frontend/src/pages/ProjectDetail.tsx` | 30-40, 120-130 | Example caller of useSignedUrl + MeshViewer |
| P1 | `frontend/src/data/mock-projects.ts` | 1-27 | `Project.modelGlbPath` is `string \| null`. Most mock rows have `null` — fallback is the common path |
| P2 | `frontend/src/components/data/Sparkline.tsx` | all | Already imported by ProjectCard — no change needed |

## External Documentation

| Topic | Source | Key Takeaway |
|---|---|---|
| react-three-fiber Canvas perf | docs.pmnd.rs/react-three-fiber/advanced/performance | Multiple Canvases share one WebGL context per Canvas instance — keep DPR low (`dpr={[1, 1.5]}`) and disable shadows in card thumbs |
| @react-three/drei autoRotate | drei docs: `<OrbitControls autoRotate />` | OrbitControls drives the rotation loop; with `enableZoom={false} enablePan={false}` becomes display-only |
| useGLTF caching | drei docs: `useGLTF.preload` | Already-loaded GLBs are cached by URL across components; safe to mount same GLB in multiple cards (won't refetch) |

KEY_INSIGHT: Each `<Canvas>` opens its own WebGL context. Safari caps ~16 simultaneous contexts; Chrome ~32. With pagination/grid showing typically <12 cards, no issue. Still, lazy-mount on intersect for safety on large portfolios — out of scope here but flagged.
APPLIES_TO: `Mini3DPreview` and the new Clients grid.
GOTCHA: Don't set `shadows` on the card Canvas — shadow-map per Canvas is GPU-expensive. Use `ContactShadows` only or none.

KEY_INSIGHT: `useGLTF(url)` suspends. Wrap in `<Suspense fallback={<Html>...}>` (same pattern as MeshViewer.tsx:60). If you forget, the whole card subtree throws.
APPLIES_TO: `Mini3DPreview` GLB branch.
GOTCHA: Pass `dispose={null}` on the Canvas if cards remount frequently — prevents re-uploading textures. Acceptable to skip for first pass.

---

## Patterns to Mirror

### NAMING_CONVENTION
```tsx
// SOURCE: frontend/src/components/data/ProjectCard.tsx:19
export default function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
```
Default export PascalCase; prop type inlined; optional index for stagger animation.

### CARD_LINK_WRAPPER
```tsx
// SOURCE: frontend/src/components/data/ProjectCard.tsx:22-29
<Link
  to={`/app/projects/${project.id}/analysis`}
  className="group relative bg-surface rounded-2xl overflow-hidden flex flex-col animate-riseIn"
  style={{ border: "1px solid var(--rule)", animationDelay: `${index * 60}ms` }}
>
```
Cards are anchor tags. `group` enables hover styles for child arrow icon.

### THUMB_BLOCK
```tsx
// SOURCE: frontend/src/components/data/ProjectCard.tsx:31-45
<div
  className="relative aspect-[16/9] overflow-hidden"
  style={{
    background: `linear-gradient(135deg, hsl(${project.thumbnailHue} 38% 88%), hsl(${project.thumbnailHue} 22% 70%))`,
    borderBottom: "1px solid var(--rule)",
  }}
>
  <ThumbArtwork hue={project.thumbnailHue} />
  <div className="absolute top-3 right-3"><StatusPill status={project.status} /></div>
  <div className="absolute bottom-3 left-3 mono text-[10px] uppercase tracking-[0.16em] text-ink/70">
    {intakeLabel[project.intakeMode] ?? project.intakeMode}
  </div>
</div>
```
Top section is `aspect-[16/9]`, hairline bottom border, status pill top-right, intake mode caption bottom-left. PRESERVE this exact shape; only replace `<ThumbArtwork />` line with `<Mini3DPreview />`.

### GLB_LOADER
```tsx
// SOURCE: frontend/src/components/viewer/MeshViewer.tsx:16-29
function GlbModel({ url }: { url: string }) {
  const gltf = useGLTF(url);
  const scene = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((obj) => {
      if (obj instanceof THREE.Mesh) { obj.castShadow = true; obj.receiveShadow = true; }
    });
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    clone.position.set(-center.x, -box.min.y, -center.z);
    return clone;
  }, [gltf.scene]);
  return <primitive object={scene} />;
}
```
For Mini3DPreview, drop `castShadow/receiveShadow` (no shadows in card Canvas) but keep the centering math.

### SIGNED_URL_HOOK
```tsx
// SOURCE: frontend/src/pages/ProjectDetail.tsx:32-35
const { data: glbUrl } = useSignedUrl(
  project?.modelGlbPath ? 'project-models' : undefined,
  project?.modelGlbPath ?? undefined,
);
```
Pass `undefined` to disable the query when no path; the hook gates internally on truthy args.

### CONTAINER_SECTION_HEADER
```tsx
// SOURCE: frontend/src/pages/Clients.tsx:28
<HairlineRule label="Clients" className="mb-5" />
```
KEEP. The header rule above the grid stays.

### TYPOGRAPHY_TONE
```tsx
// SOURCE: frontend/src/components/data/ProjectCard.tsx:51-57
<h3 className="text-[15.5px] font-extrabold text-ink leading-tight tracking-[-0.01em]">{project.name}</h3>
<div className="flex items-center gap-1 mt-1 text-mute text-[11.5px]">
  <MapPin weight="duotone" size={11} />
  <span className="truncate">{project.address}</span>
</div>
```
KEEP existing card body intact.

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `frontend/src/components/data/Mini3DPreview.tsx` | CREATE | New lightweight r3f Canvas for card thumbs; GLB if available, procedural fallback otherwise |
| `frontend/src/components/data/ProjectCard.tsx` | UPDATE | Swap `<ThumbArtwork />` for `<Mini3DPreview project={project} />`; remove ThumbArtwork helper if unused |
| `frontend/src/pages/Clients.tsx` | UPDATE | Remove table, render `<ProjectCard />` grid |

## NOT Building
- Pagination / virtual scrolling for large client lists (skip — current mock is <10 rows)
- Lazy-mount Canvas on intersect (skip — same reason; flagged in Notes for future)
- Custom 3D camera per card (use one camera preset)
- Per-card OrbitControls user interaction (display-only autoRotate — clicking a card opens detail)
- Replacing the table on Monitoring's flagged-sites list (different surface)
- Changing `useSignedUrl` caching or signed-URL TTL
- Removing or restyling the 4-up SummaryCells row (kept as-is)
- Editing `MeshViewer.tsx` (heavy viewer for detail page stays untouched)

---

## Step-by-Step Tasks

### Task 1: Create `Mini3DPreview`
- **ACTION**: Build the lightweight 3D card thumbnail component.
- **IMPLEMENT**: New file `frontend/src/components/data/Mini3DPreview.tsx`.
  ```tsx
  import { Suspense, useMemo } from "react";
  import { Canvas } from "@react-three/fiber";
  import { Bounds, ContactShadows, Html, OrbitControls, useGLTF } from "@react-three/drei";
  import * as THREE from "three";
  import RoofScene from "@/scene/RoofScene";
  import { useSignedUrl } from "@/store/projects-store";
  import type { Project } from "@/data/mock-projects";

  function GlbModel({ url }: { url: string }) {
    const gltf = useGLTF(url);
    const scene = useMemo(() => {
      const clone = gltf.scene.clone(true);
      const box = new THREE.Box3().setFromObject(clone);
      const center = box.getCenter(new THREE.Vector3());
      clone.position.set(-center.x, -box.min.y, -center.z);
      return clone;
    }, [gltf.scene]);
    return <primitive object={scene} />;
  }

  function LoadingBadge() {
    return (
      <Html center>
        <div className="mono text-[9px] uppercase tracking-[0.18em] text-mute">loading model</div>
      </Html>
    );
  }

  export default function Mini3DPreview({ project }: { project: Project }) {
    const { data: glbUrl } = useSignedUrl(
      project.modelGlbPath ? "project-models" : undefined,
      project.modelGlbPath ?? undefined,
    );

    return (
      <Canvas
        dpr={[1, 1.5]}
        camera={
          glbUrl
            ? { position: [3.8, 2.6, 4.6], fov: 42, near: 0.1, far: 100 }
            : { position: [16, 12, 18], fov: 38, near: 0.1, far: 200 }
        }
        style={{ background: "transparent" }}
        gl={{ antialias: true, powerPreference: "low-power" }}
      >
        <color attach="background" args={["#f7f5ef"]} />
        <ambientLight intensity={0.9} />
        <hemisphereLight args={["#ffffff", "#94a3b8", 1.0]} />
        <directionalLight position={[5, 7, 6]} intensity={2.2} />
        <Suspense fallback={<LoadingBadge />}>
          {glbUrl ? (
            <Bounds fit clip observe margin={1.4}>
              <GlbModel url={glbUrl} />
            </Bounds>
          ) : (
            <RoofScene />
          )}
          <ContactShadows position={[0, -0.01, 0]} opacity={0.28} scale={8} blur={2.6} far={8} />
        </Suspense>
        <OrbitControls
          makeDefault
          autoRotate
          autoRotateSpeed={0.9}
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
        />
      </Canvas>
    );
  }
  ```
- **MIRROR**: `GLB_LOADER` (drop shadow flags), `SIGNED_URL_HOOK`, `MeshViewer.tsx:50-67` Canvas setup but lightened.
- **IMPORTS**: see snippet.
- **GOTCHA**: Do NOT set `shadows` on the `<Canvas>` (no shadow map). Do NOT set `enableRotate` on OrbitControls — interaction belongs to the parent `<Link>`. `OrbitControls.makeDefault` ensures autoRotate ticks. Use `powerPreference: "low-power"` so multi-Canvas pages don't kick the discrete GPU on Macs.
- **VALIDATE**: Mount inside a `<div style={{ aspectRatio: '16/9', width: 360 }}>`; scene rotates; no console errors; clicking the area must navigate via parent `<Link>` (see Task 2 GOTCHA if click is swallowed).

### Task 2: Update `ProjectCard` to use `Mini3DPreview`
- **ACTION**: Replace the SVG thumb artwork with the 3D preview.
- **IMPLEMENT**: In `frontend/src/components/data/ProjectCard.tsx`:
  1. Add import: `import Mini3DPreview from "./Mini3DPreview";`
  2. Inside the thumbnail block (lines 31-45 today), replace the line `<ThumbArtwork hue={project.thumbnailHue} />` with:
     ```tsx
     <div className="absolute inset-0 pointer-events-none">
       <Mini3DPreview project={project} />
     </div>
     ```
     The `pointer-events-none` wrapper guarantees parent `<Link>` receives clicks even if OrbitControls attaches a listener.
  3. Delete the `ThumbArtwork` function (lines 117-161) — it is no longer referenced.
  4. Keep StatusPill (top-right) and intake-mode caption (bottom-left); they overlay the Canvas. Add `pointer-events-none` to those overlay divs too.
- **MIRROR**: `THUMB_BLOCK` (preserve shape, only swap inner artwork).
- **IMPORTS**: `Mini3DPreview` from `./Mini3DPreview`. Remove unused `ThumbArtwork` (no import needed; it was local).
- **GOTCHA**: Canvas does not natively respect `pointer-events: none` on itself, but the wrapper `<div>` does — the Canvas inherits and click pass-through works. If autoRotate stops because OrbitControls thinks the pointer left the canvas, that's actually fine; autoRotate continues regardless of hover state.
- **VALIDATE**: `npm run lint` clean; visually card shows rotating model; status pill visible top-right; intake caption visible bottom-left; clicking card navigates to `/app/projects/:id/analysis`.

### Task 3: Convert `Clients.tsx` to card grid
- **ACTION**: Drop the table, render `<ProjectCard />` in 3-col grid.
- **IMPLEMENT**: In `frontend/src/pages/Clients.tsx`:
  1. Remove imports no longer used: `StatusPill`, `ArrowUpRight`, `fmtKWh`, `fmtKWp`, `fmtRM`, `fmtYears` (these moved to ProjectCard, which already imports them).
  2. Add import: `import ProjectCard from "@/components/data/ProjectCard";`
  3. Update the page caption text to match the new affordance: replace `"One row per client project. Click a row to open the monitoring view."` with `"Each card opens the site's analysis view."`
  4. Replace the entire table block (`<div className="bg-surface rounded-2xl overflow-hidden" ... </div>` containing `<table>`) with:
     ```tsx
     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
       {projects.map((p, i) => (
         <ProjectCard key={p.id} project={p} index={i} />
       ))}
     </div>
     ```
  5. Empty state: if `projects.length === 0`, skip the grid. `useProjects` falls back to MOCK_PROJECTS so this is rare; no special UI needed.
- **MIRROR**: Grid pattern from `Monitoring.tsx:107` (`grid grid-cols-1 xl:grid-cols-3 gap-5`); `HairlineRule` divider stays.
- **IMPORTS**: see step 2.
- **GOTCHA**: At xl breakpoint with 3 cards/row and aspect-16/9 thumbs + ~200px body, each card is ~360x420px. On 1280px viewport the grid fits comfortably; below xl (1280) it drops to 2-col which is the right behavior.
- **VALIDATE**: `npm run lint` clean; visually `/app/clients` shows 3-up grid; each card rotates; SummaryCells row above unchanged; HairlineRule "Clients" label above grid.

---

## Testing Strategy

### Unit Tests
No test runner in project (`lint` script is `tsc --noEmit`). Skip — manual visual QA only.

### Edge Cases Checklist
- [ ] All mock projects have `modelGlbPath: null` -> every card shows procedural `RoofScene` fallback
- [ ] If a project has `modelGlbPath` set -> signed URL is fetched and GLB renders
- [ ] Loading state (between query start and signed URL resolved) -> fallback scene renders, then swaps when URL arrives (`Suspense` boundary catches GLB load)
- [ ] Project list empty -> grid is empty; no crash
- [ ] `processing`/`failed` status -> StatusPill shows; pending caption still appears in card body (existing ProjectCard logic at lines 67-81)
- [ ] Narrow viewport (<768px) -> grid collapses to single column

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
EXPECT: Vite build success. Bundle size warning is pre-existing.

### Dev server (visual verification)
```bash
cd /Users/limjiale/Rexcharge-frontend/frontend && npm run dev
```
Then open `http://localhost:5173/app/clients`.

### Manual Validation
- [ ] Cards arrange 3-per-row at desktop (xl+)
- [ ] 2-per-row at md, 1-per-row at sm
- [ ] Each card's top half shows rotating 3D scene
- [ ] Project details (name, address, kWp/kWh/savings, sparkline) visible below
- [ ] Click on card navigates to `/app/projects/:id/analysis`
- [ ] StatusPill and intake-mode caption visible over the 3D scene
- [ ] No WebGL "too many contexts" warning in console
- [ ] FPS stays interactive (multiple Canvases at once)
- [ ] No regression on `/app` (Monitoring) — same `useProjects` data

---

## Acceptance Criteria
- [ ] All 3 tasks completed
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Manual visual QA checklist complete
- [ ] No regression on Monitoring or ProjectDetail pages

## Completion Checklist
- [ ] `Mini3DPreview` is a single file, default export, named-imports only
- [ ] Card click navigates correctly (link receives pointer events)
- [ ] Procedural fallback (`RoofScene`) renders when `modelGlbPath` is null
- [ ] Signed URL hook used exactly like `ProjectDetail.tsx:32`
- [ ] No hardcoded GLB paths
- [ ] `ThumbArtwork` helper deleted from `ProjectCard.tsx` (was only caller — see ProjectCard.tsx:117-161)
- [ ] No console warnings about multiple WebGL contexts in dev

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| WebGL context limit hit if portfolio grows past ~12 visible cards | Low (current) / Medium (future) | Card thumbs go black silently after limit | Document in Notes; future work = lazy-mount on intersect |
| OrbitControls swallows clicks on Canvas -> link not navigable | Medium | Cards become un-clickable | Wrap Canvas in `pointer-events-none` div (Task 2 step 2) — proven pattern |
| GPU memory spike with many cards | Medium | Frame drops | `dpr={[1, 1.5]}`, `powerPreference: 'low-power'`, no shadows, single directional light |
| GLB asset load fails | Low | Card shows fallback (acceptable) | Suspense boundary catches; no special handling needed |

## Notes
- All mock projects ship with `modelGlbPath: null` (see `mock-projects.ts:54, 78, ...`), so until real uploads happen the cards will show `RoofScene` only. That's still a strong visual upgrade over the table.
- Future enhancement: replace `OrbitControls autoRotate` with a manual `useFrame` rotation on a wrapper `<group>` and lazy-mount via `IntersectionObserver`. Out of scope here.
- ProjectCard already has the "pending" branch (lines 67-81) — processing/failed/draft projects show a caption instead of stats. That stays as-is and is a nice visual hint on the new grid too.
