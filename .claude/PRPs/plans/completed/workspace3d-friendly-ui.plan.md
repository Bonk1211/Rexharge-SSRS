# Plan: Workspace3DSection — Market-Aligned Friendly UI

## Summary
Apply the five "table stakes" UX patterns shared by Meshy, Tripo3D, and Hunyuan3D to `Workspace3DSection`: drop research-tone copy, lead with a sample-driven input card, keep the model viewer persistent and in-place, surface a Download CTA as the terminal action, and move technical labels behind plainer alternatives. Single-file change focused on `frontend/src/components/workspace3d/Workspace3DSection.tsx`.

## User Story
As a first-time visitor to the demo, I want the 3D converter to look like the consumer tools I already know (Meshy / Tripo) so that I can trust the result without reading any docs.

## Problem -> Solution
Current: A "Workspace . 3D reconstruction" / "Photo set to textured model" frame with a generic "Load demo photo set" rectangle and stage labels (Import / Process / Render). Reads as an internal engineering tool. -> Desired: a consumer-grade card that says "Use sample dataset (Sample House 3, 11 photos)" with a thumbnail peek, an in-place 3D viewer that swaps from empty -> processing -> result, a clear "Generating 42%" state, and a "Download .glb" terminal CTA.

## Metadata
- **Complexity**: Small/Medium
- **Source PRD**: N/A (free-form: "learn ui placement from current online market 3d converter, how do i design to make it looks easy to use")
- **PRD Phase**: N/A
- **Estimated Files**: 1 changed (`Workspace3DSection.tsx`)

---

## Market Research Summary

Five "table stakes" patterns observed across Meshy, Tripo3D, and Hunyuan3D (CSM.ai unreachable, Luma Genie retired):

1. **Single multi-modal input block fronts everything** — never split paths.
2. **Drag-drop + paste + click on one rectangle** — triple affordance, format/size hint inline.
3. **Sample galleries double as input AND aspiration** — kills cold-start.
4. **Consumer surfaces strip jargon** ("generate", "create", "3D model" — never "mesh", "topology", "photogrammetry"). Researcher surfaces (Hunyuan) flaunt it. Pick a side.
5. **Output is a persistent in-place viewer with download as the terminal action** — viewer replaces the upload area; download lives next to it.

Gaps: no public live-progress UX observable (gated behind sign-in on Meshy/Tripo). Local stage bar already covers that — keep but plainer.

This plan picks the **consumer side**. The Workspace3DSection is shown to demo prospects, not ML researchers.

---

## UX Design

### Before
```
+------------------------------------------------------------------+
| WORKSPACE . 3D RECONSTRUCTION                  [photos] [progress]|
| Photo set to textured model.                   [model: Pending]   |
|                                                                   |
| +-------------------------------+ +------------------------+      |
| |                               | | [icon] Load demo set   |      |
| |     Awaiting photos           | | Click to load cached.. |      |
| |     [Cube]                    | +------------------------+      |
| |     Import rooftop photos     | | [4 dashed slots]       |      |
| |     to begin the demo flow.   | +------------------------+      |
| |                               | | Generation . DEMO MODE |      |
| |                               | | o Import . Photos rcvd |      |
| |                               | | o Process . Recon roof |      |
| |                               | | o Render  . Textured.. |      |
| |                               | | [progress bar]         |      |
| |                               | | [Generate 3D render]   |      |
| +-------------------------------+ +------------------------+      |
+------------------------------------------------------------------+
```

### After
```
+------------------------------------------------------------------+
| Create 3D from photos.                          [Sample House 3]  |
| Built from 11 rooftop photos in ~4 s.                             |
|                                                                   |
| +-------------------------------+ +------------------------+      |
| |                               | | USE SAMPLE DATASET     |      |
| |    Your model will appear     | | Sample House 3 . 11 ph |      |
| |    here.                      | | [thumb][thumb][thumb]  |      |
| |    [cube icon]                | | [    Load photos    ]  |      |
| |    Load the sample dataset    | +------------------------+      |
| |    on the right to start.     | | 1 Add  o 2 Build  3 Done|     |
| |                               | | [============   ] 42%  |      |
| |                               | | [  Generating . 3s   ] |      |
| +-------------------------------+ +------------------------+      |
| [Download .glb]  [Regenerate]                                     |
+------------------------------------------------------------------+
```

