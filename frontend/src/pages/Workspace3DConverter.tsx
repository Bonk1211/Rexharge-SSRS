import { useEffect, useState } from "react";
import { toast } from "sonner";

// Frontend-only build: this page is a static UI mockup of the 3D converter.
// The photo/drone -> 3D reconstruction pipeline runs offline and is not part of
// this build, so "Generate" is a no-op and no backend is contacted.

type Mode = "photos" | "drone";
type Quality = "standard" | "lightweight";
type Format = "glb" | "gltf" | "obj";

// Self-hosted drone footage (native <video>, served locally from /public/models).
const DRONE_VIDEO_SRC = "/models/video_2/rexharge_video_2.mp4";
const DRONE_VIDEO_TITLE = "rexharge_video_2.mp4";

interface HistoryItem {
  id: string;
  title: string;
  status: "pending" | "ready";
  meta: string;
  imageUrl?: string | null;
}

export default function Workspace3DConverter() {
  const [mode, setMode] = useState<Mode>("photos");
  const [quality, setQuality] = useState<Quality>("standard");
  const [format, setFormat] = useState<Format>("glb");
  const [videoExpanded, setVideoExpanded] = useState(false);

  const isDrone = mode === "drone";

  function generate() {
    toast.info("Demo build — model reconstruction runs offline.");
  }

  const history: HistoryItem[] = isDrone
    ? [{ id: "drone-video", title: DRONE_VIDEO_TITLE, status: "ready", meta: "REF · drone", imageUrl: null }]
    : [{ id: "sample-rooftop", title: "Rooftop 01", status: "ready", meta: "8 photos", imageUrl: null }];

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
        Demo only — UI preview; reconstruction runs offline
      </div>

      {/* Left rail */}
      <aside
        className="flex flex-col min-h-0"
        style={{ gridArea: "left", borderRight: "1px solid var(--rule)" }}
      >
        <div className="grid grid-cols-2 gap-1.5 p-4 pb-0">
          <ModeTab active={mode === "photos"} onClick={() => setMode("photos")} label="Photos">
            <PhotosIcon />
          </ModeTab>
          <ModeTab active={mode === "drone"} onClick={() => setMode("drone")} label="Drone">
            <DroneIcon />
          </ModeTab>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-[18px]">
          {isDrone ? (
            <div>
              <FieldLabel right="1 clip">Drone video</FieldLabel>
              <DroneVideoCard src={DRONE_VIDEO_SRC} title={DRONE_VIDEO_TITLE} variant="loaded" />
            </div>
          ) : (
            <div>
              <FieldLabel right="3–48 imgs">Rooftop photos</FieldLabel>
              <div
                className="block w-full text-center rounded-xl px-3.5 py-[22px]"
                style={{ border: "1px dashed var(--rule)", background: "var(--surface)" }}
              >
                <DropzoneArt />
                <div className="mt-2 text-[13px] font-bold text-ink">Click, drag, or paste</div>
                <div className="mono text-[9.5px] uppercase tracking-[0.14em] text-mute mt-1">
                  PNG · JPG · DJI
                </div>
              </div>
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
        </div>

        <div className="p-4" style={{ borderTop: "1px solid var(--rule)" }}>
          <button
            type="button"
            onClick={generate}
            className="w-full inline-flex items-center justify-center gap-2.5 rounded-[10px] px-[18px] py-[14px] text-[13.5px] font-extrabold text-paper transition-transform hover:-translate-y-px"
            style={{
              background: "var(--ink)",
              boxShadow: "0 1px 0 rgba(255,255,255,0.18) inset, 0 12px 24px -14px rgba(26,31,28,0.55)",
            }}
          >
            <SparkIcon />
            Generate
          </button>
        </div>
      </aside>

      {/* Canvas — static hero */}
      <section
        className="bg-blueprint relative min-h-0 overflow-hidden"
        style={{ gridArea: "canvas" }}
      >
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
            style={{ fontSize: 52, lineHeight: 0.98, letterSpacing: "-0.035em", maxWidth: 640 }}
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
              style={{ background: "var(--ink)", boxShadow: "0 12px 24px -14px rgba(26,31,28,0.55)" }}
            >
              Generate
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M3 3 L9 3 L9 9 M9 3 L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Right rail */}
      <aside
        className="flex flex-col min-h-0"
        style={{ gridArea: "right", borderLeft: "1px solid var(--rule)" }}
      >
        {isDrone ? (
          <div className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--rule)" }}>
            <div className="mono text-[10px] uppercase tracking-[0.16em] text-mute mb-2.5">
              Reference video
            </div>
            <DroneVideoCard
              src={DRONE_VIDEO_SRC}
              title={DRONE_VIDEO_TITLE}
              variant="player"
              onExpand={() => setVideoExpanded(true)}
            />
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
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="text-mute">
                <circle cx="6" cy="6" r="4.5" />
                <path d="M9.2 9.2 L12.5 12.5" />
              </svg>
              <input
                type="text"
                placeholder="Search generations…"
                className="flex-1 bg-transparent border-0 outline-none text-[12px] text-ink placeholder:text-mute"
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-3.5 flex flex-col gap-2.5">
          <HistoryGroupLabel>Today</HistoryGroupLabel>
          {history.map((h) => (
            <HistoryCard key={h.id} item={h} />
          ))}
        </div>

        <div
          className="px-4 py-2.5 flex items-center justify-between mono text-[10px] uppercase tracking-[0.14em] text-mute"
          style={{ borderTop: "1px solid var(--rule)" }}
        >
          <span>{history.length} {history.length === 1 ? "upload" : "uploads"}</span>
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
        style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em" }}
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
          style={{ fontSize: 9.5, color: "var(--mute)", fontWeight: 500, letterSpacing: "0.12em" }}
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

function HistoryGroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mono uppercase pt-1.5 pb-0.5"
      style={{ fontSize: 9.5, color: "var(--mute)", letterSpacing: "0.18em" }}
    >
      {children}
    </div>
  );
}

function HistoryCard({ item }: { item: HistoryItem }) {
  return (
    <div
      className="grid gap-3 p-2 rounded-[10px] transition-all hover:-translate-y-px"
      style={{ gridTemplateColumns: "56px 1fr", border: "1px solid var(--rule)", background: "var(--surface)" }}
    >
      <div
        className="rounded-lg overflow-hidden relative"
        style={{ width: 56, height: 56, background: "var(--surface-2)", border: "1px solid var(--rule)" }}
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <HistoryThumb />
        )}
      </div>
      <div className="flex flex-col justify-center gap-1 min-w-0">
        <div className="text-[12.5px] font-bold text-ink truncate" style={{ letterSpacing: "-0.005em" }}>
          {item.title}
        </div>
        <div
          className="mono flex items-center gap-1.5"
          style={{ fontSize: 9.5, color: "var(--mute)", textTransform: "uppercase", letterSpacing: "0.14em" }}
        >
          <span style={{ color: item.status === "ready" ? "var(--leaf-deep)" : "var(--solar)" }}>
            ● {item.status === "ready" ? "Ready" : "Pending"}
          </span>
          <span>·</span>
          <span>{item.meta}</span>
        </div>
      </div>
    </div>
  );
}

