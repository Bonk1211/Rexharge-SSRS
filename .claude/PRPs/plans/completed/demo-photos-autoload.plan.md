# Plan: Demo Auto-load — Sample House 3 Photos

## Summary
On the "Upload" step of `New Project` with `intakeMode === "photos"`, replace the file-picker `<input type="file">` with a one-click "Load demo photos" button that auto-imports the 11 PNGs from `/Users/limjiale/Downloads/Dataset 2/Sample house 3`. Files are copied once into `frontend/public/demo-photos/sample-house-3/` so Vite serves them at runtime; at click time the page fetches each URL, converts the blob to a `File`, and feeds into the existing `handlePhotos` flow. Behaviour after auto-load (preview tiles, generate, onComplete) is unchanged.

## User Story
As a demo presenter, I want clicking "Import rooftop photos" to instantly populate the workspace with the canned Sample House 3 dataset so that the demo runs deterministically without me selecting files from disk.

## Problem -> Solution
Current: clicking the import area opens the OS file picker; the demo only works if the presenter selects the right photos every time. -> Desired: clicking the import area calls `loadDemoPhotos()` which fetches the canned set from `/demo-photos/sample-house-3/` and pipes the resulting `File[]` into the same code path as a manual upload.

## Metadata
- **Complexity**: Small
- **Source PRD**: N/A (free-form: "for this instead of let user upload self photos, for this demo, when user click upload photos, it straight away loaded with all the photos in /Users/limjiale/Downloads/Dataset 2/Sample house 3")
- **PRD Phase**: N/A
- **Estimated Files**: 3 changed + 11 binary assets copied (`Workspace3DSection.tsx`, new `demo-photos.ts` manifest, copy of 11 PNGs into `public/demo-photos/sample-house-3/`)

---

## UX Design

### Before
```
+------------------------------------------------------------+
| Workspace . 3D reconstruction                                |
| Photo set to textured model.                                 |
|                                                              |
| +-------- Import panel --------+ +-- Model viewer --+        |
| | [ImageSquare icon]            | | Awaiting photos |        |
| | Import rooftop photos         | |                 |        |
| | Select one or more images...  | |                 |        |
| |   (clicking opens OS picker)  | |                 |        |
| +-------------------------------+ +-----------------+        |
+------------------------------------------------------------+
```

### After
```
+------------------------------------------------------------+
| Workspace . 3D reconstruction                                |
| Photo set to textured model.                                 |
|                                                              |
| +-------- Import panel --------+ +-- Model viewer --+        |
| | [ImageSquare icon]            | | Awaiting photos |        |
| | Load demo photo set           | |                 |        |
| | 11 cached rooftop photos      | |                 |        |
| | (clicking auto-fetches them)  | |                 |        |
| +-------------------------------+ +-----------------+        |
|                                                              |
| (after click)                                                |
| +----+ +----+ +----+ +----+   <- thumbnail grid              |
| | P1 | | P2 | | P3 | | P4 |                                  |
| +----+ +----+ +----+ +----+                                  |
| ...                                                          |
+------------------------------------------------------------+
```

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| Import area | `<label>` wrapping hidden `<input type="file" multiple>` | `<button type="button">` with same visual styling | Removes the OS file dialog |
| Click handler | Browser opens picker -> user selects -> `onChange` fires | `loadDemoPhotos()` fetches each manifest URL and calls existing `applyPhotos` | Same downstream logic |
| Empty state copy | "Select one or more images to run the demo flow." | "Click to load the cached Sample House 3 set (11 photos)." | Make affordance obvious |
| Cap of 8 photos | `.slice(0, 8)` in `handlePhotos` | Unchanged | First 8 of 11 PNGs used; the rest ignored same as today's manual flow |
| File picker (manual upload) | Available | Removed | Demo flow only |

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `frontend/src/components/workspace3d/Workspace3DSection.tsx` | 81-96, 205-248 | Existing `handlePhotos(FileList \| null)` + the `<label>` import region to replace |
| P0 | `frontend/src/components/workspace3d/Workspace3DSection.tsx` | 46-54 | `createPhoto(File)` and `ImportedPhoto` shape — nothing to change, but confirm `File` input is sufficient |
| P0 | `frontend/src/pages/NewProject.tsx` | 363-386 | Step 2 (`photos` intake) wraps Workspace3DSection — no changes needed, but verify the `onComplete` callback still gets `File[]` |
| P1 | `frontend/vite.config.ts` | all | Confirms `public/` is the static root (default Vite behaviour, no `publicDir` override) |
| P1 | `frontend/public/models/` | listing | Existing pattern of demo assets served from public/ (e.g. `econ_horizon_3D.glb` used by Workspace3DSection.tsx:20) |
| P2 | dataset folder `/Users/limjiale/Downloads/Dataset 2/Sample house 3` | listing | 12 files: 11 PNGs (~20 MB total) + 1 HEIC (`IMG_2805.HEIC`). HEIC is skipped because Chrome/Firefox can't render it |