### Interaction Changes
| Touchpoint | Before | After | Why (market pattern) |
|---|---|---|---|
| Section heading | "Workspace . 3D reconstruction" / "Photo set to textured model." | "Create 3D from photos." | Pattern 4 — consumer copy |
| Input card title | "Load demo photo set" | "Use sample dataset" + "Sample House 3 . 11 photos" | Pattern 3 — sample doubles as input |
| Input card preview | None | 3-thumbnail peek strip inside the card | Pattern 3 — make sample tangible |
| Input CTA | Whole card is the button | Tight "Load photos" button under the peek | Pattern 2 — explicit primary action |
| Stage labels | "Import / Process / Render" with subtitles | "1 Add . 2 Build . 3 Done" — numbered + plain | Pattern 4 — strip jargon |
| Progress copy | "Processing photos" / "Building 3D render" | "Generating . 42%" inline | Address progress-UX gap |
| Generate button | "Generate 3D render" | "Generate 3D model" | Pattern 4 — replace "render" |
| Empty viewer copy | "Awaiting photos" / "Import rooftop photos to begin the demo flow." | "Your model will appear here." / "Load the sample dataset on the right to start." | Pattern 4 + Pattern 5 — promises in-place result |
| Terminal action | None | "Download .glb" below the viewer when `stage === "done"` | Pattern 5 — download is terminal |
| Secondary action | "Render again" inside Generation card | "Regenerate" next to Download | Pattern 5 — terminal actions grouped |
| HeaderStats | Photos / Progress / Model triplet | Single "Sample House 3" pill | De-noise; progress lives in the card |

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `frontend/src/components/workspace3d/Workspace3DSection.tsx` | all | Only file changed |
| P0 | `frontend/src/data/demo-photos.ts` | all | Manifest for the peek thumbs |
| P1 | `frontend/public/demo-photos/sample-house-3/` | listing | Confirms peek-strip URLs |
| P1 | `frontend/src/pages/NewProject.tsx` | 369-385 | Caller — `onComplete(files, glbUrl)` contract is unchanged |
| P2 | `frontend/src/components/data/PowerCurveCard.tsx` | 36-77 | CARD_HEADER aesthetic to mirror |

## External Documentation

| Topic | Source | Key Takeaway |
|---|---|---|
| Meshy generate panel | meshy.ai/discover | Single multi-modal input + "Try images" thumb row + one primary CTA |
| Tripo3D upload | tripo3d.ai | "Drag, Upload or Paste Image" copy; format hint inline; gallery-as-aspiration |
| Hunyuan3D layout | huggingface.co/spaces/tencent/Hunyuan3D-2 | Persistent in-place viewer; Export tab with download as terminal action |

KEY_INSIGHT: Sample galleries are not optional — every consumer image-to-3D tool surfaces examples as one-click starters.
APPLIES_TO: The "Use sample dataset" card.
GOTCHA: Don't add a real "Try other samples" switcher yet — only one set exists. Show three sample thumbnails as a visual peek of *this* set.

KEY_INSIGHT: Download is the terminal action; once a model is ready, it's the next thing users want.
APPLIES_TO: New `<a href={MODEL_URL} download>` below the viewer (only when `stage === "done"`).
GOTCHA: Browsers respect `download` only on same-origin URLs. `MODEL_URL` is `/models/econ_horizon_3D.glb` — same origin, works.

