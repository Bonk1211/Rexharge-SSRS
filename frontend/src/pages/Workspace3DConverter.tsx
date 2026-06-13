import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { uploadScratchGlb, getSignedUrl } from "@/lib/projects-api";
import MeshViewer from "@/components/viewer/MeshViewer";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  DEMO_PHOTO_SET_SAMPLE_HOUSE_4,
  loadDemoPhotoFiles,
} from "@/data/demo-photos";

type Mode = "photos" | "drone";
type Quality = "standard" | "lightweight";
type Format = "glb" | "gltf" | "obj";
type Stage = "idle" | "processing" | "done";

const MODEL_URL = "/models/video_9/3DModel.glb";

// Self-hosted drone footage (native <video>, zero third-party branding).
const DRONE_VIDEO_SRC = "/models/video_2/rexharge_video_2.mp4";
const DRONE_VIDEO_TITLE = "rexharge_video_2.mp4";

// Drone-mode result model, served locally from /public/models/video_2/.
const DRONE_MODEL_URL = "/models/video_2/3DModel.glb";

interface HistoryItem {
  id: string;
  title: string;
  status: "pending" | "ready";
  meta: string;
  group: "Today" | "Yesterday" | "Earlier";
  imageUrl?: string | null;
}


function formatPhotoSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function Workspace3DConverter() {
  const [mode, setMode] = useState<Mode>("photos");
  const [quality, setQuality] = useState<Quality>("standard");
  const [format, setFormat] = useState<Format>("glb");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [loadingSample, setLoadingSample] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [droneLoaded, setDroneLoaded] = useState(false);
  const [videoExpanded, setVideoExpanded] = useState(false);
  const timersRef = useRef<number[]>([]);

  const isDrone = mode === "drone";
  const resultModelUrl = isDrone ? DRONE_MODEL_URL : MODEL_URL;

  const parsedLat = Number.parseFloat(latitude);
  const parsedLng = Number.parseFloat(longitude);
  const hasLocation =
    Number.isFinite(parsedLat) &&
    Math.abs(parsedLat) <= 90 &&
    Number.isFinite(parsedLng) &&
    Math.abs(parsedLng) <= 180;

  useEffect(() => () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
  }, []);

  const photoPreviewUrls = useMemo(
    () => photos.map((f) => URL.createObjectURL(f)),
    [photos],
  );
  useEffect(() => {
    return () => photoPreviewUrls.forEach(URL.revokeObjectURL);
  }, [photoPreviewUrls]);

  function clearTimers() {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }

  // Switching mode resets to the pre-generate state — the previous result
  // belongs to the other mode's inputs, so showing it instantly looks fake.
  function switchMode(next: Mode) {
    if (next === mode) return;
    clearTimers();
    setMode(next);
    setStage("idle");
    setProgress(0);
  }

  async function loadSample() {
    if (loadingSample) return;
    setLoadingSample(true);
    try {
      const files = await loadDemoPhotoFiles(DEMO_PHOTO_SET_SAMPLE_HOUSE_4);
      setPhotos(files.slice(0, 8));
      clearTimers();
      setStage("idle");
      setProgress(0);
    } catch (err) {
      console.error("Failed to load sample:", err);
      toast.error("Could not load sample photos");
    } finally {
      setLoadingSample(false);
    }
  }

  function runTimers() {
    clearTimers();
    setStage("processing");
    setProgress(8);
    const steps: Array<[number, number]> = [
      [550, 22],
      [1150, 43],
      [1850, 67],
      [2600, 88],
      [3300, 100],
    ];
    timersRef.current = [
      ...steps.map(([d, v]) => window.setTimeout(() => setProgress(v), d)),
      window.setTimeout(() => setStage("done"), 3600),
    ];
  }

  function generate() {
    if (stage === "processing") return;
    if (isDrone) {
      if (!droneLoaded) setDroneLoaded(true);
      runTimers();
      return;
    }
    if (photos.length === 0) {
      void loadSample().then(() => runTimers());
      return;
    }
    runTimers();
  }

  async function openInSimulator() {
    if (stage !== "done") return;
    const url = isDrone
      ? "https://solar.limziyang.ml/simulator?model=%2Fstatic%2Fmodels%2Fvideo_2%2F3DModel.glb&lat=3.128080&lng=101.651010&usage=5000&tariff=commercial_lv&gmap=%2Fstatic%2Fmeasurement%2Fssu.png"
      : "https://solar.limziyang.ml/simulator?model=%2Fstatic%2Fmodels%2Fvideo_9%2F3DModel.glb&lat=2.957551863707592&lng=101.55675957141467&usage=700&tariff=domestic&gmap=%2Fstatic%2Fmeasurement%2Fkk257.png";
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const etaText =
    stage === "processing"
      ? `~${Math.max(1, Math.round((100 - progress) * 0.025))} min`
      : "~2 min";

  const history: HistoryItem[] = isDrone
    ? droneLoaded
      ? [
          {
            id: "drone-video",
            title: DRONE_VIDEO_TITLE,
            status: "ready",
            meta: "YouTube ref",
            group: "Today",
            imageUrl: null,
          },
        ]
      : []
    : photos.map((file, i) => ({
        id: `photo-${i}-${file.name}`,
        title: `Rooftop ${String(i + 1).padStart(2, "0")}`,
        status: "ready",
        meta: formatPhotoSize(file.size),
        group: "Today",
        imageUrl: photoPreviewUrls[i],
      }));

  const todays = history;

  return (
    <div
      className="grid bg-paper text-ink relative"
      style={{
        height: "calc(100vh - var(--topbar-height))",
        gridTemplateColumns: "280px 1fr 296px",
        gridTemplateAreas: '"left canvas right"',
      }}
    >
      <div
        className="absolute top-2 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-full mono text-[10.5px] uppercase tracking-[0.16em] flex items-center gap-2 pointer-events-none"
        style={{
          background: "var(--terracotta-tint, #FDECE5)",
          color: "var(--terracotta-deep, #B5532E)",
          border: "1px solid var(--terracotta, #E07856)",
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "currentColor" }} />
        Demo only — no real-time inference; GPU server cost not in scope for this demo
      </div>
      {/* Left rail */}
      <aside
        className="flex flex-col min-h-0"
        style={{ gridArea: "left", borderRight: "1px solid var(--rule)" }}
      >
        <div className="grid grid-cols-2 gap-1.5 p-4 pb-0">
          <ModeTab active={mode === "photos"} onClick={() => switchMode("photos")} label="Photos">
            <PhotosIcon />
          </ModeTab>
          <ModeTab active={mode === "drone"} onClick={() => switchMode("drone")} label="Drone">
            <DroneIcon />
          </ModeTab>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-[18px]">
          {isDrone ? (
            <div>
              <FieldLabel right="1 clip">Drone video</FieldLabel>
              {droneLoaded ? (
                <DroneVideoCard
                  src={DRONE_VIDEO_SRC}
                  title={DRONE_VIDEO_TITLE}
                  variant="loaded"
                />
              ) : (
                <DroneUploadButton onClick={() => setDroneLoaded(true)} />
              )}
            </div>
          ) : (
            <div>
              <FieldLabel right="3–48 imgs">Rooftop photos</FieldLabel>
              <button
                type="button"
                onClick={loadSample}
                disabled={loadingSample}
                className="block w-full text-center rounded-xl px-3.5 py-[22px] transition-colors disabled:opacity-60"
                style={{
                  border: "1px dashed var(--rule)",
                  background: photos.length > 0 ? "var(--leaf-tint)" : "var(--surface)",
                }}
              >
                <DropzoneArt />
                <div className="mt-2 text-[13px] font-bold text-ink">
                  {loadingSample
                    ? "Loading sample…"
                    : photos.length > 0
                      ? `${photos.length} photos loaded`
                      : "Click, drag, or paste"}
                </div>
                <div className="mono text-[9.5px] uppercase tracking-[0.14em] text-mute mt-1">
                  PNG · JPG · DJI
                </div>
              </button>
            </div>
          )}

          <div>
            <FieldLabel>Quality</FieldLabel>
            <Segmented
              value={quality}
              onChange={(v) => setQuality(v as Quality)}
              options={[
                { value: "standard", label: "Standard" },
                { value: "lightweight", label: "Lightweight" },
              ]}
            />
          </div>

          <div>
            <FieldLabel>Format</FieldLabel>
            <Segmented
              value={format}
              onChange={(v) => setFormat(v as Format)}
              options={[
                { value: "glb", label: "GLB" },
                { value: "gltf", label: "GLTF" },
                { value: "obj", label: "OBJ" },
              ]}
            />
          </div>

          <div>
            <FieldLabel right="WGS84">Rooftop location</FieldLabel>
            <div className="grid grid-cols-2 gap-1.5">
              <CoordinateField
                label="Lat"
                value={latitude}
                onChange={setLatitude}
                placeholder="3.139000"
                min={-90}
                max={90}
              />
              <CoordinateField
                label="Lng"
                value={longitude}
                onChange={setLongitude}
                placeholder="101.687000"
                min={-180}
                max={180}
              />
            </div>
            <div className="mono text-[9.5px] uppercase tracking-[0.14em] text-mute mt-1.5">
              {hasLocation
                ? `${parsedLat.toFixed(6)}, ${parsedLng.toFixed(6)}`
                : "Decimal degrees · optional"}
            </div>
          </div>
        </div>

        <div className="p-4" style={{ borderTop: "1px solid var(--rule)" }}>
          <div className="flex items-center justify-between mb-3 mono text-[10.5px] uppercase tracking-[0.12em] text-mute">
            <span>
              Est.{" "}
              <b
                className="text-ink"
                style={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontSize: 14,
                  letterSpacing: "-0.01em",
                  fontWeight: 700,
                }}
              >
                {etaText}
              </b>
            </span>
          </div>
          <button
            type="button"
            onClick={generate}
            disabled={stage === "processing"}
            className="w-full inline-flex items-center justify-center gap-2.5 rounded-[10px] px-[18px] py-[14px] text-[13.5px] font-extrabold text-paper transition-transform disabled:cursor-not-allowed disabled:opacity-70 hover:-translate-y-px"
            style={{
              background: "var(--ink)",
              boxShadow:
                "0 1px 0 rgba(255,255,255,0.18) inset, 0 12px 24px -14px rgba(26,31,28,0.55)",
            }}
          >
            <SparkIcon />
            {stage === "processing"
              ? `Generating · ${progress}%`
              : stage === "done"
                ? "Regenerate"
                : "Generate"}
          </button>
        </div>
      </aside>

      {/* Canvas */}
      <section
        className="bg-blueprint relative min-h-0 overflow-hidden"
        style={{ gridArea: "canvas" }}
      >
        {stage === "processing" ? (
          <ProcessingScene
            progress={progress}
            etaText={etaText}
            photoPreviewUrls={photoPreviewUrls}
            photoCount={photos.length}
          />
        ) : stage === "done" ? (
          <div className="absolute inset-0 flex flex-col items-stretch justify-center p-8 gap-5">
            <div
              className="mono text-[10px] uppercase tracking-[0.22em] inline-flex items-center gap-2 self-center"
              style={{ color: "var(--leaf-deep)" }}
            >
              <span
                className="inline-block"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: "var(--leaf)",
                  boxShadow: "0 0 0 3px var(--leaf-tint)",
                }}
              />
              {isDrone
                ? "Textured GLB · from drone video"
                : `Textured GLB · ${photos.length} photo${photos.length === 1 ? "" : "s"}`}
            </div>

            <div className="mx-auto w-full max-w-[860px]">
              <MeshViewer
                lat={hasLocation ? parsedLat : 3.139}
                lon={hasLocation ? parsedLng : 101.687}
                glbUrl={resultModelUrl}
              />
            </div>

            <div className="flex items-center justify-center gap-3.5">
              <a
                href={resultModelUrl}
                download="reconstructed_model.glb"
                className="inline-flex h-10 items-center gap-2 rounded-full px-5 text-[12.5px] font-extrabold text-paper transition-colors hover:opacity-90"
                style={{ background: "var(--leaf-deep)" }}
              >
                Download .glb
              </a>
              <button
                type="button"
                onClick={openInSimulator}
                disabled={uploading}
                className="inline-flex h-10 items-center gap-2 rounded-full px-5 text-[12.5px] font-extrabold text-ink transition-colors disabled:opacity-60"
                style={{ background: "var(--surface)", border: "1px solid var(--rule)" }}
              >
                {uploading ? "Uploading…" : "Open in simulator"}
              </button>
              <button
                type="button"
                onClick={generate}
                className="text-[12.5px] font-bold text-mute hover:text-ink"
                style={{
                  textDecoration: "underline",
                  textDecorationStyle: "dotted",
                  textUnderlineOffset: 4,
                }}
              >
                Regenerate
              </button>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
            <div
              className="mono text-[10px] uppercase tracking-[0.22em] inline-flex items-center gap-2 mb-[22px]"
              style={{ color: "var(--leaf-deep)" }}
            >
              <span
                className="inline-block"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: "var(--leaf)",
                  boxShadow: "0 0 0 3px var(--leaf-tint)",
                }}
              />
              {isDrone ? "Drone video · textured GLB" : "Photo set · textured GLB"}
            </div>

            <h1
              className="numeral text-center m-0"
              style={{
                fontSize: 52,
                lineHeight: 0.98,
                letterSpacing: "-0.035em",
                maxWidth: 640,
              }}
            >
              Drop a rooftop.<br />
              Get a{" "}
              <em
                style={{
                  fontStyle: "italic",
                  fontVariationSettings: '"opsz" 144, "SOFT" 100',
                  color: "var(--ink-2)",
                  fontWeight: 600,
                }}
              >
                textured mesh
              </em>
              .
            </h1>

            <div
              className="mt-12 grid items-center gap-[18px]"
              style={{ gridTemplateColumns: "auto auto auto auto auto" }}
            >
              <FlowCard label="01 · Photos">
                <PhotosFlowArt />
              </FlowCard>
              <FlowArrow />
              <FlowCard label="02 · Wireframe">
                <WireframeArt />
              </FlowCard>
              <FlowArrow />
              <FlowCard label="03 · Textured GLB">
                <TexturedArt />
              </FlowCard>
            </div>

            <div className="mt-11 flex items-center gap-3.5">
              <button
                type="button"
                onClick={generate}
                className="inline-flex items-center gap-2.5 rounded-full px-[22px] py-3 text-[13px] font-extrabold text-paper transition-transform hover:-translate-y-px"
                style={{
                  background: "var(--ink)",
                  boxShadow: "0 12px 24px -14px rgba(26,31,28,0.55)",
                }}
              >
                Generate
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path
                    d="M3 3 L9 3 L9 9 M9 3 L3 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={loadSample}
                disabled={loadingSample}
                className="text-[12.5px] font-bold text-mute hover:text-ink disabled:opacity-60"
                style={{
                  textDecoration: "underline",
                  textDecorationStyle: "dotted",
                  textUnderlineOffset: 4,
                }}
              >
                or load sample · Sentul 04
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Right rail */}
      <aside
        className="flex flex-col min-h-0"
        style={{ gridArea: "right", borderLeft: "1px solid var(--rule)" }}
      >
        {isDrone ? (
          <div
            className="px-4 py-3.5"
            style={{ borderBottom: "1px solid var(--rule)" }}
          >
            <div className="mono text-[10px] uppercase tracking-[0.16em] text-mute mb-2.5">
              Reference video
            </div>
            {droneLoaded ? (
              <DroneVideoCard
                src={DRONE_VIDEO_SRC}
                title={DRONE_VIDEO_TITLE}
                variant="player"
                onExpand={() => setVideoExpanded(true)}
              />
            ) : (
              <div
                className="rounded-xl flex items-center justify-center text-center px-3"
                style={{
                  aspectRatio: "16 / 9",
                  border: "1px dashed var(--rule)",
                  background: "var(--surface-2)",
                }}
              >
                <span className="mono text-[10px] uppercase tracking-[0.14em] text-mute">
                  No footage uploaded yet
                </span>
              </div>
            )}
          </div>
        ) : (
        <div
          className="px-4 py-3.5 flex items-center gap-2"
          style={{ borderBottom: "1px solid var(--rule)" }}
        >
          <div
            className="flex-1 flex items-center gap-2 rounded-full px-3 py-1.5"
            style={{ border: "1px solid var(--rule)", background: "var(--surface)" }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              className="text-mute"
            >
              <circle cx="6" cy="6" r="4.5" />
              <path d="M9.2 9.2 L12.5 12.5" />
            </svg>
            <input
              type="text"
              placeholder="Search generations…"
              className="flex-1 bg-transparent border-0 outline-none text-[12px] text-ink placeholder:text-mute"
            />
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-bold transition-colors hover:opacity-90"
            style={{
              background: "var(--leaf-tint)",
              color: "var(--leaf-deep)",
              border: "1px solid rgba(61,141,47,0.2)",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9 V2 M3 5 L6 2 L9 5 M2 10 H10" />
            </svg>
            Upload
          </button>
        </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-3.5 flex flex-col gap-2.5">
          {todays.length > 0 && <HistoryGroupLabel>Today</HistoryGroupLabel>}
          {todays.map((h) => (
            <HistoryCard key={h.id} item={h} />
          ))}
          {history.length === 0 && (
            <p className="text-[12px] text-mute py-2">No uploads yet.</p>
          )}
        </div>

        <div
          className="px-4 py-2.5 flex items-center justify-between mono text-[10px] uppercase tracking-[0.14em] text-mute"
          style={{ borderTop: "1px solid var(--rule)" }}
        >
          <span>
            {history.length} {history.length === 1 ? "upload" : "uploads"}
          </span>
          <span>v3.2.1</span>
        </div>
      </aside>

      <ReferenceVideoModal
        open={videoExpanded}
        onClose={() => setVideoExpanded(false)}
        src={DRONE_VIDEO_SRC}
        title={DRONE_VIDEO_TITLE}
      />
    </div>
  );
}

// ---- subcomponents ----

function ModeTab({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-[10px] py-2.5 px-1 transition-colors"
      style={{
        border: `1px solid ${active ? "var(--ink)" : "var(--rule)"}`,
        background: active ? "var(--ink)" : "var(--surface)",
        color: active ? "var(--paper)" : "var(--ink-2)",
      }}
    >
      <span style={{ color: active ? "var(--leaf)" : "var(--ink-2)" }}>{children}</span>
      <span
        className="mono"
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.14em",
        }}
      >
        {label}
      </span>
    </button>
  );
}

function FieldLabel({ children, right }: { children: React.ReactNode; right?: string }) {
  return (
    <div
      className="text-[10.5px] font-bold uppercase mb-2 flex items-center"
      style={{ letterSpacing: "0.16em", color: "var(--ink)" }}
    >
      <span>{children}</span>
      {right && (
        <span
          className="ml-auto mono"
          style={{
            fontSize: 9.5,
            color: "var(--mute)",
            fontWeight: 500,
            letterSpacing: "0.12em",
          }}
        >
          {right}
        </span>
      )}
    </div>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div
      className="grid gap-0.5 rounded-lg p-[3px]"
      style={{
        gridTemplateColumns: `repeat(${options.length}, 1fr)`,
        background: "var(--surface-2)",
        border: "1px solid var(--rule)",
      }}
    >
      {options.map((o) => {
        const pressed = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className="rounded-md py-1.5 px-2 text-[11.5px] font-bold transition-colors"
            style={{
              background: pressed ? "var(--surface)" : "transparent",
              color: pressed ? "var(--ink)" : "var(--mute)",
              boxShadow: pressed ? "0 1px 2px rgba(26,31,28,0.06)" : undefined,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function CoordinateField({
  label,
  value,
  onChange,
  placeholder,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  min: number;
  max: number;
}) {
  return (
    <label
      className="flex items-center gap-2 rounded-lg px-2.5 py-2"
      style={{ border: "1px solid var(--rule)", background: "var(--surface)" }}
    >
      <span
        className="mono uppercase"
        style={{ fontSize: 9.5, letterSpacing: "0.14em", color: "var(--mute)" }}
      >
        {label}
      </span>
      <input
        type="number"
        step="any"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-w-0 bg-transparent border-0 outline-none text-[12px] font-bold text-ink placeholder:text-mute placeholder:font-medium"
      />
    </label>
  );
}

function HistoryGroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mono uppercase pt-1.5 pb-0.5"
      style={{
        fontSize: 9.5,
        color: "var(--mute)",
        letterSpacing: "0.18em",
      }}
    >
      {children}
    </div>
  );
}

function HistoryCard({ item }: { item: HistoryItem }) {
  return (
    <div
      className="grid gap-3 p-2 rounded-[10px] transition-all hover:-translate-y-px"
      style={{
        gridTemplateColumns: "56px 1fr",
        border: "1px solid var(--rule)",
        background: "var(--surface)",
      }}
    >
      <div
        className="rounded-lg overflow-hidden relative"
        style={{
          width: 56,
          height: 56,
          background: "var(--surface-2)",
          border: "1px solid var(--rule)",
        }}
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <HistoryThumb />
        )}
      </div>
      <div className="flex flex-col justify-center gap-1 min-w-0">
        <div
          className="text-[12.5px] font-bold text-ink truncate"
          style={{ letterSpacing: "-0.005em" }}
        >
          {item.title}
        </div>
        <div
          className="mono flex items-center gap-1.5"
          style={{
            fontSize: 9.5,
            color: "var(--mute)",
            textTransform: "uppercase",
            letterSpacing: "0.14em",
          }}
        >
          <span style={{ color: item.status === "ready" ? "var(--leaf-deep)" : "var(--solar)" }}>
            ● {item.status === "ready" ? "Ready" : "Pending"}
          </span>
          <span>·</span>
          <span>{item.meta}</span>
        </div>
        {item.status === "pending" && (
          <div
            className="h-0.5 rounded-full mt-1 overflow-hidden"
            style={{ background: "var(--rule)" }}
          >
            <span
              className="block h-full rounded-full"
              style={{
                background: "var(--solar)",
                width: "60%",
                animation: "phw 1.6s ease-in-out infinite",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ---- art ----

function DroneUploadButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full text-center rounded-xl px-3.5 py-[22px] transition-colors hover:bg-leaf-tint"
      style={{ border: "1px dashed var(--rule)", background: "var(--surface)" }}
    >
      <span
        className="mx-auto flex items-center justify-center"
        style={{ width: 44, height: 44, color: "var(--ink-2)" }}
      >
        <DroneIcon />
      </span>
      <div className="mt-2 text-[13px] font-bold text-ink">Upload drone footage</div>
      <div className="mono text-[9.5px] uppercase tracking-[0.14em] text-mute mt-1">
        MP4 · MOV · DJI
      </div>
    </button>
  );
}

function DroneVideoCard({
  src,
  title,
  variant,
  onExpand,
}: {
  src: string;
  title: string;
  variant: "player" | "loaded";
  onExpand?: () => void;
}) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid var(--rule)", background: "var(--surface)" }}
    >
      <div
        className={`group relative w-full overflow-hidden${
          variant === "player" && onExpand ? " cursor-zoom-in" : ""
        }`}
        style={{ aspectRatio: "16 / 9", background: "var(--surface-2)" }}
        onClick={variant === "player" ? onExpand : undefined}
      >
        {variant === "player" ? (
          // Self-hosted clip: autoplay muted loop, no controls → zero branding.
          <>
            <video
              src={src}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {onExpand && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onExpand();
                }}
                aria-label="Expand reference video"
                className="absolute top-2 right-2 inline-flex items-center justify-center w-7 h-7 rounded-full bg-ink/65 text-paper opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:bg-ink"
              >
                <ExpandIcon />
              </button>
            )}
          </>
        ) : (
          // Loaded indicator: first frame only, no playback.
          <video
            src={`${src}#t=0.1`}
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>
      <div className="px-3 py-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[13px] font-bold text-ink truncate">{title}</div>
          <div className="mono text-[9.5px] uppercase tracking-[0.14em] text-mute mt-1">
            REF · DRONE VIDEO
          </div>
        </div>
        {variant === "loaded" && (
          <span
            className="mono text-[9.5px] uppercase tracking-[0.14em] whitespace-nowrap"
            style={{ color: "var(--leaf-deep)" }}
          >
            ● Loaded
          </span>
        )}
      </div>
    </div>
  );
}

function ReferenceVideoModal({
  open,
  onClose,
  src,
  title,
}: {
  open: boolean;
  onClose: () => void;
  src: string;
  title: string;
}) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 grid place-items-center bg-ink/45 backdrop-blur-sm p-6"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ref-video-title"
        onClick={(event) => event.stopPropagation()}
        className="relative rounded-2xl bg-surface w-[92vw] max-w-[860px] overflow-hidden"
        style={{
          border: "1px solid var(--rule)",
          boxShadow: "0 30px 80px -20px rgba(0,0,0,0.35)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close reference video"
          className="absolute top-3 right-3 z-10 inline-flex items-center justify-center w-9 h-9 rounded-full bg-ink/65 text-paper transition-colors hover:bg-ink"
        >
          <CloseIcon />
        </button>

        <div
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: "16 / 9", background: "var(--ink)" }}
        >
          {/* Expanded view: full controls so the footage can be inspected frame-by-frame. */}
          <video
            src={src}
            autoPlay
            muted
            loop
            controls
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>

        <div className="px-6 py-5">
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-leaf-deep mb-2">
            Reference video
          </div>
          <h2
            id="ref-video-title"
            className="numeral text-[22px] tracking-[-0.02em] text-ink truncate"
            style={{ fontWeight: 600 }}
          >
            {title}
          </h2>
        </div>
      </div>
    </div>
  );
}

function ExpandIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 1 H1 V5 M9 1 H13 V5 M5 13 H1 V9 M9 13 H13 V9" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 4 L12 12 M12 4 L4 12" />
    </svg>
  );
}

function DropzoneArt() {
  return (
    <div className="relative mx-auto" style={{ width: 64, height: 48 }}>
      <PhCard kind="ph1" />
      <PhCard kind="ph2" />
      <PhCard kind="ph3" tint />
    </div>
  );
}

function PhCard({ kind, tint }: { kind: "ph1" | "ph2" | "ph3"; tint?: boolean }) {
  const transforms: Record<string, React.CSSProperties> = {
    ph1: { left: 0, top: 8, transform: "rotate(-6deg)" },
    ph2: { left: 13, top: 4, transform: "rotate(-1deg)" },
    ph3: { left: 26, top: 8, transform: "rotate(5deg)" },
  };
  return (
    <div
      style={{
        position: "absolute",
        width: 38,
        height: 30,
        background: tint ? "var(--leaf-tint)" : "var(--surface)",
        border: `1px solid ${tint ? "var(--leaf)" : "var(--rule)"}`,
        borderRadius: 4,
        ...transforms[kind],
      }}
    >
      <span
        style={{
          position: "absolute",
          inset: 4,
          background:
            "repeating-linear-gradient(-30deg,var(--rule) 0,var(--rule) 1px,transparent 1px,transparent 5px)",
          borderRadius: 2,
          opacity: 0.7,
        }}
      />
    </div>
  );
}

function FlowCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="relative p-2 rounded-[10px]"
      style={{
        width: 132,
        height: 96,
        border: "1px solid var(--rule)",
        background: "var(--surface)",
      }}
    >
      <div
        className="mono"
        style={{
          fontSize: 9,
          color: "var(--mute)",
          textTransform: "uppercase",
          letterSpacing: "0.16em",
        }}
      >
        {label}
      </div>
      <div className="absolute" style={{ inset: "22px 8px 8px" }}>
        {children}
      </div>
    </div>
  );
}

