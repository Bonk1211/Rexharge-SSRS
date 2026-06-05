# Plan: Drone Mode — YouTube Video as Conversion Reference

## Summary
The 3D converter has three mode tabs — Photos, Drone, Mesh — but the `mode` state is set yet **never read**, so all three render the identical photo-upload UI. This plan wires `mode` so that **Photos** keeps its current photo→3D flow untouched, and **Drone** swaps the photo dropzone for an embedded YouTube video that stands in as the "uploaded drone video" reference for conversion. The Generate → processing → textured-GLB result flow is reused as-is.

## User Story
As a Rexharge operator demoing the 3D converter,
I want the Drone tab to show a YouTube video as the "uploaded" drone footage instead of a photo dropzone,
So that I can demonstrate the drone-video→3D path without uploading real footage.

## Problem → Solution
**Current:** `mode` (`"photos" | "drone" | "mesh"`) is stored in state and toggled by the three `ModeTab` buttons, but no JSX branches on it. Clicking **Drone** visually does nothing — the left rail always shows the "Rooftop photos" dropzone and the canvas always shows the photo flow.
**Desired:** Selecting **Drone** replaces the photo dropzone with a YouTube embed (the "uploaded video" reference) and adapts the canvas/right-rail copy. **Photos** mode is byte-for-byte unchanged. Generate still drives the existing fake-processing timeline to the `MeshViewer` result.

## Metadata
- **Complexity**: Medium
- **Source PRD**: N/A (free-form request)
- **PRD Phase**: N/A
- **Estimated Files**: 1 changed (`Workspace3DConverter.tsx`), 0 new

---

## UX Design

### Before
```
┌──────────── Left rail ────────────┐
│ [Photos*] [Drone] [Mesh]          │   ← tabs set state but no effect
│ Rooftop photos        3–48 imgs   │
│ ┌───────────────────────────────┐ │
│ │  (photo dropzone art)         │ │   ← shown in ALL modes
│ │  Click, drag, or paste        │ │
│ │  PNG · JPG · DJI              │ │
│ └───────────────────────────────┘ │
│ Quality [Standard|Lightweight]    │
│ Format  [GLB|GLTF|OBJ]            │
│ Est ~2 min      [ Generate ]      │
└────────────────────────────────────┘
```

### After (Drone tab active)
```
┌──────────── Left rail ────────────┐
│ [Photos] [Drone*] [Mesh]          │
│ Drone video          1 clip       │
│ ┌───────────────────────────────┐ │
│ │ ▶  YouTube embed (16:9)       │ │   ← "uploaded video" reference
│ │    site-survey-flight.mp4     │ │
│ │    REF · YOUTUBE              │ │
│ └───────────────────────────────┘ │
│ Quality [Standard|Lightweight]    │
│ Format  [GLB|GLTF|OBJ]            │
│ Est ~2 min      [ Generate ]      │
└────────────────────────────────────┘
   (Photos tab → identical to "Before")
```

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| Drone tab click | Sets `mode`, no UI change | Left rail + canvas hero + history switch to video variant | Photos/Mesh untouched |
| Left rail input area | Photo dropzone (all modes) | Photo dropzone in Photos mode; YouTube embed card in Drone mode | Branch on `mode` |
| Generate (Drone) | Would call `loadSample()` (loads photos) because `photos.length === 0` | Runs the processing timeline directly — no photo load | Video is the input, not photos |
| Done-state caption | `Textured GLB · N photos` | `Textured GLB · from drone video` in Drone mode | Cosmetic |
| Right-rail history | Photo thumbnails | Single "uploaded video" entry in Drone mode | Cosmetic |
| Mesh tab | No change | No change (out of scope) | — |

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 (critical) | `frontend/src/pages/Workspace3DConverter.tsx` | 1-126 | All state, `mode`, `generate()`/`runTimers()`/`loadSample()`, history derivation — the only file changed |
| P0 (critical) | `frontend/src/pages/Workspace3DConverter.tsx` | 147-253 | Left rail: `ModeTab`s + photo dropzone block to branch |
| P0 (critical) | `frontend/src/pages/Workspace3DConverter.tsx` | 255-418 | Canvas: idle/processing/done branches whose copy adapts per mode |
| P1 (important) | `frontend/src/pages/Workspace3DConverter.tsx` | 420-496 | Right rail history list (cosmetic video entry) |
| P1 (important) | `frontend/src/pages/Workspace3DConverter.tsx` | 503-563 | `ModeTab` / `FieldLabel` subcomponent style conventions to mirror |
| P2 (reference) | `frontend/src/pages/Workspace3DConverter.tsx` | 931-1055 | `ProcessingScene` props — confirms empty `photoPreviewUrls` is safe (maps to nothing) |
| P2 (reference) | `frontend/src/components/viewer/MeshViewer.tsx` | 42 | `MeshViewer({ lat, lon, glbUrl })` signature — unchanged, reused in done state |

