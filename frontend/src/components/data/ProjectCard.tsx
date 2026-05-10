import { Link } from "react-router-dom";
import { ArrowUpRight, MapPin } from "@/icons";
import type { Project } from "@/data/mock-projects";
import StatusPill from "@/components/chrome/StatusPill";
import { fmtKWh, fmtKWp, fmtRM, fmtRelTime, fmtYears } from "@/lib/format";
import Sparkline from "./Sparkline";

/* ProjectCard — gallery tile.
 * Diagonal flow: thumbnail block (left) → metric stack (right).
 * Status pill anchors top-right; intake mode + capture time as mono caption. */

const intakeLabel: Record<string, string> = {
  drone_terra: "Drone · DJI Terra",
  drone_video: "Drone · video",
  photos: "Photos",
  demo: "Demo · cached",
};

export default function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const isPending = project.status !== "ready";
  return (
    <Link
      to={`/projects/${project.id}/analysis`}
      className="group relative bg-surface rounded-2xl overflow-hidden flex flex-col animate-riseIn"
      style={{
        border: "1px solid var(--rule)",
        animationDelay: `${index * 60}ms`,
      }}
    >
      {/* Thumbnail */}
      <div
        className="relative aspect-[16/9] overflow-hidden"
        style={{
          background: `linear-gradient(135deg, hsl(${project.thumbnailHue} 38% 88%), hsl(${project.thumbnailHue} 22% 70%))`,
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <ThumbArtwork hue={project.thumbnailHue} />
        <div className="absolute top-3 right-3">
          <StatusPill status={project.status} />
        </div>
        <div className="absolute bottom-3 left-3 mono text-[10px] uppercase tracking-[0.16em] text-ink/70">
          {intakeLabel[project.intakeMode] ?? project.intakeMode}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[15.5px] font-extrabold text-ink leading-tight tracking-[-0.01em]">
              {project.name}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-mute text-[11.5px]">
              <MapPin weight="duotone" size={11} />
              <span className="truncate">{project.address}</span>
            </div>
          </div>
          <ArrowUpRight
            weight="bold"
            size={18}
            className="shrink-0 text-mute group-hover:text-ink transition-colors translate-y-0.5"
          />
        </div>

        {/* Stats row OR pending caption */}
        {isPending ? (
          <div
            className="rounded-lg p-3 mono text-[10.5px] uppercase tracking-[0.16em]"
            style={{
              background: project.status === "failed" ? "color-mix(in srgb, var(--terracotta) 10%, transparent)" : "var(--mint-tint)",
              color: project.status === "failed" ? "var(--crimson)" : "var(--ink-blue)",
              border: "1px dashed var(--rule)",
            }}
          >
            {project.status === "processing"
              ? "Photogrammetry in progress · ETA ~6 min"
              : project.status === "failed"
              ? "Reconstruction failed · re-upload needed"
              : "Draft — awaiting calibration"}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 pt-3 border-t" style={{ borderColor: "var(--rule)" }}>
              <Stat label="kWp" value={fmtKWp(project.kwp)} unit="installed" />
              <Stat label="kWh / yr" value={fmtKWh(project.annualKwh)} unit={`${project.panels} panels`} />
              <Stat label="Saving" value={fmtRM(project.annualSavingsRm, { compact: true })} unit={fmtYears(project.paybackYears) + " payback"} />
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t" style={{ borderColor: "var(--rule)" }}>
              <Sparkline data={project.monthlyKwh} width={140} height={28} />
              <span className="mono text-[10px] text-mute uppercase tracking-[0.14em]">
                {fmtRelTime(project.capturedAt)}
              </span>
            </div>
          </>
        )}
      </div>
    </Link>
  );
}

const Stat = ({ label, value, unit }: { label: string; value: string; unit?: string }) => (
  <div className="flex flex-col gap-0.5">
    <span className="mono text-[9.5px] uppercase tracking-[0.18em] text-mute">{label}</span>
    <span className="numeral text-[20px] text-ink leading-none tab-num" style={{ fontWeight: 600 }}>
      {value}
    </span>
    {unit && (
      <span className="mono text-[9.5px] uppercase tracking-[0.14em] text-mute mt-0.5">{unit}</span>
    )}
  </div>
);

/* Schematic rooftop artwork — generated from the project hue.
 * Three diagonal stripes, a small pin, dotted contour. Engineering-blueprint feel. */
const ThumbArtwork = ({ hue }: { hue: number }) => (
  <svg
    aria-hidden
    viewBox="0 0 320 180"
    className="absolute inset-0 w-full h-full"
    preserveAspectRatio="none"
  >
    <defs>
      <pattern id={`g-${hue}`} width="14" height="14" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="14" stroke={`hsl(${hue} 30% 32% / 0.18)`} strokeWidth="0.5" />
        <line x1="0" y1="0" x2="14" y2="0" stroke={`hsl(${hue} 30% 32% / 0.18)`} strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="320" height="180" fill={`url(#g-${hue})`} />
    <polygon
      points="80,30 280,40 270,150 60,140"
      fill={`hsl(${hue} 35% 55% / 0.85)`}
      stroke={`hsl(${hue} 38% 30%)`}
      strokeWidth="1.4"
    />
    <polygon
      points="80,30 280,40 180,80"
      fill={`hsl(${hue} 35% 70%)`}
      stroke={`hsl(${hue} 38% 30%)`}
      strokeWidth="1"
      strokeDasharray="2 3"
    />
    {/* Panels grid */}
    <g stroke={`hsl(${hue} 40% 22%)`} strokeWidth="0.8" fill={`hsl(${hue} 30% 38% / 0.6)`}>
      {Array.from({ length: 4 }).map((_, r) =>
        Array.from({ length: 6 }).map((_, c) => (
          <rect key={`${r}-${c}`} x={100 + c * 28} y={88 + r * 14} width={24} height={11} />
        )),
      )}
    </g>
    {/* North arrow */}
    <g transform="translate(296,28)">
      <circle r="12" fill="white" stroke={`hsl(${hue} 40% 28%)`} strokeWidth="1" />
      <polygon points="0,-7 3,5 0,2 -3,5" fill={`hsl(${hue} 40% 28%)`} />
      <text y="-13" textAnchor="middle" fontSize="6" fill={`hsl(${hue} 40% 28%)`} fontFamily="Mulish">
        N
      </text>
    </g>
  </svg>
);
