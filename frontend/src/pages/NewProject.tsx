import { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle, CloudArrowUp, X } from "@phosphor-icons/react";
import HairlineRule from "@/components/chrome/HairlineRule";
import Workspace3DSection from "@/components/workspace3d/Workspace3DSection";
import { useCreateProject } from "@/store/projects-store";
import { updateProject, uploadAsset, logEvent } from "@/lib/projects-api";
import type { IntakeMode } from "@/data/mock-projects";

// ---------- types ----------

interface FileEntry {
  kind: "glb" | "measurement" | "data_json" | "source_video" | "source_photo";
  file: File;
  progress: number; // 0–100
}

interface FormData {
  name: string;
  address: string;
  lat: string;
  lon: string;
  intakeMode: IntakeMode;
  files: FileEntry[];
}

const STEPS = ["Site setup", "Intake mode", "Upload", "Review & create"] as const;

const INTAKE_OPTIONS: { value: IntakeMode; label: string; tag: string; desc: string }[] = [
  { value: "photos",      label: "Photo set",       tag: "Phone OK", desc: "10–25 multi-angle photos. Manual scale calibration after recon." },
  { value: "drone_video", label: "Drone · Video", tag: "MP4", desc: "Raw drone footage. Meshroom photogrammetry ~8 min on GPU." },
  { value: "demo",        label: "Demo site",        tag: "< 9 s",   desc: "Pre-baked Bukit Jalil mesh from cached PVGIS data." },
];

const UPLOAD_SLOTS: Record<string, { kind: FileEntry["kind"]; label: string; hint: string; accept: string }> = {
  demo: { kind: "glb", label: "GLB model", hint: ".glb", accept: ".glb" },
  drone_video: { kind: "source_video", label: "Drone video", hint: ".mp4 / .mov", accept: "video/mp4,video/quicktime" },
};

// ---------- component ----------