## External Documentation
| Topic | Source | Key Takeaway |
|---|---|---|
| YouTube IFrame embed URL | youtube.com/embed/&lt;id&gt; | Standard privacy-enhanced embed: `https://www.youtube-nocookie.com/embed/<VIDEO_ID>`. Accept `watch?v=`, `youtu.be/`, and `shorts/` URL shapes when parsing the id. No API key, no SDK needed — a plain `<iframe>` is enough. |

---

## Patterns to Mirror

Follow these exact conventions — new code must be indistinguishable from existing code in this file.

### MODULE_LEVEL_CONSTANT
// SOURCE: Workspace3DConverter.tsx:17
```ts
const MODEL_URL = "/models/econ_horizon_3D.glb";
```
→ Add the YouTube URL the same way: a single module-level `const` near the top so the user can fill it in one place.

### MODE_TYPE_AND_STATE
// SOURCE: Workspace3DConverter.tsx:12, 35
```ts
type Mode = "photos" | "drone" | "mesh";
const [mode, setMode] = useState<Mode>("photos");
```
→ `mode` already exists. Do not add new mode state — branch on the existing value. Add a derived `const isDrone = mode === "drone";` for readability.

### MODE_TAB_WIRING (already correct, do not change)
// SOURCE: Workspace3DConverter.tsx:153-161
```tsx
<ModeTab active={mode === "photos"} onClick={() => setMode("photos")} label="Photos"><PhotosIcon /></ModeTab>
<ModeTab active={mode === "drone"} onClick={() => setMode("drone")} label="Drone"><DroneIcon /></ModeTab>
<ModeTab active={mode === "mesh"} onClick={() => setMode("mesh")} label="Mesh"><MeshIcon /></ModeTab>
```

### FIELD_LABEL_BLOCK (mirror for the video card header)
// SOURCE: Workspace3DConverter.tsx:165-189
```tsx
<div>
  <FieldLabel right="3–48 imgs">Rooftop photos</FieldLabel>
  <button type="button" onClick={loadSample} ... >
    <DropzoneArt />
    <div className="mt-2 text-[13px] font-bold text-ink">…</div>
    <div className="mono text-[9.5px] uppercase tracking-[0.14em] text-mute mt-1">PNG · JPG · DJI</div>
  </button>
</div>
```
→ The Drone card mirrors this exact wrapper/label/mono-caption structure, swapping the button for the embed card.

### INLINE_STYLE_TOKENS
// SOURCE: Workspace3DConverter.tsx:172-175, 1003
```tsx
style={{ border: "1px dashed var(--rule)", background: "var(--surface)" }}
border: `1.5px solid var(--leaf-deep)`
```
→ Use the same CSS custom-property tokens (`--rule`, `--surface`, `--leaf-deep`, `--mute`, `--ink`) — never hardcoded hex in layout chrome.

### DERIVED_HISTORY
// SOURCE: Workspace3DConverter.tsx:116-125
```ts
const history: HistoryItem[] = photos.map((file, i) => ({
  id: `photo-${i}-${file.name}`, title: `Rooftop ${String(i + 1).padStart(2, "0")}`,
  status: "ready", meta: formatPhotoSize(file.size), group: "Today", imageUrl: photoPreviewUrls[i],
}));
```
→ Build the drone history the same shape (`HistoryItem[]`); branch on `isDrone` to produce a single video entry instead.

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `frontend/src/pages/Workspace3DConverter.tsx` | UPDATE | Wire `mode`; add YouTube constant + embed-url helper + `DroneVideoCard`; branch left rail, `generate()`, canvas copy, history |

