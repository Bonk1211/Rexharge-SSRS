import { cn } from "@/lib/cn";
import CountUp from "./CountUp";

/* MetricTile — Fraunces serif numeral hero, mono micro-label,
 * hairline rule, optional accent dot. Variants govern density. */

type Variant = "lg" | "md" | "sm";

export default function MetricTile({
  label,
  value,
  decimals = 0,
  prefix,
  suffix,
  unit,
  trend,
  hint,
  delay = 0,
  variant = "md",
  accent,
  className,
}: {
  label: string;
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  unit?: string;
  trend?: { value: string; direction: "up" | "down" | "flat" };
  hint?: string;
  delay?: number;
  variant?: Variant;
  accent?: "leaf" | "solar" | "terracotta" | "ink-blue";
  className?: string;
}) {
  const sizes = {
    lg: { num: "text-[64px] leading-[0.95]", lbl: "text-[10.5px]", row: "gap-3" },
    md: { num: "text-[44px] leading-[0.95]", lbl: "text-[10px]", row: "gap-2" },
    sm: { num: "text-[26px] leading-none", lbl: "text-[9.5px]", row: "gap-1.5" },
  }[variant];

  const accentColor = accent
    ? `var(--${accent === "ink-blue" ? "ink-blue" : accent})`
    : "var(--leaf-deep)";

  return (
    <div className={cn("flex flex-col", sizes.row, className)}>
      <div className="flex items-baseline justify-between">
        <span className={cn("mono uppercase tracking-[0.18em] text-mute", sizes.lbl)}>{label}</span>
        {accent && (
          <span aria-hidden className="w-1.5 h-1.5 rounded-full" style={{ background: accentColor }} />
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <CountUp
          value={value}
          decimals={decimals}
          delay={delay}
          prefix={prefix}
          suffix={suffix}
          className={cn("numeral text-ink tab-num", sizes.num)}
        />
        {unit && (
          <span className="mono text-[11px] uppercase tracking-[0.16em] text-mute pb-1">{unit}</span>
        )}
      </div>
      {(hint || trend) && (
        <div className="flex items-center gap-2 mono text-[10px] uppercase tracking-[0.14em]">
          {trend && (
            <span
              className="inline-flex items-center gap-0.5"
              style={{
                color:
                  trend.direction === "up"
                    ? "var(--leaf-deep)"
                    : trend.direction === "down"
                    ? "var(--crimson)"
                    : "var(--mute)",
              }}
            >
              {trend.direction === "up" ? "▲" : trend.direction === "down" ? "▼" : "—"} {trend.value}
            </span>
          )}
          {hint && <span className="text-mute">{hint}</span>}
        </div>
      )}
    </div>
  );
}