export default function NewProject() {
  const navigate = useNavigate();
  const location = useLocation();
  const createProject = useCreateProject();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormData>({
    name: "",
    address: "",
    lat: "",
    lon: "",
    intakeMode: "demo",
    files: [],
  });

  useEffect(() => {
    if (location.state?.prefilledFiles) {
      setForm((f) => ({
        ...f,
        intakeMode: location.state.prefilledMode,
        files: location.state.prefilledFiles.map((e: any) => ({ ...e, progress: 0 })),
      }));
      // Clear state so it doesn't refire if we navigate back
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // ---- field helpers ----

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setFile = (kind: FileEntry["kind"], file: File | null) => {
    setForm((f) => {
      const rest = f.files.filter((e) => e.kind !== kind);
      if (!file) return { ...f, files: rest };
      return { ...f, files: [...rest, { kind, file, progress: 0 }] };
    });
  };

  const setMultipleFiles = (entries: { kind: FileEntry["kind"]; file: File }[]) => {
    setForm((f) => {
      const newKinds = new Set(entries.map((e) => e.kind));
      const rest = f.files.filter((e) => !newKinds.has(e.kind));
      return { ...f, files: [...rest, ...entries.map((e) => ({ ...e, progress: 0 }))] };
    });
  };

  const setProgress = (file: File, progress: number) =>
    setForm((f) => ({
      ...f,
      files: f.files.map((e) => (e.file === file ? { ...e, progress } : e)),
    }));

  // ---- validation ----

  const step0Valid = form.name.trim().length > 0 && form.lat.trim() !== "" && form.lon.trim() !== "";

  const step2Valid = (() => {
    if (form.intakeMode === "demo") return !!form.files.find((e) => e.kind === "glb");
    if (form.intakeMode === "drone_video") return !!form.files.find((e) => e.kind === "source_video");
    if (form.intakeMode === "photos") return !!form.files.find((e) => e.kind === "glb"); // the generated GLB is stored as 'glb' kind
    return false;
  })();

  const canAdvance = [step0Valid, true, step2Valid, true][step];

  // ---- submit ----

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const project = await createProject.mutateAsync({
        name: form.name.trim(),
        address: form.address.trim() || undefined,
        lat: parseFloat(form.lat),
        lon: parseFloat(form.lon),
        intakeMode: form.intakeMode,
        status: "draft",
      });

      for (const entry of form.files) {
        setProgress(entry.file, 10);
        const { path } = await uploadAsset(project.id, entry.file, entry.kind);
        setProgress(entry.file, 80);

        const pathField: Partial<Record<FileEntry["kind"], string>> = {
          glb:         "modelGlbPath",
          measurement: "measurementImgPath",
          data_json:   "dataJsonPath",
        };
        const fieldName = pathField[entry.kind];
        if (fieldName) {
          await updateProject(project.id, { [fieldName]: path } as never);
        }
        setProgress(entry.file, 100);
      }

      await logEvent(project.id, "created");
      toast.success("Project ready — open in simulator next");
      navigate(`/app/projects/${project.id}`);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message
        : typeof err === "object" && err && "message" in err ? String((err as { message: unknown }).message)
        : JSON.stringify(err);
      console.error("[NewProject] submit failed:", err);
      toast.error(msg || "Something went wrong");
      setSubmitting(false);
    }
  };

  // ---- render ----

  return (
    <main className="flex-1 min-w-0 w-full px-8 lg:px-12 py-10">
        <div className="mb-8">
          <div className="mono text-[10.5px] uppercase tracking-[0.24em] text-leaf-deep mb-2">
            Step {step + 1} of {STEPS.length} · {STEPS[step]}
          </div>
          <h1
            className="numeral text-[36px] tracking-[-0.02em] text-ink"
            style={{ fontWeight: 600 }}
          >
            New project
          </h1>
          <p className="mt-3 text-[14px] text-mute max-w-[56ch]">
            Configure the site, choose intake mode, and upload reference files.
          </p>
        </div>

        {/* step indicators */}
        <div className="flex items-center gap-1.5 mb-8">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className="h-1 rounded-full transition-all"
              style={{
                width: i === step ? 24 : 8,
                background: i <= step ? "var(--leaf)" : "var(--rule)",
              }}
            />
          ))}
        </div>

        <HairlineRule className="mb-8" />

        {/* ---- step panels ---- */}
        {step === 0 && <Step0 form={form} set={set} />}
        {step === 1 && <Step1 form={form} set={set} />}
        {step === 2 && <Step2 form={form} setFile={setFile} setMultipleFiles={setMultipleFiles} />}
        {step === 3 && <Step3 form={form} />}

        {/* ---- nav ---- */}
        <div className="flex items-center justify-between mt-10 pt-6" style={{ borderTop: "1px solid var(--rule)" }}>
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={submitting}
              className="inline-flex items-center gap-2 mono text-[11px] uppercase tracking-[0.18em] text-mute hover:text-ink disabled:opacity-40"
            >
              <ArrowLeft weight="bold" size={12} /> Back
            </button>
          ) : (
            <button
              onClick={() => navigate("/app/clients")}
              className="inline-flex items-center gap-2 mono text-[11px] uppercase tracking-[0.18em] text-mute hover:text-ink"
            >
              <ArrowLeft weight="bold" size={12} /> Cancel
            </button>
          )}

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canAdvance}
              className="inline-flex items-center gap-2 px-5 h-10 rounded-full text-[13px] font-bold tracking-tight text-paper transition-opacity disabled:opacity-30"
              style={{ background: "var(--ink)" }}
            >
              Continue <ArrowRight weight="bold" size={13} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !step0Valid}
              className="inline-flex items-center gap-2 px-5 h-10 rounded-full text-[13px] font-bold tracking-tight text-paper transition-opacity disabled:opacity-30"
              style={{ background: "var(--leaf-deep)" }}
            >
              {submitting ? "Creating…" : "Create project"}
              {!submitting && <CheckCircle weight="bold" size={15} />}
            </button>
          )}
        </div>
    </main>
  );
}

// ---------- Step 0 — site setup ----------