function FlowArrow() {
  return (
    <span
      className="mono"
      style={{ color: "var(--dim)", fontSize: 16 }}
      aria-hidden
    >
      ⟶
    </span>
  );
}

function PhotosFlowArt() {
  return (
    <svg viewBox="0 0 116 64" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <defs>
        <pattern id="wsp2h" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
          <line x1="0" y1="0" x2="0" y2="4" stroke="#9aa395" strokeWidth="0.5" />
        </pattern>
      </defs>
      <g transform="translate(14 12) rotate(-7)">
        <rect width="44" height="32" rx="3" fill="#fff" stroke="#cfc9bb" strokeWidth="0.8" />
        <rect x="3" y="3" width="38" height="26" rx="2" fill="url(#wsp2h)" />
        <path d="M3 22 L14 14 L24 19 L36 11 L41 14 L41 29 L3 29 Z" fill="#dfd9c9" />
      </g>
      <g transform="translate(36 6) rotate(2)">
        <rect width="44" height="32" rx="3" fill="#fff" stroke="#cfc9bb" strokeWidth="0.8" />
        <rect x="3" y="3" width="38" height="26" rx="2" fill="url(#wsp2h)" />
        <path d="M3 20 L12 12 L22 17 L34 10 L41 13 L41 29 L3 29 Z" fill="#dfd9c9" />
        <circle cx="34" cy="7" r="2" fill="#f4b82e" />
      </g>
      <g transform="translate(58 14) rotate(7)">
        <rect width="44" height="32" rx="3" fill="#fff" stroke="#3D8D2F" strokeWidth="1" />
        <rect x="3" y="3" width="38" height="26" rx="2" fill="#DFF1D8" />
        <path d="M3 22 L15 13 L25 19 L37 11 L41 15 L41 29 L3 29 Z" fill="#5DB94D" opacity="0.55" />
      </g>
    </svg>
  );
}

