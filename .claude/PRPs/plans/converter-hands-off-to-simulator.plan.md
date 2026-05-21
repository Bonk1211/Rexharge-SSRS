# Plan: Hand Off Rendered GLB Directly to External Simulator

## Summary
After the 3D converter finishes rendering a GLB, drop the existing **"Save as new project →"** bottom-right button. Replace it with an **"Open in simulator ↗"** flow that (1) uploads the freshly rendered GLB to Supabase Storage under a scratch path, (2) generates a signed URL, (3) collects minimum metadata from the user (latitude, longitude, monthly kWh usage, tariff type), and (4) redirects the browser to the external simulator at `https://solar.limziyang.ml/simulator` with all required query parameters. The wizard path is dropped from this surface — `NewProject` flow stays reachable from `/app/projects/new` only.

## User Story
As an operator who just rendered a rooftop GLB,
I want one click to open the same model inside the simulator at `https://solar.limziyang.ml/simulator`, pre-populated with the model URL and my site context,
So that I can run yield/financial analysis without re-uploading the GLB or re-typing site details.

## Problem → Solution
**Current state:** `Workspace3DConverter.tsx` shows a `Save as new project →` button after the GLB renders. The button packages the local blob-URL GLB + source photos into `location.state.prefilledFiles` and navigates to `/app/projects/new`. The GLB never lands in Supabase at this step — it lives only as an in-memory blob URL referencing the static `/models/econ_horizon_3D.glb`. The simulator is unreachable from this surface.

**Desired state:** The bottom-right button reads `Open in simulator ↗`. Behind it, a small inline form (lat/lng/usage/tariff) becomes visible when `result !== null`. Submitting the form uploads the GLB to Supabase Storage (`project-models` bucket, scratch path), signs a long-lived URL, builds `${__SIMULATOR_URL__}/simulator?model=…&lat=…&lng=…&usage=…&tariff=…`, and `window.open()`s it in a new tab.

## Metadata
- **Complexity**: Medium
- **Source PRD**: N/A — free-form request
- **PRD Phase**: N/A
- **Estimated Files**: 3 (1 page edit, 1 lib helper added, 1 small form component added)

---

## UX Design

### Before
```
┌──────────────────────────────────────────────────────────────────┐
│ Workspace · 3D converter                                         │
│                                                                  │
│ Convert photos into a textured GLB.                              │
│                                                                  │
│ [ Import panel | ModelViewer (renders GLB) | StatusStack ]       │
│                                                                  │
│                              ┌──────────────────────────────┐    │
│                              │   Save as new project →      │    │ ← drop
│                              └──────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
                       ↓ click
                  navigate("/app/projects/new", { state: {...} })
```