function Step0({ form, set }: { form: FormData; set: <K extends keyof FormData>(k: K, v: FormData[K]) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <Field label="Project name *">
        <input
          type="text"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Bukit Jalil — Detached Residence"
          className="w-full h-11 px-4 rounded-xl text-[14px] text-ink bg-surface outline-none focus:ring-2 focus:ring-leaf"
          style={{ border: "1px solid var(--rule)" }}
        />
      </Field>

      <Field label="Address">
        <input
          type="text"
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
          placeholder="e.g. L23 Jalan Akhirat, Bukit Jalil 57000 KL"
          className="w-full h-11 px-4 rounded-xl text-[14px] text-ink bg-surface outline-none focus:ring-2 focus:ring-leaf"
          style={{ border: "1px solid var(--rule)" }}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
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
        <Field label="Longitude *">
          <input
            type="number"
            step="any"
            value={form.lon}
            onChange={(e) => set("lon", e.target.value)}
            placeholder="101.6612"
            className="w-full h-11 px-4 rounded-xl text-[14px] text-ink bg-surface outline-none focus:ring-2 focus:ring-leaf"
            style={{ border: "1px solid var(--rule)" }}
          />
        </Field>
      </div>

    </div>
  );
}

// ---------- Step 1 — intake mode ----------

function Step1({ form, set }: { form: FormData; set: <K extends keyof FormData>(k: K, v: FormData[K]) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {INTAKE_OPTIONS.map(({ value, label, tag, desc }) => {
        const active = form.intakeMode === value;
        return (
          <button
            key={value}
            onClick={() => set("intakeMode", value)}
            className="group text-left rounded-2xl p-5 flex flex-col gap-3 transition-colors"
            style={{
              border: active ? "1.5px solid var(--leaf)" : "1px solid var(--rule)",
              background: active ? "var(--leaf-tint)" : "var(--surface)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[14.5px] font-extrabold tracking-tight text-ink">{label}</span>
              <span
                className="mono text-[9.5px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full"
                style={{ background: "var(--leaf-tint)", color: "var(--leaf-deep)" }}
              >
                {tag}
              </span>
            </div>
            <p className="text-[12.5px] text-mute leading-relaxed">{desc}</p>
            {active && (
              <span className="inline-flex items-center gap-1 mono text-[10px] uppercase tracking-[0.16em] text-leaf-deep mt-auto">
                <CheckCircle weight="fill" size={12} /> Selected
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ---------- Step 2 — uploads ----------

function Step2({
  form,
  setFile,
  setMultipleFiles,
}: {
  form: FormData;
  setFile: (kind: FileEntry["kind"], file: File | null) => void;
  setMultipleFiles: (entries: { kind: FileEntry["kind"]; file: File }[]) => void;
}) {
  if (form.intakeMode === "photos") {
    const hasGlb = form.files.some((f) => f.kind === "glb");

    if (hasGlb) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-surface shadow-soft border border-rule animate-riseIn">
          <div className="w-14 h-14 bg-leaf-tint rounded-full flex items-center justify-center mb-4 text-leaf-deep">
            <CheckCircle weight="fill" size={28} />
          </div>
          <p className="text-ink font-bold text-[18px] mb-2">Model successfully imported</p>
          <p className="text-mute text-[14px]">
            The 3D model and its source photos are ready. You can proceed to review and create.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-5">
        <p className="text-[13.5px] text-mute">
          Upload your rooftop photos to reconstruct a 3D model.
        </p>
        <Workspace3DSection
          onComplete={async (files, glbUrl) => {
            try {
              const res = await fetch(glbUrl);
              const blob = await res.blob();
              const glbFile = new File([blob], "reconstructed_model.glb", { type: "model/gltf-binary" });
              
              const entries: { kind: FileEntry["kind"]; file: File }[] = [
                { kind: "glb", file: glbFile },
                ...files.map((file) => ({ kind: "source_photo" as const, file })),
              ];
              setMultipleFiles(entries);
            } catch (err) {
              console.error("Failed to fetch generated GLB:", err);
            }
          }}
        />
      </div>
    );
  }

  const slot = UPLOAD_SLOTS[form.intakeMode];
  if (!slot) return null;

  return (
    <div className="flex flex-col gap-5">
      <p className="text-[13.5px] text-mute">
        {form.intakeMode === "demo"
          ? "Upload your pre-rendered GLB model."
          : "Upload your raw drone footage."}
      </p>
      <DropZone
        key={slot.kind}
        slot={{ ...slot, required: () => true }}
        entry={form.files.find((e) => e.kind === slot.kind)}
        intakeMode={form.intakeMode}
        onFile={setFile}
      />
    </div>
  );
}

function DropZone({
  slot,
  entry,
  intakeMode,
  onFile,
}: {
  slot: { kind: FileEntry["kind"]; label: string; hint: string; accept: string; required: (mode: IntakeMode) => boolean };
  entry: FileEntry | undefined;
  intakeMode: IntakeMode;
  onFile: (kind: FileEntry["kind"], file: File | null) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const required = slot.required(intakeMode);

  const handleFiles = (files: FileList | null) => {
    if (files && files[0]) onFile(slot.kind, files[0]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] font-semibold text-ink">
          {slot.label}
          {required && <span className="text-terracotta ml-1">*</span>}
        </span>
        {entry && (
          <button onClick={() => onFile(slot.kind, null)} className="text-mute hover:text-ink">
            <X weight="bold" size={13} />
          </button>
        )}
      </div>

      {entry ? (
        <div
          className="rounded-xl p-4 flex flex-col gap-2"
          style={{ border: "1px solid var(--rule)", background: "var(--surface)" }}
        >
          <div className="flex items-center justify-between text-[12.5px]">
            <span className="text-ink font-semibold truncate max-w-[60%]">{entry.file.name}</span>
            <span className="mono text-mute text-[11px]">{(entry.file.size / 1024).toFixed(0)} KB</span>
          </div>
          {entry.progress > 0 && (
            <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--rule)" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${entry.progress}%`, background: "var(--leaf)" }}
              />
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => ref.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          className="w-full rounded-xl flex flex-col items-center justify-center gap-2 py-8 transition-colors hover:bg-leaf-tint"
          style={{ border: "1.5px dashed color-mix(in srgb, var(--leaf) 40%, transparent)", background: "var(--surface)" }}
        >
          <CloudArrowUp size={24} weight="duotone" className="text-leaf-deep" />
          <span className="text-[12.5px] text-ink-2 font-semibold">Drop file or click to browse</span>
          <span className="mono text-[10px] uppercase tracking-[0.16em] text-mute">{slot.hint}</span>
        </button>
      )}

      <input
        ref={ref}
        type="file"
        accept={slot.accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

// ---------- Step 3 — review ----------

function Step3({ form }: { form: FormData }) {
  const intakeLabel = INTAKE_OPTIONS.find((o) => o.value === form.intakeMode)?.label ?? form.intakeMode;
  return (
    <div className="flex flex-col gap-6">
      <div
        className="rounded-2xl p-6 flex flex-col gap-4"
        style={{ border: "1px solid var(--rule)", background: "var(--surface)" }}
      >
        <div className="mono text-[10px] uppercase tracking-[0.18em] text-leaf-deep">Summary</div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          <ReviewRow label="Name" value={form.name} />
          <ReviewRow label="Address" value={form.address || "—"} />
          <ReviewRow label="Latitude" value={form.lat || "—"} />
          <ReviewRow label="Longitude" value={form.lon || "—"} />
          <ReviewRow label="Intake" value={intakeLabel} />
        </div>

        {form.files.length > 0 && (
          <>
            <div style={{ borderTop: "1px dashed var(--rule)" }} className="pt-4">
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-mute mb-3">Files to upload</div>
              <div className="flex flex-col gap-2">
                {form.files.map((e, index) => (
                  <div key={`${e.kind}-${index}`} className="flex items-center justify-between text-[12.5px]">
                    <span className="mono text-[10px] uppercase tracking-[0.14em] text-leaf-deep">{e.kind}</span>
                    <span className="text-ink-2 truncate max-w-[60%]">{e.file.name}</span>
                    <span className="mono text-mute text-[11px]">{(e.file.size / 1024).toFixed(0)} KB</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {form.files.length === 0 && (
          <p className="text-[12.5px] text-mute">No files attached — project will be created as draft.</p>
        )}
      </div>

      <p className="text-[12.5px] text-mute">
        Clicking <strong className="text-ink">Create project</strong> will insert the project row, upload any attached files, and navigate to the Analysis page.
      </p>
    </div>
  );
}

// ---------- small helpers ----------

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <label className="mono text-[10.5px] uppercase tracking-[0.18em] text-mute">{label}</label>
    {children}
  </div>
);

const ReviewRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-0.5">
    <span className="mono text-[10px] uppercase tracking-[0.14em] text-mute">{label}</span>
    <span className="text-[13.5px] font-semibold text-ink">{value}</span>
  </div>
);