## External Documentation

| Topic | Source | Key Takeaway |
|---|---|---|
| Constructing File from fetch blob | MDN: `File` constructor, `Response.blob()` | `new File([blob], name, { type: blob.type })` — accepted everywhere a real File is |
| Vite static assets | vitejs.dev/guide/assets#the-public-directory | Anything under `public/` is served as-is from `/`. No import, no hashing |
| HEIC image support | caniuse.com/heif | Safari renders HEIC; Chrome/Firefox do not. Decision: skip the .HEIC file in the demo set |

KEY_INSIGHT: `URL.createObjectURL(blob)` works on blobs originating from `fetch()` exactly the same as on user-picked files. The downstream `<img src={photo.url}>` in `ImportPanel` (line 258) renders without changes.
APPLIES_TO: `loadDemoPhotos`.
GOTCHA: When the dev server runs, `public/demo-photos/...` is served by Vite's middleware. In production it's copied to `dist/demo-photos/`. Use **relative URLs from the site root** (`/demo-photos/sample-house-3/...`) — never absolute filesystem paths.

KEY_INSIGHT: `handlePhotos(FileList | null)` expects a `FileList`. There's no public `FileList` constructor, but the simpler route is to split the function: extract the body into `applyPhotos(files: File[])` and have both `loadDemoPhotos` and (if ever re-added) any picker callback call it.
APPLIES_TO: Task 3.
GOTCHA: Removing the old `<input>` means the only entry point is the demo loader. That's the desired demo behaviour.

---

## Patterns to Mirror

### NAMING_CONVENTION
```ts
// SOURCE: frontend/src/components/workspace3d/Workspace3DSection.tsx:20
const MODEL_URL = "/models/econ_horizon_3D.glb";
```
Module-level URL constants are SHOUTY_SNAKE_CASE strings pointing at root-relative paths.

### DEMO_ASSET_LOCATION
```
// SOURCE: frontend/public/models/econ_horizon_3D.glb (referenced by Workspace3DSection.tsx:20)
```
Demo assets live under `frontend/public/<kind>/`. Filenames are kept as-is; no hashing.

### FILE_INPUT_HANDLER
```tsx
// SOURCE: frontend/src/components/workspace3d/Workspace3DSection.tsx:81-96
function handlePhotos(files: FileList | null) {
  const nextPhotos = Array.from(files ?? [])
    .filter((file) => file.type.startsWith("image/"))
    .map(createPhoto)
    .slice(0, 8);

  if (nextPhotos.length === 0) return;

  clearTimers();
  photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.url));
  photosRef.current = nextPhotos;
  setPhotos(nextPhotos);
  setStage("idle");
  setProgress(0);
  setModelUrl("");
}
```
Extract everything below the `Array.from` line into `applyPhotos(files: File[])`. Pattern: bag of side-effects on refs + state setters, no error handling, returns nothing.

### IMPORT_BUTTON_STYLE
```tsx
// SOURCE: Workspace3DSection.tsx:225-248
<label className="group flex min-h-[128px] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed border-rule bg-paper px-4 py-4 text-center transition-colors hover:border-leaf hover:bg-leaf-tint/35">
  <span className="grid h-12 w-12 place-items-center rounded-xl bg-surface-2 text-leaf-deep">
    <ImageSquare weight="duotone" size={24} />
  </span>
  <span>
    <span className="block text-[13px] font-extrabold tracking-tight text-ink">
      Import rooftop photos
    </span>
    <span className="mt-1 block text-[12px] leading-5 text-mute">
      Select one or more images to run the demo flow.
    </span>
  </span>
  ...
</label>
```
KEEP the visual block exactly; only swap the wrapping element (`<label>` -> `<button>`), drop the `<input type="file">`, and adjust copy.

