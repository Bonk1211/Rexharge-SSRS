import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { HourPoint } from "@/lib/dashboard-series";

const MONO = "JetBrains Mono Variable, monospace";

interface TooltipPayload {
  value: number;
}

interface MonoTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: number | string;
  unit: string;
}

function MonoTooltip({ active, payload, label, unit }: MonoTooltipProps) {
  if (!active || !payload?.[0]) return null;
  return (
    <div
      className="bg-paper rounded-md px-2.5 py-1.5 mono text-[10.5px]"
      style={{ border: "1px solid var(--rule)" }}
    >
      {label}h · {Number(payload[0].value).toFixed(1)} {unit}
    </div>
  );
}

export default function PowerCurveCard({ data }: { data: HourPoint[] }) {
  const peak = data.reduce((m, d) => (d.kw > m ? d.kw : m), 0);

  return (
    <div
      className="bg-surface rounded-2xl p-5"
      style={{ border: "1px solid var(--rule)" }}
    >
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <h3 className="text-[13px] font-extrabold tracking-tight">
            Today · power curve
          </h3>
          <p className="mono text-[10px] uppercase tracking-[0.16em] text-mute mt-0.5">
            Aggregate kW · PVGIS clear-sky
          </p>
        </div>
        <div className="text-right">
          <p
            className="numeral text-[22px] tab-num leading-none"
            style={{ fontWeight: 600 }}
          >
            {peak.toFixed(1)}
          </p>
          <p className="mono text-[10px] uppercase tracking-[0.14em] text-mute">
            peak kW
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="leafFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--leaf)" stopOpacity={0.55} />
              <stop offset="100%" stopColor="var(--leaf)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="var(--rule)"
            strokeDasharray="2 4"
            vertical={false}
          />
          <XAxis
            dataKey="hour"
            tickFormatter={(h: number) => `${h}h`}
            tick={{ fontSize: 9, fontFamily: MONO, fill: "var(--mute)" }}
            axisLine={false}
            tickLine={false}
            interval={2}
          />
          <YAxis
            tick={{ fontSize: 9, fontFamily: MONO, fill: "var(--mute)" }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip
            cursor={{ stroke: "var(--rule)", strokeDasharray: "2 4" }}
            content={<MonoTooltip unit="kW" />}
          />
          <Area
            type="monotone"
            dataKey="kw"
            stroke="var(--leaf-deep)"
            strokeWidth={1.5}
            fill="url(#leafFade)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