### After
```
┌──────────────────────────────────────────────────────────────────┐
│ Workspace · 3D converter                                         │
│                                                                  │
│ Convert photos into a textured GLB.                              │
│                                                                  │
│ [ Import panel | ModelViewer (renders GLB) | StatusStack ]       │
│                                                                  │
│ ─── Site context (4 small inputs in one row) ────────────────    │
│  Lat: [3.0578]   Lng: [101.6612]   Usage: [700] kWh / mo         │
│  Tariff: [▾ Domestic]                                            │
│                                                                  │
│                              ┌──────────────────────────────┐    │
│                              │   Open in simulator ↗        │    │ ← new
│                              └──────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
                       ↓ click
   1. upload GLB → supabase storage (project-models / scratch/<ts>_<uuid>.glb)
   2. const signed = await getSignedUrl("project-models", path, 86400)
   3. const url = `${__SIMULATOR_URL__}/simulator?model=${enc(signed)}` +
                   `&lat=${lat}&lng=${lng}&usage=${usage}&tariff=${tariff}`
   4. window.open(url, "_blank", "noopener")
```

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| Bottom-right button label | `Save as new project →` | `Open in simulator ↗` | one CTA only |
| Click behavior | navigate to `/app/projects/new` | upload GLB to Supabase, build URL, open new tab | external hand-off |
| Inputs visible after render | none | lat, lng, usage, tariff | required before redirect |
| Disabled state | `saving` boolean | `uploading || !formValid` | guard against partial submits |
| Loading copy | `Packaging files...` | `Uploading…` → `Opening simulator…` | two-phase feedback |
| Failure path | `console.error(err); setSaving(false)` | `toast.error(msg); setUploading(false)` | match `NewProject.tsx` pattern |
| Wizard reachability | from this surface + `/app/projects/new` | from `/app/projects/new` only | demo dialog still gates wizard |

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 (critical) | `frontend/src/pages/Workspace3DConverter.tsx` | 1-62 | The file being rewritten end-to-end |
| P0 (critical) | `frontend/src/lib/projects-api.ts` | 26-34, 143-170 | `bucketFor("glb")` returns `project-models`; `uploadAsset` writes `${DEV_OWNER_ID}/${projectId}/...`; `getSignedUrl(bucket, path, expiresIn)` pattern |
| P0 (critical) | `frontend/src/components/workspace3d/Workspace3DSection.tsx` | 21, 60-140 | `MODEL_URL = "/models/econ_horizon_3D.glb"`; `onComplete(files, glbUrl)` passes the static URL — we still need to `fetch(glbUrl)` to get a Blob |
| P0 (critical) | `frontend/src/vite-env.d.ts` | 1-3 | `__SIMULATOR_URL__` is the base domain `https://solar.limziyang.ml` (no `/simulator` path) — concatenate `${__SIMULATOR_URL__}/simulator?…` |
| P0 (critical) | `frontend/vite.config.ts` | 8-21 | Confirms simulator base URL is `https://solar.limziyang.ml` for all envs |
| P1 (important) | `frontend/src/pages/NewProject.tsx` | 142-153 | Toast pattern (`toast.success` / `toast.error`) and error-message extraction shape to mirror |
| P1 (important) | `frontend/src/pages/ProjectDetail.tsx` | 85-100 | Existing "Open in simulator" link uses `__SIMULATOR_URL__` directly — our new flow follows the same external-link convention but adds params + upload |
| P2 (reference) | `frontend/src/lib/supabase.ts` | all | `supabase` client used by `projects-api.ts`; same client services scratch upload |

## External Documentation

| Topic | Source | Key Takeaway |
|---|---|---|
| Simulator URL contract | User-provided example | `https://solar.limziyang.ml/simulator?model=<GLB_URL>&lat=<n>&lng=<n>&usage=<n>&tariff=<str>&gmap=<IMG_URL>` — note `lng` not `lon`; `gmap` is optional and not collected in this plan |
| Supabase Storage signed URL | https://supabase.com/docs/reference/javascript/storage-from-createsignedurl | `createSignedUrl(path, expiresIn)` — returns `{ data: { signedUrl } }`; matches existing `getSignedUrl` helper |

```
KEY_INSIGHT: __SIMULATOR_URL__ is the base domain only ("https://solar.limziyang.ml"); the simulator route lives at /simulator on that host.
APPLIES_TO: URL construction in Workspace3DConverter handleOpenSimulator
GOTCHA: The existing ProjectDetail link uses __SIMULATOR_URL__ as-is (root). Verify that landing on root still works, OR update ProjectDetail to append /simulator in a follow-up. Do NOT touch ProjectDetail in this plan.

KEY_INSIGHT: The simulator example URL uses `lng` (not `lon`). All internal code uses `lon` (matches Project type). The query-string mapping must translate: lon -> lng.
APPLIES_TO: query string builder
GOTCHA: Double-check param name during manual verification by inspecting the redirected URL.

KEY_INSIGHT: The existing GLB returned by Workspace3DSection.tsx is `/models/econ_horizon_3D.glb` — a static asset served by Vite. fetch() on this works because it's same-origin. The Blob produced has type `model/gltf-binary` only if we set it explicitly; current handleSave does so.
APPLIES_TO: upload step
GOTCHA: Use `new File([blob], "reconstructed_model.glb", { type: "model/gltf-binary" })` before passing to Supabase Storage so the stored object reports the correct MIME.

KEY_INSIGHT: getSignedUrl(bucket, path, expiresIn) already exists in projects-api.ts with default 3600s. Simulator session may need longer (user inspects model, leaves tab open).
APPLIES_TO: signed URL expiry
GOTCHA: Pass `expiresIn: 86400` (24h) explicitly.
```

