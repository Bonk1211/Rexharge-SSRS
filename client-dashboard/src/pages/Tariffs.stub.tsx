import HairlineRule from "@/components/chrome/HairlineRule";
import { CheckCircle, Sparkle, WaveSine } from "@/icons";
import { RinggitGlyph } from "@/icons";

const DOMESTIC = [
  { range: "1 – 200 kWh", rate: 0.218, note: "Block A · most residential" },
  { range: "201 – 300 kWh", rate: 0.334, note: "Block B" },
  { range: "301 – 600 kWh", rate: 0.516, note: "Block C · ATAP self-cons. headline" },
  { range: "601 – 900 kWh", rate: 0.546, note: "Block D" },
  { range: "901+ kWh", rate: 0.571, note: "Block E · ICPT-sensitive" },
];

const NON_DOM = [
  { range: "Non-Domestic LV (typical)", rate: 0.435, note: "C1 commercial · low voltage" },
];

export default function Tariffs() {
  return (
    <main className="px-8 lg:px-12 py-10 max-w-[1400px]">
      <div className="mono text-[10.5px] uppercase tracking-[0.24em] text-leaf-deep mb-2">Tariffs</div>
      <h1 className="numeral text-[44px] leading-[1] tracking-[-0.03em] text-ink" style={{ fontWeight: 600 }}>
        TNB blocks &amp; ATAP NEM 3.0.
      </h1>
      <p className="mt-3 text-[14px] text-mute max-w-[58ch]">
        These rates feed every yield-to-RM calculation and the report financial appendix. Lock the
        snapshot date to satisfy ATAP submission audits.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-8">
        <Card title="TNB Domestic · 2024" tag="active">
          <RateTable rows={DOMESTIC} />
        </Card>
        <Card title="TNB Non-Domestic · 2024" tag="active">
          <RateTable rows={NON_DOM} />
          <HairlineRule variant="dashed" className="my-3" />
          <KV k="Maximum demand surcharge" v="not modelled (LV)" />
          <KV k="Power factor penalty" v="0.85 cosφ floor" />
        </Card>
      </div>

      <HairlineRule label="ATAP NEM 3.0" className="my-8" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card title="Self-consumption" tag="default">
          <KV k="Residential default" v="60 %" />
          <KV k="Commercial default" v="80 %" />
          <KV k="Override" v="upload load profile (.csv)" muted />
        </Card>
        <Card title="Export · System Marginal Price" tag="env">
          <KV k="Sell-back rate" v="RM 0.30 / kWh" />
          <KV k="Source" v="MyPower SMP proxy" muted />
          <KV k="Override env var" v="ATAP_SMP_RM" muted mono />
        </Card>
        <Card title="CAPEX assumption" tag="env">
          <KV k="Default" v="RM 4,500 / kWp" />
          <KV k="Inverter share" v="≈ 18 %" muted />
          <KV k="Override env var" v="CAPEX_RM_PER_KWP" muted mono />
        </Card>
      </div>

      <div className="mt-10 rounded-2xl p-5 flex items-center gap-3" style={{ background: "var(--mint-tint)" }}>
        <WaveSine weight="duotone" size={16} className="text-ink-blue" />
        <p className="text-[12.5px] text-ink-2">
          <span className="font-bold text-ink">Tariff snapshot dated</span> 14 Mar 2024 ·
          all generated PDFs cite this date in the assumptions appendix.
        </p>
      </div>
    </main>
  );
}

const Card = ({ title, tag, children }: { title: string; tag: string; children: React.ReactNode }) => (
  <div className="bg-surface rounded-2xl p-5" style={{ border: "1px solid var(--rule)" }}>
    <div className="flex items-baseline justify-between mb-3">
      <h3 className="text-[13px] font-extrabold tracking-tight">{title}</h3>
      <span className="mono text-[9.5px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full" style={{ background: "var(--leaf-tint)", color: "var(--leaf-deep)" }}>
        {tag}
      </span>
    </div>
    {children}
  </div>
);

const RateTable = ({ rows }: { rows: Array<{ range: string; rate: number; note: string }> }) => (
  <ul>
    {rows.map((r, i) => (
      <li
        key={i}
        className="grid grid-cols-[1fr_auto] items-baseline gap-3 py-2"
        style={{ borderBottom: i === rows.length - 1 ? "none" : "1px dashed var(--rule)" }}
      >
        <div>
          <p className="text-[12.5px] font-bold text-ink">{r.range}</p>
          <p className="mono text-[10px] uppercase tracking-[0.14em] text-mute">{r.note}</p>
        </div>
        <div className="flex items-baseline gap-1">
          <RinggitGlyph size={12} className="text-leaf-deep" />
          <span className="numeral tab-num text-[20px] leading-none" style={{ fontWeight: 600 }}>
            {r.rate.toFixed(3)}
          </span>
          <span className="mono text-[10px] uppercase tracking-[0.16em] text-mute">/ kWh</span>
        </div>
      </li>
    ))}
  </ul>
);

const KV = ({
  k,
  v,
  muted,
  mono,
}: {
  k: string;
  v: string;
  muted?: boolean;
  mono?: boolean;
}) => (
  <div
    className="grid grid-cols-[1fr_auto] items-baseline gap-3 py-2"
    style={{ borderBottom: "1px dashed var(--rule)" }}
  >
    <p className="flex items-center gap-1.5 text-[12.5px] font-bold text-ink">
      {!muted && <CheckCircle weight="fill" size={11} className="text-leaf" />}
      <Sparkle aria-hidden weight="duotone" size={muted ? 11 : 0} className={muted ? "text-mute" : ""} />
      {k}
    </p>
    <p className={`tab-num text-[12.5px] ${mono ? "mono text-ink" : "text-ink-2"}`}>{v}</p>
  </div>
);