function WireframeArt() {
  return (
    <svg viewBox="0 0 116 64" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <g stroke="#3A4441" strokeWidth="0.8" fill="none" strokeLinejoin="round">
        <polygon points="12,46 58,28 104,46 58,58" />
        <polygon points="18,40 58,24 98,40 58,50" />
      </g>
      <g stroke="#5DB94D" strokeWidth="0.4" opacity="0.85">
        <line x1="18" y1="40" x2="38" y2="35" />
        <line x1="38" y1="35" x2="58" y2="50" />
        <line x1="38" y1="35" x2="58" y2="30" />
        <line x1="58" y1="30" x2="78" y2="35" />
        <line x1="78" y1="35" x2="58" y2="50" />
        <line x1="78" y1="35" x2="98" y2="40" />
        <line x1="28" y1="38" x2="46" y2="43" />
        <line x1="70" y1="43" x2="88" y2="38" />
        <line x1="46" y1="43" x2="70" y2="43" />
      </g>
      <g fill="#3A4441">
        <circle cx="18" cy="40" r="1.1" />
        <circle cx="38" cy="35" r="1.1" />
        <circle cx="58" cy="24" r="1.1" />
        <circle cx="58" cy="30" r="1.1" />
        <circle cx="58" cy="50" r="1.1" />
        <circle cx="78" cy="35" r="1.1" />
        <circle cx="98" cy="40" r="1.1" />
        <circle cx="28" cy="38" r="1.1" />
        <circle cx="46" cy="43" r="1.1" />
        <circle cx="70" cy="43" r="1.1" />
        <circle cx="88" cy="38" r="1.1" />
      </g>
    </svg>
  );
}