---

## Patterns to Mirror

### NAMING_CONVENTION — camelCase handlers, PascalCase components, kebab paths
```ts
// SOURCE: frontend/src/pages/Workspace3DConverter.tsx:5, 10
export default function Workspace3DConverter() { … }
const handleSave = async () => { … }
```

### EXTERNAL_LINK — direct use of `__SIMULATOR_URL__`, new tab, `rel="noreferrer"`
```tsx
// SOURCE: frontend/src/pages/ProjectDetail.tsx:90-100
<a
  href={__SIMULATOR_URL__}
  target="_blank"
  rel="noreferrer"
  className="px-3.5 h-10 inline-flex items-center gap-2 rounded-full text-[12px] font-bold text-ink-2"
  style={{ background: "var(--surface-2)" }}
>
  <ArrowUpRight weight="duotone" size={14} />
  Open in simulator
</a>
```
**Adaptation for this plan:** the new CTA is a `<button>` (not `<a>`) because click triggers async upload before the navigation. After upload completes, use `window.open(url, "_blank", "noopener,noreferrer")`.

### SUPABASE_UPLOAD — bucket + path + upsert; mirrors `uploadAsset`
```ts
// SOURCE: frontend/src/lib/projects-api.ts:143-164
export async function uploadAsset(projectId, file, kind): Promise<{ path; bucket }> {
  const bucket = bucketFor(kind)
  const safeName = file.name.replace(/[^A-Za-z0-9._-]+/g, '_')
  const path = `${DEV_OWNER_ID}/${projectId}/${Date.now()}_${safeName}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
  if (error) throw error
  // … then insert into project_assets row
  return { path, bucket }
}
```
**Adaptation:** scratch uploads have no `projectId` and skip the `project_assets` row insert. Path becomes `${DEV_OWNER_ID}/scratch/${Date.now()}_${safeName}`. Add a new helper `uploadScratchGlb(file)` next to `uploadAsset` in `projects-api.ts`.

### SIGNED_URL — `createSignedUrl(path, expiresIn)`; default 3600
```ts
// SOURCE: frontend/src/lib/projects-api.ts:166-170
export async function getSignedUrl(bucket: string, path: string, expiresIn = 3600): Promise<string> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)
  if (error) throw error
  return data.signedUrl
}
```
**Reuse as-is** with `expiresIn: 86400`.

### TOAST_ERROR — extract message, log, toast
```ts
// SOURCE: frontend/src/pages/NewProject.tsx:145-153
} catch (err) {
  const msg =
    err instanceof Error ? err.message
    : typeof err === "object" && err && "message" in err ? String((err as { message: unknown }).message)
    : JSON.stringify(err);
  console.error("[NewProject] submit failed:", err);
  toast.error(msg || "Something went wrong");
  setSubmitting(false);
}
```

### CTA_BUTTON_INK — pill, ink bg, paper text, hover opacity
```tsx
// SOURCE: frontend/src/pages/Workspace3DConverter.tsx:49-56 (current implementation)
<button
  onClick={handleSave}
  disabled={saving}
  className="px-6 h-11 inline-flex items-center gap-2 rounded-full text-[14px] font-bold tracking-tight text-paper transition-opacity disabled:opacity-50 hover:opacity-90"
  style={{ background: "var(--ink)" }}