KEY_INSIGHT: Plain copy raises trust for non-experts; technical copy raises it for engineers. Mixing both reads as "internal tool".
APPLIES_TO: Section header, stage labels, CTA text.
GOTCHA: Keep `console.error` strings and `aria-label`s technical; only customer-facing copy gets simplified.

---

## Patterns to Mirror

### CARD_HEADER
```tsx
// SOURCE: PowerCurveCard.tsx:36-58
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
</div>
```
Title + monospaced subcaption + right-aligned numeral. New "Use sample dataset" card uses the same shape — title `Use sample dataset`, subcaption `Sample House 3`, right numeral `11`, right unit `photos`.

### SAMPLE_PEEK_THUMB
```tsx
const peekThumbs = DEMO_PHOTO_SET_SAMPLE_HOUSE_3.slice(0, 3);
{peekThumbs.map((ref) => (
  <img key={ref.name} src={ref.url} alt=""
    className="aspect-[4/3] w-full rounded-md object-cover"
    style={{ border: "1px solid var(--rule)" }} />
))}
```
Just `<img>` tags — no new deps. PNGs already served from `public/`.

### PRIMARY_CTA
```tsx
// Current Workspace3DSection generate button
<button className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 text-[12px] font-extrabold tracking-tight text-paper transition-colors hover:bg-ink-2 disabled:cursor-not-allowed disabled:bg-dim">
```
Keep this class set for any new primary buttons (Load photos, Download .glb, Regenerate).

### NUMBERED_STEP_CHIP
```tsx
<li className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5"
    style={{ background: active || complete ? "var(--leaf-tint)" : "var(--surface)", border: "1px solid var(--rule)" }}>
  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface-2 text-leaf-deep mono text-[11px] font-bold">
    {index + 1}
  </span>
  <span className="text-[12px] font-bold text-ink">{label}</span>
</li>
```
Drop long descriptions. Stages collapse to "1 Add / 2 Build / 3 Done". One number, one word.

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `frontend/src/components/workspace3d/Workspace3DSection.tsx` | UPDATE | All copy + minor JSX restructure |

## NOT Building
- A real second sample dataset / switcher (only Sample House 3 exists)
- Drag-and-drop for user-supplied photos (file `<input>` removed by prior plan)
- Live ETA derived from actual processing — show synthetic countdown only
- Pasting from clipboard
- "Recent renders" carousel
- Modal-based viewer (in-place pattern already correct)
- Renaming `Workspace3DSection` or its props — `onComplete(files, glbUrl)` stays
- Touching `Mini3DPreview.tsx` or `MeshViewer.tsx`
- Replacing the stage-progress mock timers in `generateRender` — keep the timing, only retitle steps
- Adding analytics / telemetry events

---

## Step-by-Step Tasks

### Task 1: Soften the section header
- **ACTION**: Replace "Workspace . 3D reconstruction" / "Photo set to textured model." with new copy and a single pill instead of HeaderStats.
- **IMPLEMENT**:
  ```tsx
  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
    <div>
      <h2 className="numeral text-[22px] leading-[1.05] text-ink" style={{ fontWeight: 600 }}>
        Create 3D from photos.
      </h2>
      <p className="mt-1 text-[12px] text-mute">
        Built from {DEMO_PHOTO_SET_SAMPLE_HOUSE_3.length} rooftop photos in ~4 s.
      </p>
    </div>
    <span
      className="mono text-[10px] uppercase tracking-[0.18em] text-leaf-deep px-2.5 py-1 rounded-full"
      style={{ background: "var(--leaf-tint)" }}
    >
      Sample House 3
    </span>
  </div>
  ```
  Remove the `<HeaderStats … />` call. `HeaderStats` + `StatPill` are local-only — delete them too.
- **MIRROR**: CARD_HEADER.
- **IMPORTS**: `DEMO_PHOTO_SET_SAMPLE_HOUSE_3` already imported.
- **GOTCHA**: Before deleting `HeaderStats`/`StatPill`, grep within the file to confirm no other references. They're local — safe.
- **VALIDATE**: `npm run lint` clean. Header reads one short line + one mute subline + leaf-tint pill.

