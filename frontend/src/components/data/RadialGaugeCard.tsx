import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";

type Accent = "leaf" | "solar" | "terracotta";

interface RadialGaugeCardProps {
  label: string;
  value: number;
  max?: number;
  suffix?: string;
  accent?: Accent;
  hint?: string;
}

const ACCENT_VAR: Record<Accent, string> = {
  leaf: "var(--leaf-deep)",
  solar: "var(--solar)",
  terracotta: "var(--terracotta)",
};

export default function RadialGaugeCard({
  label,
  value,
  max = 1,
  suffix = "%",
  accent = "leaf",
  hint,
}: RadialGaugeCardProps) {
  const clamped = Math.max(0, Math.min(value, max));
  const fraction = max > 0 ? clamped / max : 0;
  const fill = ACCENT_VAR[accent];
  const data = [{ name: label, value: clamped, fill }];
  const endAngle = 90 - fraction * 360;

  return (
    <div
      className="bg-surface rounded-2xl p-5 relative"
      style={{ border: "1px solid var(--rule)" }}
    >
      <div className="mono text-[10px] uppercase tracking-[0.18em] text-mute mb-2">
        {label}
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <RadialBarChart
          innerRadius="70%"
          outerRadius="100%"
          data={data}
          startAngle={90}
          endAngle={endAngle}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, max]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: "var(--rule)" }}
            dataKey="value"
            cornerRadius={8}
            isAnimationActive={false}
          />
        </RadialBarChart>
      </ResponsiveContainer>

      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        style={{ paddingTop: 28 }}
      >
        <span
          className="numeral tab-num text-[28px] leading-none"
          style={{ fontWeight: 600 }}
        >
          {(fraction * 100).toFixed(0)}
          <span className="mono text-[12px] ml-0.5 text-mute">{suffix}</span>
        </span>
        {hint && (
          <span className="mono text-[9.5px] uppercase tracking-[0.16em] text-mute mt-1">
            {hint}
          </span>
        )}
      </div>
    </div>
  );
}