>
  {saving ? "Packaging files..." : "Save as new project →"}
</button>
```
**Adaptation:** label changes; `disabled` predicate becomes `uploading || !formValid`.

### NUMERIC_INPUT_FIELD — small text input with mono label
```tsx
// SOURCE: frontend/src/pages/NewProject.tsx:275-298 (Latitude/Longitude row)
<Field label="Latitude *">
  <input
    type="number"
    step="any"
    value={form.lat}
    onChange={(e) => set("lat", e.target.value)}
    placeholder="3.0578"
    className="w-full h-11 px-4 rounded-xl text-[14px] text-ink bg-surface outline-none focus:ring-2 focus:ring-leaf"
    style={{ border: "1px solid var(--rule)" }}
  />
</Field>
```
**Reuse:** the same `<Field>` + input shape, plus a `<select>` for tariff.

### CSS_VARS — colors via `var(--…)`, no hex literals
- `--ink`, `--paper`, `--leaf`, `--leaf-deep`, `--leaf-tint`, `--rule`, `--surface`, `--surface-2`, `--mute`, `--dim`

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `frontend/src/pages/Workspace3DConverter.tsx` | UPDATE | Replace `handleSave` with `handleOpenSimulator`; add `<SiteContextForm>` inline; swap button label + disabled predicate |
| `frontend/src/lib/projects-api.ts` | UPDATE | Add `uploadScratchGlb(file: File): Promise<{ path: string; bucket: string }>` next to `uploadAsset`; reuse existing `supabase` import and `DEV_OWNER_ID` constant |
| `frontend/src/components/workspace3d/SiteContextForm.tsx` | CREATE | Tiny presentational component (controlled inputs for lat / lng / usage / tariff); lives next to `Workspace3DSection.tsx` for co-location |

## NOT Building

- The `gmap` (measurement image) parameter — converter has no measurement image yet; leave it off the URL until the source is decided.
- Any persistence of the user's lat/lng/usage/tariff entries — they live in component state only and are gone on reload.
- Updating `ProjectDetail.tsx`'s existing "Open in simulator" button to also append params — out of scope. That button still links to bare `__SIMULATOR_URL__`. A follow-up plan can extend it.
- Backend/Supabase schema changes; no new tables, no new buckets, no RLS policy edits.
- A cleanup job for scratch GLBs — they accumulate. Accept this as demo cost; revisit if storage usage grows.
- Validation that the simulator URL actually loads the model — we trust the contract the user provided. Manual QA will exercise it.
- Wiring NewProject's photos-mode `Workspace3DSection` to the same flow — the wizard has its own create + simulator path already.

---

## Step-by-Step Tasks

### Task 1: Add `uploadScratchGlb` helper to `projects-api.ts`
- **ACTION**: Append a new exported async function next to `uploadAsset`.
- **IMPLEMENT**:
  ```ts
  export async function uploadScratchGlb(file: File): Promise<{ path: string; bucket: string }> {
    const bucket = 'project-models'
    const safeName = file.name.replace(/[^A-Za-z0-9._-]+/g, '_')
    const path = `${DEV_OWNER_ID}/scratch/${Date.now()}_${safeName}`
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (error) throw error
    return { path, bucket }
  }
  ```
- **MIRROR**: `SUPABASE_UPLOAD`.
- **IMPORTS**: none new — `supabase`, `DEV_OWNER_ID` already imported at top of file.
- **GOTCHA**: Skip the `project_assets` row insert that `uploadAsset` does — scratch GLBs are not owned by any project. Confirm `project-models` bucket exists (it does — `bucketFor("glb")` returns it).
- **VALIDATE**: `npx tsc --noEmit` clean. Unit-trace by reading: the function should only call `storage.upload`, not `from('project_assets').insert`.

### Task 2: Create `SiteContextForm` component
- **ACTION**: Create `frontend/src/components/workspace3d/SiteContextForm.tsx`.
- **IMPLEMENT**:
  ```tsx
  export type Tariff = "domestic" | "commercial" | "industrial";

  export interface SiteContext {
    lat: string;
    lng: string;
    usage: string;
    tariff: Tariff;
  }

  interface Props {
    value: SiteContext;
    onChange: (next: SiteContext) => void;
  }

  export default function SiteContextForm({ value, onChange }: Props) {
    const set = <K extends keyof SiteContext>(key: K, v: SiteContext[K]) =>
      onChange({ ...value, [key]: v });

    const inputClass =
      "w-full h-11 px-4 rounded-xl text-[14px] text-ink bg-surface outline-none focus:ring-2 focus:ring-leaf";
    const inputStyle = { border: "1px solid var(--rule)" };

    return (
      <div className="mt-8 rounded-2xl bg-surface p-5" style={{ border: "1px solid var(--rule)" }}>
        <div className="mono text-[10.5px] uppercase tracking-[0.22em] text-leaf-deep mb-3">
          Site context
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Field label="Latitude">
            <input type="number" step="any" value={value.lat} onChange={(e) => set("lat", e.target.value)}
              placeholder="3.0578" className={inputClass} style={inputStyle} />
          </Field>
          <Field label="Longitude">
            <input type="number" step="any" value={value.lng} onChange={(e) => set("lng", e.target.value)}
              placeholder="101.6612" className={inputClass} style={inputStyle} />
          </Field>
          <Field label="Usage (kWh / mo)">
            <input type="number" step="1" min="0" value={value.usage} onChange={(e) => set("usage", e.target.value)}
              placeholder="700" className={inputClass} style={inputStyle} />
          </Field>
          <Field label="Tariff">
            <select value={value.tariff} onChange={(e) => set("tariff", e.target.value as Tariff)} className={inputClass} style={inputStyle}>
              <option value="domestic">Domestic</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option>
            </select>
          </Field>
        </div>
      </div>
    );
  }

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex flex-col gap-1.5">
      <label className="mono text-[10.5px] uppercase tracking-[0.18em] text-mute">{label}</label>
      {children}
    </div>
  );
  ```
- **MIRROR**: `NUMERIC_INPUT_FIELD`, `CSS_VARS`.
- **IMPORTS**: none new — pure React + Tailwind.
- **GOTCHA**: `import React from "react"` is not needed in this project (vite + new JSX transform). Don't add it.
- **VALIDATE**: `npx tsc --noEmit` clean. Render the component locally; confirm 4 inputs lay out in a single row on `sm:` breakpoint and stack on mobile.

### Task 3: Rewrite `Workspace3DConverter.tsx` to use the new flow
- **ACTION**: Replace the file end-to-end (small file — full rewrite is cleaner than editing).
- **IMPLEMENT**:
  ```tsx
  import { useState } from "react";
  import { toast } from "sonner";
  import { ArrowUpRight } from "@/icons";
  import Workspace3DSection from "@/components/workspace3d/Workspace3DSection";
  import SiteContextForm, { type SiteContext } from "@/components/workspace3d/SiteContextForm";
  import { uploadScratchGlb, getSignedUrl } from "@/lib/projects-api";

  const DEFAULT_CONTEXT: SiteContext = {
    lat: "",
    lng: "",
    usage: "",
    tariff: "domestic",
  };

  export default function Workspace3DConverter() {
    const [result, setResult] = useState<{ files: File[]; glbUrl: string } | null>(null);
    const [context, setContext] = useState<SiteContext>(DEFAULT_CONTEXT);
    const [uploading, setUploading] = useState(false);

    const formValid =
      context.lat.trim() !== "" &&
      context.lng.trim() !== "" &&
      context.usage.trim() !== "" &&
      !!context.tariff;

    const handleOpenSimulator = async () => {
      if (!result) return;
      setUploading(true);
      try {
        // 1. Fetch the rendered GLB and wrap as a File
        const res = await fetch(result.glbUrl);
        const blob = await res.blob();
        const glbFile = new File([blob], "reconstructed_model.glb", { type: "model/gltf-binary" });

        // 2. Upload to Supabase scratch path
        const { bucket, path } = await uploadScratchGlb(glbFile);

        // 3. Sign a 24h URL
        const signed = await getSignedUrl(bucket, path, 86400);

        // 4. Build simulator URL and open new tab
        const params = new URLSearchParams({
          model: signed,
          lat: context.lat.trim(),
          lng: context.lng.trim(),
          usage: context.usage.trim(),
          tariff: context.tariff,
        });
        const url = `${__SIMULATOR_URL__}/simulator?${params.toString()}`;
        window.open(url, "_blank", "noopener,noreferrer");
      } catch (err) {
        const msg =
          err instanceof Error ? err.message
          : typeof err === "object" && err && "message" in err ? String((err as { message: unknown }).message)
          : JSON.stringify(err);
        console.error("[Workspace3DConverter] open simulator failed:", err);
        toast.error(msg || "Could not open simulator");
      } finally {
        setUploading(false);
      }
    };

    return (
      <main className="flex-1 min-w-0 w-full px-8 lg:px-12 pt-10 pb-12">
        <div className="mb-8">
          <div className="mono text-[10.5px] uppercase tracking-[0.24em] text-leaf-deep mb-2">
            Workspace · 3D converter
          </div>
          <h1 className="numeral text-[32px] tracking-[-0.02em] text-ink" style={{ fontWeight: 600 }}>
            Convert photos into a textured GLB.
          </h1>
          <p className="mt-3 text-[14px] text-mute max-w-[56ch]">
            Import, process, and render. Pass the model straight to the simulator with site context.
          </p>
        </div>

        <Workspace3DSection onComplete={(files, glbUrl) => setResult({ files, glbUrl })} />

        {result && (
          <>
            <SiteContextForm value={context} onChange={setContext} />
            <div className="mt-6 flex justify-end animate-riseIn">
              <button
                onClick={handleOpenSimulator}
                disabled={uploading || !formValid}
                className="px-6 h-11 inline-flex items-center gap-2 rounded-full text-[14px] font-bold tracking-tight text-paper transition-opacity disabled:opacity-50 hover:opacity-90"
                style={{ background: "var(--ink)" }}
              >
                {uploading ? "Uploading…" : "Open in simulator"}
                {!uploading && <ArrowUpRight weight="bold" size={14} />}
              </button>
            </div>
          </>
        )}
      </main>
    );
  }
  ```
- **MIRROR**: `EXTERNAL_LINK` (but as `<button>` triggering `window.open`), `TOAST_ERROR`, `CTA_BUTTON_INK`, `SUPABASE_UPLOAD`, `SIGNED_URL`.
- **IMPORTS**: see code block.
- **GOTCHA**:
  1. `__SIMULATOR_URL__` is a Vite `define` global — use directly (no `import.meta.env`). Already declared in `vite-env.d.ts`.
  2. Popup blockers fire when `window.open` happens outside the synchronous click handler. The `await` chain pushes the open *after* user interaction — browsers usually allow it because the click started the chain, but if a blocker bites, fall back to setting `window.location.href` (single tab, no `noopener`).
  3. Drop the now-unused `useNavigate` import.
  4. `URLSearchParams` automatically URL-encodes values — no manual `encodeURIComponent`.
- **VALIDATE**: `npx tsc --noEmit` clean. Manual: render a GLB, fill the 4 inputs, click button. Network tab shows one PUT to `…/storage/v1/object/project-models/<owner>/scratch/<ts>_reconstructed_model.glb`, one POST to `…/storage/v1/object/sign/project-models/…`. Browser opens a new tab whose URL matches the expected template.

### Task 4: Smoke-validate by build + tsc + grep sweep
- **ACTION**: Run all of: `npx tsc --noEmit`, `npm run build`, plus a `grep -rn "Save as new project\|prefilledFiles" src/` to confirm nothing else references the old strings.
- **IMPLEMENT**: bash commands.
- **MIRROR**: N/A.
- **IMPORTS**: N/A.
- **GOTCHA**: `prefilledFiles` is also referenced inside `NewProject.tsx` (`location.state?.prefilledFiles`). That's fine — leave it. The hand-off from `Workspace3DConverter` is what gets dropped; the wizard's safety net for incoming state can stay.
- **VALIDATE**: `tsc` exit 0, `vite build` exit 0, grep returns only `NewProject.tsx` for `prefilledFiles`.

---

## Testing Strategy

### Unit Tests
No Vitest/Jest suite in the repo. Validation by tsc + manual smoke test, consistent with prior plans.

| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| `tsc --noEmit` | repo state | exit 0 | no |
| Render + open simulator | photos uploaded → render finishes → fill lat=3.05/lng=101.66/usage=700/tariff=domestic | new tab opens to `${__SIMULATOR_URL__}/simulator?model=…&lat=3.05&lng=101.66&usage=700&tariff=domestic` | no |
| Render + missing lat | render finishes → leave lat empty | button stays disabled | yes |
| Render + invalid lat | render finishes → lat="abc" | number input rejects non-numeric; button disabled (empty trim) | yes |
| Network failure on upload | Supabase storage offline | `toast.error` with Supabase error message; button re-enables | yes |
| Popup blocker | browser blocks `window.open` | (acceptable) no new tab; user can re-click. No corruption. Document as known limitation. | yes |

### Edge Cases Checklist
- [ ] User changes lat/lng/usage after a failed upload, retries — second attempt uses new values; previous upload's path is orphaned in storage (acceptable).
- [ ] User clicks button twice rapidly — `disabled={uploading}` blocks the second click during upload.
- [ ] GLB blob has zero bytes (race) — Supabase upload accepts empty bytes; signed URL still works; simulator likely fails. Out of scope; would need GLB integrity check.
- [ ] User navigates away mid-upload — fetch + upload promise resolves to nothing; React may warn in dev about state updates after unmount. Acceptable for demo.
- [ ] Tariff `<select>` defaults to `domestic` — never empty, never blocks `formValid`.

---

## Validation Commands

### Static Analysis
```bash
cd frontend && npx tsc --noEmit
```
EXPECT: Zero type errors.

### Build
```bash
cd frontend && npm run build
```
EXPECT: Vite build succeeds; bundle includes the simulator-URL builder.

### Dead-Reference Sweep
```bash
grep -rn "Save as new project\|handleSave\|Packaging files" frontend/src/
```
EXPECT: zero hits.

```bash
grep -rn "prefilledFiles" frontend/src/
```
EXPECT: one hit only — `frontend/src/pages/NewProject.tsx` (the wizard's incoming-state safety net).

### Manual Validation
- [ ] Visit `/app/workspace/3d-converter`. Upload photos. Click Generate. Wait for the model to render in the viewer.
- [ ] Site-context form appears below the model. Fill: `lat=3.0578`, `lng=101.6612`, `usage=700`, `tariff=Domestic`.
- [ ] Click **Open in simulator**. Button label changes to `Uploading…`.
- [ ] Network tab shows a PUT to `/storage/v1/object/project-models/<owner>/scratch/…_reconstructed_model.glb`.
- [ ] Network tab shows a POST to `/storage/v1/object/sign/project-models/…` with body `{"expiresIn": 86400}`.
- [ ] A new tab opens to `https://solar.limziyang.ml/simulator?model=https%3A%2F%2F…&lat=3.0578&lng=101.6612&usage=700&tariff=domestic`.
- [ ] Decode the `model` param — it must be a signed Supabase URL (`?token=…`).
- [ ] Force a failure by disabling network mid-click: toast shows the Supabase error, button re-enables.
- [ ] Confirm there is no longer a "Save as new project" path from this page — only "Open in simulator".

