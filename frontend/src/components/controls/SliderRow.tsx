import { useId } from "react";

/* Range slider with mono numeric readout, hairline track, leaf-green fill.
 * Fully accessible (uses native input[type=range]). */

export default function SliderRow({
  label,
  unit,
  value,
  min,
  max,
  step,
  onChange,
  marks,
  caption,
}: {
  label: string;
  unit?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  marks?: number[];
  caption?: string;
}) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="mono text-[10px] uppercase tracking-[0.18em] text-mute">
          {label}
        </label>
        <div className="flex items-baseline gap-1">
          <span className="numeral tab-num text-[18px] leading-none text-ink" style={{ fontWeight: 600 }}>
            {value.toLocaleString("en-MY", {
              minimumFractionDigits: step < 1 ? 2 : 0,
              maximumFractionDigits: step < 1 ? 2 : 0,
            })}
          </span>
          {unit && (
            <span className="mono text-[10px] uppercase tracking-[0.16em] text-mute">{unit}</span>
          )}
        </div>
      </div>

      <div className="relative h-5 flex items-center">
        <span
          aria-hidden
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] rounded-full"
          style={{ background: "var(--rule)" }}
        />
        <span
          aria-hidden
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] rounded-full transition-[width]"
          style={{ background: "var(--leaf)", width: `${pct}%` }}
        />
        {marks?.map((m) => {
          const mPct = ((m - min) / (max - min)) * 100;
          return (
            <span
              key={m}
              aria-hidden
              className="absolute top-1/2 -translate-y-1/2 w-[2px] h-2 rounded-sm"
              style={{ left: `calc(${mPct}% - 1px)`, background: "var(--mute)", opacity: 0.4 }}
            />
          );
        })}
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full appearance-none bg-transparent cursor-pointer"
          style={{ height: "20px" }}
        />
        <span
          aria-hidden
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full pointer-events-none transition-[left]"
          style={{
            left: `calc(${pct}% - 7px)`,
            background: "var(--surface)",
            border: "2px solid var(--leaf-deep)",
            boxShadow: "0 2px 6px rgba(26,31,28,0.18)",
          }}
        />
      </div>

      {caption && (
        <p className="mono text-[9.5px] uppercase tracking-[0.14em] text-mute">{caption}</p>
      )}
    </div>
  );
}
