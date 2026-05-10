import { useViewerStore } from "@/store/viewer-store";
import { Sun } from "@/icons";

/* Hour-of-day scrubber. 6.0 → 19.0 in 0.25 increments.
 * Visualised as a curved arc with a draggable knob. */

const HOUR_MIN = 6;
const HOUR_MAX = 19;

export default function SunPathScrubber() {
  const hour = useViewerStore((s) => s.hour);
  const setHour = useViewerStore((s) => s.setHour);

  const t = (hour - HOUR_MIN) / (HOUR_MAX - HOUR_MIN);
  const knobX = 16 + t * (640 - 32);
  const knobY = 26 - Math.sin(Math.PI * t) * 18;

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 640;
    const ratio = Math.max(0, Math.min(1, (px - 16) / (640 - 32)));
    setHour(HOUR_MIN + ratio * (HOUR_MAX - HOUR_MIN));
  };

  return (
    <div
      className="bg-surface/90 backdrop-blur rounded-xl px-4 py-3 flex items-center gap-4"
      style={{ border: "1px solid var(--rule)", minWidth: 720 }}
    >
      <div className="flex flex-col">
        <span className="mono text-[9.5px] uppercase tracking-[0.18em] text-mute">Solar hour</span>
        <span className="numeral text-[28px] tab-num leading-none text-ink" style={{ fontWeight: 600 }}>
          {hour.toFixed(2).replace(".", ":").padStart(5, "0")}
        </span>
        <span className="mono text-[9.5px] uppercase tracking-[0.16em] text-leaf-deep mt-0.5">
          {hourLabel(hour)}
        </span>
      </div>

      <div className="flex-1 relative">
        <svg
          viewBox="0 0 640 56"
          className="w-full h-12 cursor-pointer cursor-crosshair-leaf"
          onClick={handleClick}
        >
          {/* baseline */}
          <line x1="16" y1="44" x2="624" y2="44" stroke="var(--rule)" strokeWidth="1" />

          {/* arc */}
          <path
            d="M 16 44 Q 320 -16 624 44"
            fill="none"
            stroke="var(--solar)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* hour ticks */}
          {Array.from({ length: HOUR_MAX - HOUR_MIN + 1 }).map((_, i) => {
            const ht = HOUR_MIN + i;
            const tt = i / (HOUR_MAX - HOUR_MIN);
            const x = 16 + tt * (640 - 32);
            return (
              <g key={i}>
                <line x1={x} x2={x} y1="44" y2="49" stroke="var(--mute)" strokeWidth="0.8" />
                {ht % 3 === 0 && (
                  <text
                    x={x}
                    y="56"
                    textAnchor="middle"
                    fontSize="8"
                    fontFamily="JetBrains Mono Variable, monospace"
                    fill="var(--mute)"
                  >
                    {ht.toString().padStart(2, "0")}
                  </text>
                )}
              </g>
            );
          })}

          {/* knob */}
          <circle cx={knobX} cy={knobY} r="9" fill="var(--solar)" stroke="var(--ink)" strokeWidth="1" />
          <line
            x1={knobX}
            y1={knobY + 4}
            x2={knobX}
            y2={44}
            stroke="var(--ink)"
            strokeWidth="0.8"
            strokeDasharray="2 2"
          />
        </svg>
      </div>

      <div className="flex flex-col items-end">
        <span className="mono text-[9.5px] uppercase tracking-[0.18em] text-mute">Elevation</span>
        <span className="numeral text-[22px] tab-num leading-none" style={{ fontWeight: 600 }}>
          {sunElevation(hour).toFixed(0)}°
        </span>
        <span className="mono text-[9.5px] uppercase tracking-[0.16em] text-mute mt-0.5">
          azim {sunAzimuth(hour).toFixed(0)}°
        </span>
      </div>

      <button
        onClick={() => setHour(12.5)}
        className="ml-1 w-9 h-9 rounded-full flex items-center justify-center"
        style={{ background: "var(--surface-2)", color: "var(--ink-2)" }}
        aria-label="Reset to noon"
      >
        <Sun weight="duotone" size={15} />
      </button>
    </div>
  );
}

const sunElevation = (hour: number) => {
  const t = (hour - 6) / 12;
  return Math.max(0, Math.sin(Math.PI * t) * 80);
};
const sunAzimuth = (hour: number) => 90 + (hour - 6) * 15; // E at 6 → 90, W at 18 → 270
const hourLabel = (h: number) => {
  if (h < 7.5) return "sunrise";
  if (h < 11) return "morning";
  if (h < 13.5) return "solar noon";
  if (h < 17) return "afternoon";
  if (h < 18.5) return "golden hr";
  return "sunset";
};