---

## Acceptance Criteria
- [ ] Bottom-right button reads **Open in simulator** with an `ArrowUpRight` icon.
- [ ] Clicking it uploads the rendered GLB to `project-models/<owner>/scratch/<ts>_reconstructed_model.glb`.
- [ ] Clicking it generates a signed URL with `expiresIn: 86400` and includes that URL as the `model` query parameter.
- [ ] Clicking it opens `${__SIMULATOR_URL__}/simulator?…` in a new tab with `model`, `lat`, `lng`, `usage`, `tariff` populated from form state.
- [ ] Button is disabled until lat, lng, usage are non-empty (tariff defaults to `domestic`).
- [ ] Errors are surfaced via `toast.error` and `console.error("[Workspace3DConverter] open simulator failed:", err)`.
- [ ] `tsc --noEmit` and `npm run build` both pass.
- [ ] No reference to "Save as new project" or `prefilledFiles` originates from this page anymore.

## Completion Checklist
- [ ] Code follows discovered patterns (toast shape, CSS vars, CTA pill).
- [ ] No hardcoded URLs — `__SIMULATOR_URL__` for base, `/simulator` literal suffix only.
- [ ] No leftover imports (`useNavigate` removed from `Workspace3DConverter.tsx`).
- [ ] `uploadScratchGlb` is the only new exported function in `projects-api.ts` (and reuses `supabase` + `DEV_OWNER_ID`).
- [ ] Self-contained — no questions needed during implementation.

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Simulator expects a different param schema in production | Low (user provided concrete example) | High (silent breakage) | Manual QA against the live simulator before merging. Easy fix: adjust `URLSearchParams` keys. |
| `lng` vs `lon` confusion mid-implementation | Medium | Medium | Code/comments explicitly use `lng` in the form + URL builder. Form field stores as `lng`. Plan calls this out twice. |
| `project-models` bucket is not public AND the signed URL fails CORS from `solar.limziyang.ml` | Low | High | Signed URLs return a temporary direct object URL with proper Storage CORS (Supabase default allows `*`). If it fails, switch to `getPublicUrl` and ensure the bucket has public read enabled. Verify in manual QA. |
| Popup blocker prevents `window.open` after `await` | Medium | Medium | Fallback to `window.location.href = url` (same tab). For now, accept demo cost; document. |
| Scratch GLBs accumulate without cleanup | High | Low | Out of scope. Demo-only. Note in `## Notes`. |
| User keys lat as `lon` (decimal direction wrong) | Medium | Low | UX-level — placeholder shows `3.0578`. Simulator decides what to do. |
| `__SIMULATOR_URL__` mis-routes if base already ends with `/simulator` | Low | Low | Current `vite.config.ts` returns the bare domain. If env override puts `/simulator` in `VITE_SIMULATOR_URL`, the URL becomes `…/simulator/simulator?…`. Mitigate by trimming any trailing `/simulator` before appending in code, OR keep simple and document the env contract. Plan chooses simple. |

## Notes
- The simulator URL contract (`model`, `lat`, `lng`, `usage`, `tariff`, optional `gmap`) came directly from the user via question-prompt. Treat it as canonical; revisit only if QA shows mismatch.
- Scratch GLBs are intentionally orphaned (no `project_assets` row). A future cleanup cron / Storage lifecycle rule should reap `${DEV_OWNER_ID}/scratch/*` older than N hours. Out of scope here.
- The wizard at `/app/projects/new` keeps its `location.state?.prefilledFiles` safety net for future flows. Nothing currently feeds it after this plan lands.
- `ProjectDetail.tsx`'s existing simulator link still points to the bare `__SIMULATOR_URL__` root — its hand-off does NOT include parameters. A follow-up plan can extend that path with stored project lat/lon/usage/tariff once those fields exist on the `Project` type.