## NOT Building
- No change to **Photos** mode behavior, layout, or copy — it must remain identical.
- No change to **Mesh** mode (still a no-op tab, same as today).
- No real video upload, file input, or backend call — the YouTube link is a static demo reference.
- No editable URL text field in the UI — the link is a code constant the user fills in (see Open Question / Task 1). Adding an input is out of scope.
- No change to `MeshViewer`, `NewProject.tsx`, `Workspace3DSection.tsx`, routing, or `projects-api`.
- No new npm dependency — a plain `<iframe>` covers the embed.

---

## Step-by-Step Tasks

### Task 1: Add YouTube constant + embed-url helper
- **ACTION**: Near the existing `MODEL_URL` constant (line 17), add the drone video URL constant and a small pure helper that converts any YouTube URL into an embed URL.
- **IMPLEMENT**:
  ```ts
  // TODO(user): paste the drone reference video link here.
  const DRONE_VIDEO_YOUTUBE_URL = "";          // e.g. "https://youtu.be/XXXXXXXXXXX"
  const DRONE_VIDEO_TITLE = "site-survey-flight.mp4";

  function toYouTubeEmbedUrl(url: string): string | null {
    if (!url) return null;
    const m = url.match(
      /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
    );
    return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : null;
  }
  ```
- **MIRROR**: `MODULE_LEVEL_CONSTANT` (line 17).
- **IMPORTS**: none new.
- **GOTCHA**: Keep `DRONE_VIDEO_YOUTUBE_URL` empty by default so the build is green before the user supplies the link; the UI must render a graceful "paste link" placeholder when `toYouTubeEmbedUrl` returns `null` (Task 3). The id capture group is exactly 11 chars — do not loosen it.
- **VALIDATE**: `npm run build` in `frontend/` compiles with the empty constant.

### Task 2: Derive `isDrone` and gate `generate()`
- **ACTION**: Add `const isDrone = mode === "drone";` alongside the other derived values (after line 55). Update `generate()` (lines 96-103) so Drone mode never calls `loadSample()`.
- **IMPLEMENT**:
  ```ts
  function generate() {
    if (stage === "processing") return;
    if (isDrone) { runTimers(); return; }           // video is the input — no photo load
    if (photos.length === 0) { void loadSample().then(() => runTimers()); return; }
    runTimers();
  }
  ```
- **MIRROR**: `MODE_TYPE_AND_STATE` (lines 12, 35).
- **IMPORTS**: none.
- **GOTCHA**: Without this gate, pressing Generate in Drone mode falls into the `photos.length === 0` branch and loads the photo sample — wrong input. `runTimers()` already exists; do not duplicate its timer logic.
- **VALIDATE**: In Drone mode, Generate goes straight to the processing scene; no photos appear.

### Task 3: Branch the left-rail input block (photo dropzone vs. drone video card)
- **ACTION**: In the left rail, wrap the existing "Rooftop photos" block (lines 165-189) so it renders only when `!isDrone`, and render a new `DroneVideoCard` when `isDrone`.
- **IMPLEMENT** (structure):
  ```tsx
  {isDrone ? (
    <div>
      <FieldLabel right="1 clip">Drone video</FieldLabel>
      <DroneVideoCard embedUrl={toYouTubeEmbedUrl(DRONE_VIDEO_YOUTUBE_URL)} title={DRONE_VIDEO_TITLE} />
    </div>
  ) : (
    /* existing Rooftop photos block, unchanged */
  )}
  ```
  Add the subcomponent near the other art/subcomponents:
  ```tsx
  function DroneVideoCard({ embedUrl, title }: { embedUrl: string | null; title: string }) {
    return (
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--rule)", background: "var(--surface)" }}>
        <div className="relative w-full" style={{ aspectRatio: "16 / 9", background: "var(--surface-2)" }}>
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title="Drone reference video"
              className="absolute inset-0 w-full h-full"
              style={{ border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-center px-3">
              <span className="mono text-[10px] uppercase tracking-[0.14em] text-mute">Paste drone video link in code</span>
            </div>
          )}
        </div>
        <div className="px-3 py-2">
          <div className="text-[13px] font-bold text-ink truncate">{title}</div>
          <div className="mono text-[9.5px] uppercase tracking-[0.14em] text-mute mt-1">REF · YOUTUBE</div>
        </div>
      </div>
    );
  }
  ```