### STAGE_RESET_BEHAVIOUR
```tsx
// SOURCE: Workspace3DSection.tsx:89-95
clearTimers();
photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.url));
photosRef.current = nextPhotos;
setPhotos(nextPhotos);
setStage("idle");
setProgress(0);
setModelUrl("");
```
Each fresh batch clears timers and revokes prior object URLs. `loadDemoPhotos` reuses this via the extracted helper.

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `frontend/public/demo-photos/sample-house-3/*.PNG` | CREATE (copy) | Static asset bundle so the browser can `fetch()` the photos at runtime |
| `frontend/src/data/demo-photos.ts` | CREATE | Manifest: `DEMO_PHOTO_SET_SAMPLE_HOUSE_3` array of `{ name; url }` + `loadDemoPhotoFiles()` |
| `frontend/src/components/workspace3d/Workspace3DSection.tsx` | UPDATE | Replace `<label>+<input>` with `<button>` that triggers `loadDemoPhotos()`; extract `applyPhotos(File[])` helper |

## NOT Building
- Multiple demo sets / switcher UI (only Sample House 3 wired)
- Loading the HEIC file (skipped — browsers can't render it reliably)
- Drag-and-drop (was never present)
- Adding a "use real upload" toggle (demo flow only)
- Touching `NewProject.tsx` (the public surface `onComplete(files: File[], glbUrl)` is unchanged)
- Service worker / pre-caching for offline demo

---

## Step-by-Step Tasks

### Task 1: Copy demo photos into `public/`
- **ACTION**: Copy the 11 PNG files into the Vite static dir so they can be fetched at `/demo-photos/sample-house-3/<name>.PNG`.
- **IMPLEMENT**: Shell command:
  ```bash
  mkdir -p frontend/public/demo-photos/sample-house-3
  cp "/Users/limjiale/Downloads/Dataset 2/Sample house 3/"*.PNG frontend/public/demo-photos/sample-house-3/
  ```
  The HEIC file is intentionally excluded (browsers can't render).
- **MIRROR**: `DEMO_ASSET_LOCATION` (Workspace3DSection.tsx:20 references `/models/...` the same way).
- **IMPORTS**: N/A.
- **GOTCHA**: Filenames contain `-` and digits but NO spaces, so no URL-encoding needed. Preserve filename case (`.PNG` extension stays uppercase — fetch is case-sensitive on most static servers, though Vite's middleware is forgiving locally).
- **VALIDATE**: `ls frontend/public/demo-photos/sample-house-3/` lists 11 PNG files. `curl -I http://localhost:5174/demo-photos/sample-house-3/2569-04-06-13-44-24-837.PNG` returns `200 OK` once dev server is running.

### Task 2: Create demo-photos manifest
- **ACTION**: Single-source-of-truth list of filenames + a loader that returns `File[]`.
- **IMPLEMENT**: New file `frontend/src/data/demo-photos.ts`:
  ```ts
  export interface DemoPhotoRef {
    name: string;
    url: string;
  }

  const SAMPLE_HOUSE_3_FILES = [
    "2569-04-06-13-44-24-837.PNG",
    "2569-04-06-13-44-28-046.PNG",
    "2569-04-06-13-44-50-035.PNG",
    "2569-04-06-13-45-18-821.PNG",
    "2569-04-06-13-46-13-609.PNG",
    "2569-04-06-13-46-21-566.PNG",
    "2569-04-06-13-46-24-196.PNG",
    "2569-04-06-13-46-27-902.PNG",
    "2569-04-06-13-46-51-333.PNG",
    "2569-04-06-13-47-19-062.PNG",
    "2569-04-06-13-47-21-346.PNG",
  ] as const;

  export const DEMO_PHOTO_SET_SAMPLE_HOUSE_3: DemoPhotoRef[] = SAMPLE_HOUSE_3_FILES.map(
    (name) => ({
      name,
      url: `/demo-photos/sample-house-3/${name}`,
    }),
  );

  export async function loadDemoPhotoFiles(refs: DemoPhotoRef[]): Promise<File[]> {
    return Promise.all(
      refs.map(async (ref) => {
        const res = await fetch(ref.url);
        if (!res.ok) throw new Error(`Failed to fetch ${ref.name}: ${res.status}`);
        const blob = await res.blob();
        return new File([blob], ref.name, { type: blob.type || "image/png" });
      }),
    );
  }
  ```
- **MIRROR**: `NAMING_CONVENTION`; `Promise.all` pattern matches `NewProject.tsx:114`.
- **IMPORTS**: none.
- **GOTCHA**: `blob.type` may be empty on some browsers — fallback to `"image/png"`. Use `res.ok` to catch 404s; throw so the upstream caller's `try/catch` reports it.
- **VALIDATE**: `tsc --noEmit` clean; in browser console, `await loadDemoPhotoFiles(DEMO_PHOTO_SET_SAMPLE_HOUSE_3)` returns 11 `File` objects with `type === 'image/png'`.

### Task 3: Wire `Workspace3DSection` to auto-load
- **ACTION**: Swap the file-picker UI for a one-click button that calls the manifest loader.
- **IMPLEMENT**: In `frontend/src/components/workspace3d/Workspace3DSection.tsx`:
  1. Add manifest import beside other imports at the top:
     ```ts
     import { DEMO_PHOTO_SET_SAMPLE_HOUSE_3, loadDemoPhotoFiles } from "@/data/demo-photos";
     ```
  2. Replace `handlePhotos` (lines 81-96) with `applyPhotos(rawFiles: File[])`:
     ```ts
     function applyPhotos(rawFiles: File[]) {
       const nextPhotos = rawFiles
         .filter((file) => file.type.startsWith("image/"))
         .map(createPhoto)
         .slice(0, 8);

       if (nextPhotos.length === 0) return;

       clearTimers();
       photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.url));
       photosRef.current = nextPhotos;
       setPhotos(nextPhotos);
       setStage("idle");
       setProgress(0);
       setModelUrl("");
     }
     ```
  3. Add loader + state inside the component (next to other `useState` calls):
     ```ts
     const [loading, setLoading] = useState(false);

     async function loadDemoPhotos() {
       if (loading) return;
       setLoading(true);
       try {
         const files = await loadDemoPhotoFiles(DEMO_PHOTO_SET_SAMPLE_HOUSE_3);
         applyPhotos(files);
       } catch (err) {
         console.error("Failed to load demo photos:", err);
       } finally {
         setLoading(false);
       }
     }
     ```
  4. Update the `ImportPanel` call in `Workspace3DSection` body:
     ```tsx
     <ImportPanel
       photos={photos}
       stage={stage}
       progress={progress}
       onLoadDemo={loadDemoPhotos}
       loading={loading}
       onRemove={removePhoto}
       onGenerate={generateRender}
     />
     ```
  5. Change `ImportPanel` signature: drop `onPhotos`, add `onLoadDemo: () => void; loading: boolean`.
  6. Inside `ImportPanel`, replace the `<label>` + `<input>` block (lines 225-248) with:
     ```tsx
     <button
       type="button"
       onClick={onLoadDemo}
       disabled={isProcessing || loading}
       className="group flex min-h-[128px] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed border-rule bg-paper px-4 py-4 text-center transition-colors hover:border-leaf hover:bg-leaf-tint/35 disabled:cursor-not-allowed disabled:opacity-60"
     >
       <span className="grid h-12 w-12 place-items-center rounded-xl bg-surface-2 text-leaf-deep">
         {loading ? (
           <ArrowsClockwise className="animate-spin" weight="bold" size={22} />
         ) : (
           <ImageSquare weight="duotone" size={24} />
         )}
       </span>
       <span>
         <span className="block text-[13px] font-extrabold tracking-tight text-ink">
           {loading ? "Loading demo photos…" : "Load demo photo set"}
         </span>
         <span className="mt-1 block text-[12px] leading-5 text-mute">
           Click to load the cached Sample House 3 set (11 photos).
         </span>
       </span>
     </button>
     ```
     `ArrowsClockwise` is already imported (line 11).
- **MIRROR**: `IMPORT_BUTTON_STYLE` (same classes, only outer tag changes); `STAGE_RESET_BEHAVIOUR` (preserved inside `applyPhotos`).
- **IMPORTS**: add manifest import; no removals (other icons remain used).
- **GOTCHA**: After the swap the `<input type="file">` is gone — confirm no other code references it (search showed it lived only inside the `<label>`). Don't leave `cursor-pointer` active on a disabled button (the class list above includes `disabled:cursor-not-allowed`).
- **VALIDATE**: `npm run lint` clean. In dev: `/app/projects/new` -> name+lat+lon -> Photo set -> step 2 -> click import button -> grid populates within ~1 s -> Generate -> Continue -> Create works.

---

## Testing Strategy

### Unit Tests
No test runner in project — skip. Manual visual QA only.

### Edge Cases Checklist
- [ ] First click triggers loading state; button disabled during load
- [ ] If a fetch fails (404), error is logged to console and button returns to enabled state; no half-populated grid
- [ ] Existing photos are revoked + replaced if user clicks the button twice (handled by `applyPhotos`)
- [ ] Cap of 8 photos still applies (3 extra PNGs in the dataset are ignored — matches existing manual UI behaviour)
- [ ] The HEIC file is not referenced anywhere, so no rendering issue
- [ ] Browser back/forward between steps doesn't break (no global state introduced)

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
EXPECT: Vite build success; bundle warning pre-existing. `dist/demo-photos/sample-house-3/` is present in build output.

### Dev server (visual verification)
```bash
cd /Users/limjiale/Rexcharge-frontend/frontend && npm run dev
```
Then open `http://localhost:5174/app/projects/new`.

### Manual Validation
- [ ] Step 0: enter name `Sample house 3`, lat `3.0578`, lon `101.6612`
- [ ] Step 1: pick **Photo set**
- [ ] Step 2: click the import button -> within ~1 s grid shows 8 thumbnails
- [ ] Click **Generate 3D render** -> progress bar fills, model appears
- [ ] Click **Continue** -> Step 3 shows 9 files queued (1 GLB + 8 source photos)
- [ ] **Create project** completes without error
- [ ] No 404s in Network tab for `/demo-photos/sample-house-3/*.PNG`

---

## Acceptance Criteria
- [ ] All 3 tasks completed
- [ ] `npm run lint` passes
- [ ] `npm run build` passes and copies the photos into `dist/`
- [ ] Visual QA checklist all green
- [ ] No regression on demo / drone_video intake paths (they don't touch Workspace3DSection)

## Completion Checklist
- [ ] 11 PNGs present under `public/demo-photos/sample-house-3/`
- [ ] No HEIC file copied
- [ ] `demo-photos.ts` exports both the manifest and the loader
- [ ] `Workspace3DSection` no longer renders `<input type="file">`
- [ ] `handlePhotos` removed; `applyPhotos` is the only state-mutating helper for incoming files
- [ ] Loading state visible while fetches are in flight
- [ ] No absolute filesystem paths in shipped code

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| 20 MB of PNGs bloats the production bundle | Medium | Slower first deploy; otherwise fine (served lazily) | Acceptable for demo; flagged in Notes for future relocation if shipped to real users |
| Filename case mismatch (`.PNG` vs `.png`) on case-sensitive hosts | Low | 404 on production CDN | Manifest uses exact-as-copied filenames; copy command preserves case |
| User refreshes page mid-load -> partial state | Low | Visual flicker | Not blocking; load is fast (<1 s on localhost) |
| Removing the `<input>` breaks a feature elsewhere | Low | Build break | grep confirmed only this one `<input type="file">` in this component; downstream callers consume `File[]` not `FileList` |

## Notes
- The demo set has 11 photos but the upstream cap is 8 (`.slice(0, 8)`). Preserved — same UX as today.
- Photos live in `public/`, not under `src/`, so Vite doesn't tree-shake or hash them. If we ever need to gate them behind auth or rotate them, move to `src/assets/` and use `import.meta.glob`.
- HEIC file is omitted entirely. Most browsers (Chrome, Firefox) can't render `image/heic`.
- `onComplete(files: File[], glbUrl)` (the public surface consumed by `NewProject.tsx:369`) is unchanged. The downstream pipeline (uploadAsset -> updateProject -> logEvent in `NewProject.tsx:124`) doesn't care whether the files came from a picker or a fetch.