### Task 2: Rebuild the input as a "Use sample dataset" card
- **ACTION**: Replace the current `<button h-[88px]>` with a richer card showing 3-thumbnail peek + tight CTA.
- **IMPLEMENT**: Inside `ImportPanel`, replace the existing import button with:
  ```tsx
  <div className="rounded-xl bg-paper p-3 flex flex-col gap-2.5"
       style={{ border: "1px solid var(--rule)" }}>
    <div className="flex items-baseline justify-between">
      <div>
        <h3 className="text-[12.5px] font-extrabold tracking-tight text-ink">Use sample dataset</h3>
        <p className="mono text-[9.5px] uppercase tracking-[0.16em] text-mute mt-0.5">Sample House 3</p>
      </div>
      <div className="text-right">
        <p className="numeral text-[16px] tab-num leading-none" style={{ fontWeight: 600 }}>
          {DEMO_PHOTO_SET_SAMPLE_HOUSE_3.length}
        </p>
        <p className="mono text-[9px] uppercase tracking-[0.14em] text-mute">photos</p>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-1.5">
      {DEMO_PHOTO_SET_SAMPLE_HOUSE_3.slice(0, 3).map((ref) => (
        <img key={ref.name} src={ref.url} alt=""
          className="aspect-[4/3] w-full rounded-md object-cover"
          style={{ border: "1px solid var(--rule)" }} />
      ))}
    </div>

    <button
      type="button"
      onClick={onLoadDemo}
      disabled={isProcessing || loading}
      className="flex h-8 w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 text-[11.5px] font-extrabold tracking-tight text-paper transition-colors hover:bg-ink-2 disabled:cursor-not-allowed disabled:bg-dim"
    >
      {loading
        ? <ArrowsClockwise className="animate-spin" weight="bold" size={12} />
        : <ImageSquare weight="duotone" size={13} />}
      {loading ? "Loading…" : photos.length > 0 ? "Reload photos" : "Load photos"}
    </button>
  </div>
  ```
- **MIRROR**: CARD_HEADER, SAMPLE_PEEK_THUMB, PRIMARY_CTA (height `h-8`).
- **IMPORTS**: `ImageSquare`, `ArrowsClockwise`, `DEMO_PHOTO_SET_SAMPLE_HOUSE_3` already imported.
- **GOTCHA**: Peek `<img>` tags fetch ~1.5 MB each (3 of them). Acceptable. `loading="lazy"` already default in Chrome/Safari.
- **VALIDATE**: `npm run lint` clean. Card shows title + count + 3 thumbs + Load button. Clicking still triggers `loadDemoPhotos()`. Button label flips to "Reload photos" after first load.

### Task 3: Simplify stages to numbered chips
- **ACTION**: Collapse stage labels to "1 Add / 2 Build / 3 Done".
- **IMPLEMENT**: Replace the `stages` const near the top:
  ```ts
  const stages = [
    ["Add", "Photos imported"],
    ["Build", "Reconstructing"],
    ["Done", "Model ready"],
  ] as const;
  ```
  Replace the inner content of each stage `<li>` so the chip shows a numeral when neither active nor complete:
  ```tsx
  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface-2 text-leaf-deep mono text-[10px] font-bold">
    {complete || (stage === "done" && index === 2) ? (
      <CheckCircle weight="fill" size={13} />
    ) : active && isProcessing ? (
      <ArrowsClockwise className="animate-spin" weight="bold" size={12} />
    ) : (
      <span>{index + 1}</span>
    )}
  </span>
  <span>
    <span className="block text-[11.5px] font-bold text-ink">{label}</span>
    <span className="block text-[10px] text-mute">{description}</span>
  </span>
  ```