function TexturedArt() {
  return (
    <svg viewBox="0 0 116 64" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <defs>
        <pattern id="wsroof2h" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
          <line x1="0" y1="0" x2="0" y2="3" stroke="#3A4441" strokeWidth="0.3" opacity="0.5" />
        </pattern>
        <linearGradient id="wsroof2f" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F2F0EA" />
          <stop offset="100%" stopColor="#E4E1D8" />
        </linearGradient>
      </defs>
      <polygon points="12,46 58,56 58,60 12,52" fill="#3A4441" opacity="0.18" />
      <polygon points="104,46 58,56 58,60 104,52" fill="#3A4441" opacity="0.28" />
      <polygon points="18,40 58,24 98,40 58,50" fill="url(#wsroof2f)" stroke="#3A4441" strokeWidth="0.8" />
      <polygon points="18,40 58,24 98,40 58,50" fill="url(#wsroof2h)" />
      <line x1="18" y1="40" x2="98" y2="40" stroke="#3A4441" strokeWidth="0.5" strokeDasharray="1.5 1.5" />
      <g>
        <polygon points="28,40 50,28 54,29 32,41" fill="#1F4E66" stroke="#1A1F1C" strokeWidth="0.3" />
        <polygon points="34,43 56,31 60,32 38,44" fill="#1F4E66" stroke="#1A1F1C" strokeWidth="0.3" />
        <polygon points="40,46 58,30 62,32 44,47" fill="#1F4E66" stroke="#1A1F1C" strokeWidth="0.3" />
        <polygon points="62,30 84,42 88,40 66,28" fill="#1F4E66" stroke="#1A1F1C" strokeWidth="0.3" />
        <polygon points="56,32 78,44 82,43 60,31" fill="#1F4E66" stroke="#1A1F1C" strokeWidth="0.3" />
        <polygon points="50,34 72,46 76,45 54,33" fill="#1F4E66" stroke="#1A1F1C" strokeWidth="0.3" />
        <g fill="#F4B82E" opacity="0.35">
          <polygon points="28,40 50,28 54,29 32,41" />
          <polygon points="34,43 56,31 60,32 38,44" />
        </g>
      </g>
    </svg>
  );
}