- **MIRROR**: `FIELD_LABEL_BLOCK` (165-189), `INLINE_STYLE_TOKENS`, and `DroneIcon`/`PhCard` subcomponent placement/style.
- **IMPORTS**: none.
- **GOTCHA**: Keep the photo block JSX **verbatim** inside the `else` — do not refactor it (Photos mode must stay identical). Use `aspectRatio: "16 / 9"` so the iframe scales in the 280px rail. `--surface-2` is an existing token (used at line 635).
- **VALIDATE**: Toggle Photos↔Drone — photo dropzone vs. video card swap; Photos view pixel-identical to before.

### Task 4: Adapt canvas idle + done copy for Drone mode
- **ACTION**: Make the mode-dependent captions in the canvas reflect video input. Two spots: the idle-hero eyebrow/badge (around lines 322-339) and the done-state caption (line 283).
- **IMPLEMENT**:
  - Done caption (line 283) — replace the photo count text:
    ```tsx
    {isDrone ? "Textured GLB · from drone video" : `Textured GLB · ${photos.length} photo${photos.length === 1 ? "" : "s"}`}
    ```
  - Idle eyebrow (line 338) — `Photo set · textured GLB` → `{isDrone ? "Drone video · textured GLB" : "Photo set · textured GLB"}`.
  - (Optional, low priority) idle `<h1>` headline (lines 350-362): leave as-is to keep the diff small; copy is generic enough.
- **MIRROR**: existing ternary/`isDrone` style; keep all surrounding markup and tokens untouched.
- **IMPORTS**: none.
- **GOTCHA**: `ProcessingScene` receives `photoPreviewUrls={photoPreviewUrls}` (empty in Drone mode) — its filmstrip `.map` over an empty array renders nothing, which is acceptable; no guard needed (confirmed lines 991-1020). Do not pass video data into `ProcessingScene`.
- **VALIDATE**: Generate in Drone mode → processing → done; captions say "drone video", not "0 photos".

### Task 5: Branch the right-rail history for Drone mode
- **ACTION**: When `isDrone`, replace the photo-derived `history` with a single "uploaded video" entry so the right rail isn't empty/misleading.
- **IMPLEMENT**:
  ```ts
  const history: HistoryItem[] = isDrone
    ? [{ id: "drone-video", title: DRONE_VIDEO_TITLE, status: "ready", meta: "YouTube ref", group: "Today", imageUrl: null }]
    : photos.map((file, i) => ({ /* existing mapping, unchanged */ }));
  ```
- **MIRROR**: `DERIVED_HISTORY` (lines 116-125) — same `HistoryItem` shape; `HistoryCard` already falls back to `<HistoryThumb />` when `imageUrl` is null (lines 639-652), so no `HistoryCard` change is needed.
- **IMPORTS**: none.
- **GOTCHA**: Footer count text (`{history.length} uploads`, lines 491-493) updates automatically — leave it. Keep `imageUrl: null` so the existing thumb fallback renders.
- **VALIDATE**: In Drone mode the right rail shows one "site-survey-flight.mp4 · Ready · YouTube ref" card.

---

## Testing Strategy

### Manual / Component Tests
This is a UI-only React change in a repo with no existing test runner wired for pages (no `*.test.tsx` alongside pages). Validation is build + manual. If a test is desired later, a React Testing Library check would assert:

| Test | Input | Expected | Edge Case? |
|---|---|---|---|
| Drone tab swaps input | click Drone tab | photo dropzone gone, video card present | No |
| Photos unchanged | click Photos tab | "Rooftop photos" dropzone present | No |
| Empty URL placeholder | `DRONE_VIDEO_YOUTUBE_URL = ""` | card shows "Paste drone video link in code" | Yes |
| URL parsing | `youtu.be/abcdefghijk` | embed `youtube-nocookie.com/embed/abcdefghijk` | Yes |
| Generate in Drone | click Generate (Drone) | processing scene, no sample photos loaded | Yes |

### Edge Cases Checklist
- [ ] Empty `DRONE_VIDEO_YOUTUBE_URL` → graceful placeholder, build green
- [ ] `watch?v=`, `youtu.be/`, and `shorts/` URL shapes all parse
- [ ] Malformed / non-YouTube URL → `null` → placeholder (no broken iframe)
- [ ] Switch Drone→Photos after a Drone generate → photo flow intact
- [ ] Generate in Drone mode does not trigger `loadSample()`

---

## Validation Commands

### Static Analysis / Type Check + Build
```bash
cd frontend && npm run build
```
EXPECT: TypeScript compiles, Vite build succeeds, zero type errors.

### Lint (if configured)
```bash
cd frontend && npm run lint
```
EXPECT: No new lint errors in `Workspace3DConverter.tsx`. (Skip if no `lint` script exists.)

### Browser Validation
```bash
cd frontend && npm run dev
```
Then open `/app/workspace/3d-converter`:
- [ ] Photos tab — identical to current `main`.
- [ ] Drone tab — left rail shows the YouTube embed card (or placeholder if URL empty).
- [ ] Generate in Drone mode → processing → textured GLB done state, copy reads "drone video".
- [ ] Right rail shows the single video entry in Drone mode.
- [ ] Mesh tab unchanged.

### Manual Validation
- [ ] Paste the real link into `DRONE_VIDEO_YOUTUBE_URL`; the player loads and plays.

---

## Acceptance Criteria
- [ ] Clicking **Drone** replaces the photo dropzone with the YouTube video reference.
- [ ] **Photos** mode is unchanged (visual + behavioral parity with `main`).
- [ ] Generate works in Drone mode and reaches the existing done state without loading sample photos.
- [ ] `npm run build` passes with no type errors.
- [ ] Empty/placeholder URL is handled gracefully (no broken iframe, green build).

## Completion Checklist
- [ ] Branches on the **existing** `mode` state (no new mode state added)
- [ ] Uses existing CSS tokens (`--rule`, `--surface`, `--surface-2`, `--leaf-deep`, `--mute`, `--ink`)
- [ ] Photo block left verbatim in the `else` branch
- [ ] YouTube link isolated to one editable constant
- [ ] No new dependencies, no backend, no routing changes
- [ ] Subcomponents (`DroneVideoCard`) placed alongside existing subcomponents, same style

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| URL not provided at implement time | High (user said "later") | Low | Empty-constant placeholder keeps build green; user pastes link in one spot |
| Accidentally altering Photos mode while branching | Medium | High | Wrap, don't rewrite; keep photo JSX verbatim in `else`; diff-check Photos view |
| YouTube embed blocked by CSP/sandbox in some host | Low | Low | Demo-only; `youtube-nocookie.com` + standard `allow` attrs; placeholder fallback if blank |
| `ProcessingScene` empty filmstrip looks bare in Drone mode | Low | Low | Acceptable for demo; out of scope to populate with video frames |

## Notes / Open Question (default chosen, documented — not blocking)
The request says "loaded a YouTube link as the reference of the uploaded video." Three readings of *what the user sees*: (a) an **embedded player**, (b) a **thumbnail card**, (c) an **editable URL input**. This plan picks **(a) embedded player** as the default — it most directly matches "loaded ... the uploaded video," needs no backend, and reads as a real video reference in a demo. The link lives in the `DRONE_VIDEO_YOUTUBE_URL` constant (Task 1) for the user to fill in; switching to (b) or (c) later is a localized change to `DroneVideoCard` only.