- **MIRROR**: NUMBERED_STEP_CHIP.
- **IMPORTS**: `Sparkle` becomes unused — remove from the Phosphor import line.
- **GOTCHA**: Run `grep -n Sparkle` in the file before deleting to be safe.
- **VALIDATE**: `npm run lint` clean. Idle chip shows numeral; active shows spinner; complete shows check.

### Task 4: Cleaner Generation card + primary button
- **ACTION**: Drop the "Demo mode" pill (redundant with the header pill); make the Generate button show live percentage.
- **IMPLEMENT**: Inside `ImportPanel`'s Generation card:
  1. Remove the "Demo mode" `<span>`.
  2. Replace the title row with:
     ```tsx
     <div className="mb-2.5 flex items-center justify-between">
       <span className="text-[12.5px] font-extrabold tracking-tight text-ink">
         {isProcessing ? "Generating…" : stage === "done" ? "Ready" : "Ready to generate"}
       </span>
       <span className="mono text-[10px] uppercase tracking-[0.14em] text-mute tab-num">
         {progress}%
       </span>
     </div>
     ```
  3. Replace the button label:
     ```tsx
     {isProcessing
       ? `Generating · ${progress}%`
       : stage === "done"
       ? "Regenerate"
       : "Generate 3D model"}
     ```
- **MIRROR**: PRIMARY_CTA.
- **IMPORTS**: none.
- **GOTCHA**: Leave the `Cube` icon on the button.
- **VALIDATE**: Idle -> "Generate 3D model". During -> "Generating . 42%". Done -> "Regenerate".

### Task 5: Plainer empty-state copy
- **ACTION**: Restring `EmptyState` branches to plainer copy.
- **IMPLEMENT**:
  ```tsx
  <h3 className="text-[14px] font-extrabold text-ink">
    {isProcessing
      ? "Building your 3D model…"
      : hasPhotos
      ? "Ready to generate"
      : "Your model will appear here"}
  </h3>
  ...
  <p className="mt-1.5 max-w-md text-[11.5px] leading-5 text-mute">
    {isProcessing
      ? "Reconstructing roof geometry…"
      : hasPhotos
      ? "Click Generate 3D model to see the result."
      : "Load the sample dataset on the right to start."}
  </p>
  ```
- **MIRROR**: copy_tone.
- **IMPORTS**: none.
- **GOTCHA**: Don't add new conditionals — only re-string existing branches.
- **VALIDATE**: Each branch shows the new copy.

### Task 6: Terminal actions below the viewer (Download + Regenerate)
- **ACTION**: When `stage === "done"`, surface Download + Regenerate buttons below the grid.
- **IMPLEMENT**: At the bottom of the Workspace3DSection main `<section>` (after the grid), add:
  ```tsx
  {stage === "done" && (
    <div className="mt-3 flex items-center justify-end gap-2">
      <a
        href={MODEL_URL}
        download="reconstructed_model.glb"
        className="inline-flex h-9 items-center gap-2 rounded-lg bg-leaf-deep px-4 text-[12px] font-extrabold tracking-tight text-paper transition-colors hover:bg-leaf"
      >
        <Cube weight="duotone" size={14} />
        Download .glb
      </a>
      <button
        type="button"
        onClick={generateRender}
        className="inline-flex h-9 items-center gap-2 rounded-lg bg-surface px-4 text-[12px] font-extrabold tracking-tight text-ink transition-colors hover:bg-surface-2"
        style={{ border: "1px solid var(--rule)" }}
      >
        <ArrowsClockwise weight="bold" size={13} />
        Regenerate
      </button>
    </div>
  )}
  ```
  `generateRender` is already in the parent scope. The in-card "Regenerate" branch (added in Task 4) is fine as the user discovers either; OR drop the in-card branch and keep only the bottom Regenerate to avoid duplication — recommended.
- **MIRROR**: PRIMARY_CTA (leaf-deep variant for download; outlined for secondary).
- **IMPORTS**: `Cube`, `ArrowsClockwise` already imported.
- **GOTCHA**: Don't accidentally remove `Cube` while cleaning Sparkle in Task 3.
- **VALIDATE**: After Generate completes, two buttons appear below the viewer. Download saves a `.glb`. Regenerate restarts the timer.