function HistoryThumb() {
  return (
    <svg viewBox="0 0 56 56" width="100%" height="100%">
      <rect width="56" height="56" fill="#F2F0EA" />
      <polygon points="6,42 28,20 50,42 28,52" fill="#EDEAE0" stroke="#3A4441" strokeWidth="0.5" />
      <polygon points="14,38 26,24 30,25 18,37" fill="#1F4E66" />
      <polygon points="32,25 44,37 40,38 28,26" fill="#1F4E66" />
    </svg>
  );
}

function PhotosIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="11" r="2" />
      <path d="M3 17 L9 12 L14 16 L17 14 L21 18" />
    </svg>
  );
}

function DroneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="6" height="6" rx="1" />
      <path d="M9 12 H4 M15 12 H20 M12 9 V4 M12 15 V20" />
      <circle cx="4" cy="12" r="1.5" />
      <circle cx="20" cy="12" r="1.5" />
      <circle cx="12" cy="4" r="1.5" />
      <circle cx="12" cy="20" r="1.5" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <span style={{ color: "var(--solar)" }} aria-hidden>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 1 L8.2 5.8 L13 7 L8.2 8.2 L7 13 L5.8 8.2 L1 7 L5.8 5.8 Z" fill="currentColor" />
      </svg>
    </span>
  );
}