// ---- drone video ----

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
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--rule)", background: "var(--surface)" }}>
      <div
        className={`group relative w-full overflow-hidden${variant === "player" && onExpand ? " cursor-zoom-in" : ""}`}
        style={{ aspectRatio: "16 / 9", background: "var(--surface-2)" }}
        onClick={variant === "player" ? onExpand : undefined}
      >
        {variant === "player" ? (
          <>
            <video src={src} autoPlay muted loop playsInline preload="auto" className="absolute inset-0 w-full h-full object-cover" />
            {onExpand && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onExpand(); }}
                aria-label="Expand reference video"
                className="absolute top-2 right-2 inline-flex items-center justify-center w-7 h-7 rounded-full bg-ink/65 text-paper opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:bg-ink"
              >
                <ExpandIcon />
              </button>
            )}
          </>
        ) : (
          <video src={`${src}#t=0.1`} muted playsInline preload="metadata" className="absolute inset-0 w-full h-full object-cover" />
        )}
      </div>
      <div className="px-3 py-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[13px] font-bold text-ink truncate">{title}</div>
          <div className="mono text-[9.5px] uppercase tracking-[0.14em] text-mute mt-1">REF · DRONE VIDEO</div>
        </div>
        {variant === "loaded" && (
          <span className="mono text-[9.5px] uppercase tracking-[0.14em] whitespace-nowrap" style={{ color: "var(--leaf-deep)" }}>
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
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.stopPropagation(); onClose(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div role="presentation" onClick={onClose} className="fixed inset-0 z-50 grid place-items-center bg-ink/45 backdrop-blur-sm p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ref-video-title"
        onClick={(event) => event.stopPropagation()}
        className="relative rounded-2xl bg-surface w-[92vw] max-w-[860px] overflow-hidden"
        style={{ border: "1px solid var(--rule)", boxShadow: "0 30px 80px -20px rgba(0,0,0,0.35)" }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close reference video"
          className="absolute top-3 right-3 z-10 inline-flex items-center justify-center w-9 h-9 rounded-full bg-ink/65 text-paper transition-colors hover:bg-ink"
        >
          <CloseIcon />
        </button>
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16 / 9", background: "var(--ink)" }}>
          <video src={src} autoPlay muted loop controls playsInline preload="auto" className="absolute inset-0 w-full h-full object-contain" />
        </div>
        <div className="px-6 py-5">
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-leaf-deep mb-2">Reference video</div>
          <h2 id="ref-video-title" className="numeral text-[22px] tracking-[-0.02em] text-ink truncate" style={{ fontWeight: 600 }}>
            {title}
          </h2>
        </div>
      </div>
    </div>
  );
}

function ExpandIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 1 H1 V5 M9 1 H13 V5 M5 13 H1 V9 M9 13 H13 V9" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
      <path d="M4 4 L12 12 M12 4 L4 12" />
    </svg>
  );
}

// ---- art ----

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
      style={{ width: 132, height: 96, border: "1px solid var(--rule)", background: "var(--surface)" }}
    >
      <div
        className="mono"
        style={{ fontSize: 9, color: "var(--mute)", textTransform: "uppercase", letterSpacing: "0.16em" }}
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
    <span className="mono" style={{ color: "var(--dim)", fontSize: 16 }} aria-hidden>
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
