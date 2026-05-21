import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthPoint } from "@/lib/dashboard-series";

const MONO = "JetBrains Mono Variable, monospace";

interface StackPayloadItem {
  dataKey?: string | number;
  value: number;
}

interface StackTooltipProps {
  active?: boolean;
  payload?: StackPayloadItem[];
  label?: string;
}

function StackTooltip({ active, payload, label }: StackTooltipProps) {
  if (!active || !payload?.length) return null;
  const actual =
    payload.find((p) => p.dataKey === "actual")?.value ?? 0;
  const gap = payload.find((p) => p.dataKey === "gap")?.value ?? 0;
  const target = actual + gap;
  return (
    <div
      className="bg-paper rounded-md px-2.5 py-1.5 mono text-[10.5px] flex flex-col gap-0.5"
      style={{ border: "1px solid var(--rule)" }}
    >
      <span className="font-bold uppercase tracking-[0.16em] text-[9.5px]">{label}</span>
      <span style={{ color: "var(--leaf-deep)" }}>
        actual · {actual.toLocaleString("en-MY")} kWh
      </span>
      <span className="text-mute">target · {target.toLocaleString("en-MY")} kWh</span>
    </div>
  );
}

export default function YieldVsTargetCard({ data }: { data: MonthPoint[] }) {
  const annualActual = data.reduce((s, d) => s + d.actual, 0);

  return (
    <div
      className="bg-surface rounded-2xl p-5"
      style={{ border: "1px solid var(--rule)" }}
    >
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <h3 className="text-[13px] font-extrabold tracking-tight">
            Monthly yield vs target
          </h3>
          <p className="mono text-[10px] uppercase tracking-[0.16em] text-mute mt-0.5">
            Aggregate kWh · 12 mo
          </p>
        </div>
        <div className="text-right">
          <p
            className="numeral text-[22px] tab-num leading-none"
            style={{ fontWeight: 600 }}
          >
            {annualActual.toLocaleString("en-MY")}
          </p>
          <p className="mono text-[10px] uppercase tracking-[0.14em] text-mute">
            annual kWh
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
          <CartesianGrid
            stroke="var(--rule)"
            strokeDasharray="2 4"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 9, fontFamily: MONO, fill: "var(--mute)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 9, fontFamily: MONO, fill: "var(--mute)" }}
            axisLine={false}
            tickLine={false}
            width={36}
            tickFormatter={(v: number) =>
              v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
            }
          />
          <Tooltip
            cursor={{ fill: "var(--rule)", opacity: 0.4 }}
            content={<StackTooltip />}
          />
          <Bar
            dataKey="actual"
            stackId="m"
            fill="var(--leaf)"
            isAnimationActive={false}
          />
          <Bar
            dataKey="gap"
            stackId="m"
            fill="var(--mint)"
            radius={[3, 3, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