### Task 7 (optional): drop "Render" from customer copy
- **ACTION**: Replace remaining `Render` / `render` strings with `Model` / `3D model` in user-visible text only.
- **IMPLEMENT**: `grep -n "[Rr]ender" frontend/src/components/workspace3d/Workspace3DSection.tsx` and update only customer strings. Keep variable names (`modelUrl`, `setModelUrl`).
- **MIRROR**: copy_tone.
- **IMPORTS**: none.
- **GOTCHA**: Don't touch `console.error` / `aria-label`s.
- **VALIDATE**: Final grep shows no user-string mentions of "render".

---

## Testing Strategy

### Unit Tests
No test runner — manual visual QA only.

### Edge Cases Checklist
- [ ] First mount: viewer shows "Your model will appear here"; right column shows sample card + 4 dashed slots + idle Generation card
- [ ] After clicking "Load photos": peek thumbs unchanged; main 2-col grid shows 8 loaded thumbs; Generation card shows "Ready to generate"
- [ ] During processing: button reads "Generating . 42%"; chips animate 1 -> 2 -> 3
- [ ] Done: Download + Regenerate appear below the viewer; viewer shows the model
- [ ] Regenerate restarts the timer; button label flips to "Generating…"
- [ ] Narrow viewport (<lg): 60/40 grid collapses to stacked

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
EXPECT: Success.

### Dev server
```bash
cd /Users/limjiale/Rexcharge-frontend/frontend && npm run dev
```
Open `http://localhost:5174/app/projects/new`, walk through Photo set intake.

### Manual Validation
- [ ] Reads as a consumer tool (no "photogrammetry", "render" in customer copy)
- [ ] Sample card peeks 3 thumbnails
- [ ] Empty viewer copy directs to the right column
- [ ] Generate button shows live percentage
- [ ] Download + Regenerate visible when done
- [ ] No console errors / unused-import warnings

---

## Acceptance Criteria
- [ ] All 7 tasks completed (Task 7 may fold into earlier)
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Visual QA checklist green
- [ ] Header reads "Create 3D from photos."
- [ ] Sample card shows 3 thumbnails + count + Load button
- [ ] Stage chips read "1 Add / 2 Build / 3 Done"
- [ ] Download .glb button appears when `stage === "done"`
- [ ] No regression on parent NewProject wizard (`onComplete` still fires)

## Completion Checklist
- [ ] Customer copy contains no "photogrammetry" / "render" / "topology" / "mesh" / "textured GLB"
- [ ] `HeaderStats` and `StatPill` removed
- [ ] `Sparkle` icon removed from imports
- [ ] No new dependencies
- [ ] No new files
- [ ] Existing demo timer untouched

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Removing `HeaderStats` breaks an import elsewhere | Very Low | Build break | Local-only — grep before delete |
| Peek `<img>` tags pull 4.5 MB before user clicks | Low | First-load latency | Acceptable for demo; future: ship low-res WebP thumbs |
| User confused by two "Regenerate" buttons | Low | Tiny | Keep only the bottom one |
| Tone change feels marketing-y | Low | Judgment call | Palette unchanged; only copy + chip styling shifts |

## Notes
- Market signal: consumer image-to-3D tools choose plain, benefit-led copy and lead with samples. This demo is shown to prospects — go consumer.
- CSM.ai and Luma Genie were unreachable during research. Conclusions rest on Meshy, Tripo, Hunyuan; the agreed table-stakes patterns are still strong.
- Terminal Download links to the cached demo GLB (`/models/econ_horizon_3D.glb`). When real reconstruction wires up, swap the `href` for the generated blob URL.
- No new icons; Phosphor `Cube`, `ImageSquare`, `ArrowsClockwise`, `CheckCircle`, `Trash` cover everything.