// ---- processing scene ----

function ProcessingScene({
  progress,
  etaText,
  photoPreviewUrls,
  photoCount,
}: {
  progress: number;
  etaText: string;
  photoPreviewUrls: string[];
  photoCount: number;
}) {
  const stageIndex = progress < 33 ? 0 : progress < 70 ? 1 : 2;
  const stageLabels = ["Aligning photos", "Building wireframe", "Texturing mesh"];
  const focusPhoto = photoCount > 0
    ? Math.min(photoCount - 1, Math.floor((progress / 100) * photoCount))
    : 0;

  return (
    <div className="absolute inset-0 flex flex-col items-stretch justify-center p-8 gap-6">
      <div
        className="mono text-[10px] uppercase tracking-[0.22em] inline-flex items-center gap-2 self-center"
        style={{ color: "var(--leaf-deep)" }}
      >
        <span
          className="inline-block animate-pulse"
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: "var(--solar)",
            boxShadow: "0 0 0 3px color-mix(in srgb, var(--solar) 30%, transparent)",
          }}
        />
        {stageLabels[stageIndex]} · {progress}% · ETA {etaText}
      </div>

      <div
        className="mx-auto w-full max-w-[680px] rounded-2xl overflow-hidden relative"
        style={{
          aspectRatio: "16/10",
          background: "var(--surface-2)",
          border: "1px solid var(--rule)",
        }}
      >
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [3.6, 2.4, 4.2], fov: 42, near: 0.1, far: 100 }}
          style={{ background: "transparent" }}
        >
          <color attach="background" args={["#f7f5ef"]} />
          <ambientLight intensity={0.8} />
          <directionalLight position={[4, 6, 5]} intensity={1.6} />
          <BuildingRig progress={progress} />
        </Canvas>
        <ScanLine progress={progress} />
        <GridOverlay />
      </div>

      <div className="mx-auto w-full max-w-[680px] flex flex-col gap-3">
        <div className="flex items-center gap-2 overflow-hidden">
          {photoPreviewUrls.map((url, i) => {
            const isFocus = i === focusPhoto;
            const isPast = i < focusPhoto;
            return (
              <div
                key={url}
                className="rounded-md overflow-hidden flex-shrink-0 transition-all duration-300"
                style={{
                  width: isFocus ? 56 : 40,
                  height: isFocus ? 56 : 40,
                  border: `1.5px solid ${isFocus ? "var(--leaf-deep)" : "var(--rule)"}`,
                  opacity: isPast ? 0.4 : 1,
                  transform: isFocus ? "translateY(-2px)" : "none",
                  boxShadow: isFocus
                    ? "0 6px 14px -8px rgba(61,141,47,0.55)"
                    : "none",
                }}
              >
                <img
                  src={url}
                  alt=""
                  aria-hidden
                  className="w-full h-full object-cover"
                />
              </div>
            );
          })}
        </div>

        <div
          className="h-1.5 rounded-full overflow-hidden relative"
          style={{ background: "var(--rule)" }}
        >
          <span
            className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background:
                "linear-gradient(90deg, var(--leaf), var(--leaf-deep))",
            }}
          />
        </div>

        <div className="flex items-center justify-between mono text-[9.5px] uppercase tracking-[0.18em] text-mute">
          {stageLabels.map((label, i) => {
            const reached = i <= stageIndex;
            return (
              <span
                key={label}
                style={{
                  color: reached ? "var(--leaf-deep)" : "var(--mute)",
                  fontWeight: reached ? 700 : 500,
                }}
              >
                {String(i + 1).padStart(2, "0")} · {label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BuildingRig({ progress }: { progress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.45;
  });

  const wireOpacity = Math.max(0.1, 1 - progress / 120);
  const solidOpacity = Math.max(0, (progress - 35) / 70);

  return (
    <group ref={groupRef} position={[0, -0.4, 0]}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2.4, 1, 1.6]} />
        <meshStandardMaterial
          color="#cdb992"
          transparent
          opacity={solidOpacity}
          roughness={0.7}
        />
      </mesh>
      <mesh position={[0, 1.3, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.7, 0.9, 4]} />
        <meshStandardMaterial
          color="#7f5638"
          transparent
          opacity={solidOpacity}
          roughness={0.55}
        />
      </mesh>

      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2.4, 1, 1.6]} />
        <meshBasicMaterial
          color="#3d8d2f"
          wireframe
          transparent
          opacity={wireOpacity}
        />
      </mesh>
      <mesh position={[0, 1.3, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.7, 0.9, 4]} />
        <meshBasicMaterial
          color="#3d8d2f"
          wireframe
          transparent
          opacity={wireOpacity}
        />
      </mesh>
    </group>
  );
}

function ScanLine({ progress }: { progress: number }) {
  return (
    <div
      className="pointer-events-none absolute left-0 right-0"
      style={{
        top: `${Math.min(95, progress)}%`,
        height: 2,
        background:
          "linear-gradient(90deg, transparent, var(--leaf-deep), transparent)",
        boxShadow:
          "0 0 24px 4px color-mix(in srgb, var(--leaf-deep) 40%, transparent)",
        transition: "top 0.45s ease-out",
      }}
    />
  );
}

function GridOverlay() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 w-full h-full"
      aria-hidden
    >
      <defs>
        <pattern id="proc-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path
            d="M 32 0 L 0 0 0 32"
            fill="none"
            stroke="rgba(61,141,47,0.10)"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#proc-grid)" />
    </svg>
  );
}
