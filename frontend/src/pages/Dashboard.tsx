import { Link } from "react-router-dom";
import { ArrowUpRight, ListChecks, Plus, Stack } from "@/icons";
import { PanelGlyph, PowerGlyph, RinggitGlyph, ClockTicksGlyph } from "@/icons";
import { toast } from "sonner";
import { useProjects, usePortfolioStats } from "@/store/projects-store";
import ProjectRail from "@/components/chrome/ProjectRail";
import HairlineRule from "@/components/chrome/HairlineRule";
import MetricTile from "@/components/metrics/MetricTile";
import ProjectCard from "@/components/data/ProjectCard";
import ActivityFeed from "@/components/data/ActivityFeed";
import IrradianceMap from "@/components/data/IrradianceMap";

export default function Dashboard() {
  const { data: projects = [], isLoading } = useProjects();
  const stats = usePortfolioStats();

  return (
    <div className="flex">
      <ProjectRail />

      <main className="flex-1 min-w-0">
        {/* Hero band — masthead with editorial framing */}
        <section className="relative overflow-hidden">
          <div className="px-8 lg:px-12 pt-10 pb-8 max-w-[1400px]">
            <div className="flex items-baseline justify-between flex-wrap gap-4 mb-6">
              <div>
                <div className="mono text-[10.5px] uppercase tracking-[0.24em] text-leaf-deep mb-2">
                  Workspace · {todayKL()}
                </div>
                <h1 className="text-[42px] md:text-[54px] numeral leading-[0.96] tracking-[-0.035em] text-ink" style={{ fontWeight: 600 }}>
                  Sun on glass,
                  <br />
                  <span className="italic" style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 100" }}>
                    measured in ringgit.
                  </span>
                </h1>
                <p className="mt-3 text-[14px] text-mute max-w-[52ch]">
                  Six rooftop projects across Peninsular Malaysia. Yields modelled on PVGIS TMY,
                  derated for 50&nbsp;°C cell temperature, settled against ATAP NEM 3.0 sell-back.
                </p>
              </div>

              <div />
            </div>

            {/* Hero metrics row */}
            <div
              className="bg-surface rounded-2xl p-7 grid grid-cols-2 lg:grid-cols-4 gap-7"
              style={{ border: "1px solid var(--rule)", boxShadow: "var(--tw-shadow, 0 8px 30px -12px rgba(26,31,28,0.08))" }}
            >
              <MetricTile
                label="Portfolio · installed"
                value={stats.totalKwp}
                decimals={1}
                unit="kWp"
                accent="leaf"
                hint={`${stats.readyProjects} of ${stats.totalProjects} sites`}
                variant="lg"
                delay={120}
              />
              <MetricTile
                label="Annual yield"
                value={stats.totalKwh}
                unit="kWh"
                accent="solar"
                hint="PVGIS TMY · Perez POA"
                variant="lg"
                delay={240}
              />
              <MetricTile
                label="Annual savings"
                value={stats.totalSavings}
                prefix="RM "
                accent="leaf"
                hint="TNB + ATAP NEM"
                variant="lg"
                delay={360}
              />
              <MetricTile
                label="Mean payback"
                value={stats.avgPayback}
                decimals={1}
                unit="years"
                accent="terracotta"
                hint={`@ RM 4,500 / kWp CAPEX`}
                variant="lg"
                delay={480}
              />
            </div>

            {/* Inline glyph caption */}
            <div className="flex items-center gap-3 mt-4 text-[11.5px] mono uppercase tracking-[0.16em] text-mute">
              <span className="inline-flex items-center gap-1.5">
                <PanelGlyph size={13} className="text-leaf-deep" />
                Trina Vertex N · 620 W bifacial
              </span>
              <span className="text-dim">·</span>
              <span className="inline-flex items-center gap-1.5">
                <PowerGlyph size={11} className="text-solar" />
                Sigen hybrid inv · 98.6%
              </span>
              <span className="text-dim">·</span>
              <span className="inline-flex items-center gap-1.5">
                <RinggitGlyph size={12} className="text-leaf-deep" />
                Domestic + Non-Domestic LV
              </span>
              <span className="text-dim">·</span>
              <span className="inline-flex items-center gap-1.5">
                <ClockTicksGlyph size={11} className="text-mute" />
                refreshed {todayKL()}
              </span>
            </div>
          </div>
          {/* decorative band */}
          <div aria-hidden className="absolute right-0 top-8 hidden xl:block opacity-60 pointer-events-none">
            <svg width="360" height="220" viewBox="0 0 360 220">
              <defs>
                <pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
                  <line x1="0" y1="0" x2="0" y2="10" stroke="var(--leaf)" strokeWidth="0.6" strokeOpacity="0.5" />
                </pattern>
              </defs>
              <path
                d="M 30 200 C 80 60, 180 60, 260 110 C 300 130, 330 110, 350 70"
                stroke="var(--leaf)"
                strokeWidth="1.2"
                fill="none"
                strokeDasharray="4 6"
              />
              <circle cx="350" cy="70" r="22" fill="url(#hatch)" stroke="var(--leaf)" strokeWidth="1" />
              <circle cx="350" cy="70" r="6" fill="var(--solar)" />
            </svg>
          </div>
        </section>

        {/* Projects list section */}
        <section className="px-8 lg:px-12 pb-12 max-w-[1400px]">
          <HairlineRule label="Sites in pipeline" className="mb-8" />

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl animate-pulse"
                  style={{ minHeight: 360, background: "var(--surface)", border: "1px solid var(--rule)" }}
                />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <p className="numeral text-[28px] text-ink-2" style={{ fontWeight: 600 }}>No projects yet.</p>
              <p className="text-[13.5px] text-mute max-w-[36ch]">
                Create your first project to see yield estimates and 3D analysis here.
              </p>
              <Link
                to="/app/projects/new"
                className="mt-2 px-5 h-10 inline-flex items-center gap-2 rounded-full text-[13px] font-bold tracking-tight text-paper"
                style={{ background: "var(--ink)" }}
              >
                <Plus weight="bold" size={14} />
                New project
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {projects.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} />
              ))}
              <NewProjectCard index={projects.length} />
            </div>
          )}
        </section>

        {/* Bottom split: activity + irradiance map */}
        <section className="px-8 lg:px-12 pb-16 max-w-[1400px] grid grid-cols-1 xl:grid-cols-5 gap-5">
          <div className="xl:col-span-3">
            <ActivityFeed />
          </div>
          <div className="xl:col-span-2 flex flex-col gap-5">
            <IrradianceMap />
            <RoiCallout />
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}

const NewProjectCard = ({ index }: { index: number }) => (
  <Link
    to="/app/projects/new"
    className="group relative rounded-2xl flex flex-col items-center justify-center gap-3 p-8 animate-riseIn"
    style={{
      border: "1.5px dashed color-mix(in srgb, var(--leaf) 40%, transparent)",
      background: "var(--leaf-tint)",
      animationDelay: `${index * 60}ms`,
      minHeight: 360,
    }}
  >
    <span
      className="w-14 h-14 rounded-full flex items-center justify-center"
      style={{ background: "var(--surface)", boxShadow: "0 0 0 6px color-mix(in srgb, var(--leaf) 18%, transparent)" }}
    >
      <Plus weight="bold" size={22} className="text-leaf-deep" />
    </span>
    <h3 className="text-[15px] font-extrabold text-ink-2 text-center max-w-[24ch] leading-tight">
      Drop drone footage or roof photos
    </h3>
    <p className="mono text-[10.5px] uppercase tracking-[0.18em] text-leaf-deep">DJI · MP4 · ZIP · OBJ</p>
    <span className="mt-2 inline-flex items-center gap-1 text-[11px] mono uppercase tracking-[0.16em] text-leaf-deep">
      Start a new project <ArrowUpRight weight="bold" size={11} />
    </span>
  </Link>
);

const RoiCallout = () => (
  <div className="rounded-2xl p-5" style={{ background: "var(--ink)", color: "var(--paper)" }}>
    <div className="flex items-baseline justify-between mb-2">
      <span className="mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--leaf)" }}>
        ATAP rebate model
      </span>
      <Stack weight="duotone" size={14} style={{ color: "var(--leaf)" }} />
    </div>
    <p className="numeral text-[34px] leading-[1] tab-num" style={{ fontWeight: 600 }}>
      RM 100,640
    </p>
    <p className="text-[12.5px] mt-1" style={{ color: "color-mix(in srgb, var(--paper) 75%, transparent)" }}>
      Aggregate annualised savings if all six sites greenlight by ATAP cycle 7.
    </p>
    <div className="mt-4 grid grid-cols-3 gap-3 mono text-[10px] uppercase tracking-[0.14em]">
      <CalloutStat label="Self-cons." value="62%" />
      <CalloutStat label="Export · SMP" value="RM 0.30" />
      <CalloutStat label="Capex · kWp" value="RM 4,500" />
    </div>
  </div>
);

const CalloutStat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p style={{ color: "color-mix(in srgb, var(--paper) 60%, transparent)" }}>{label}</p>
    <p className="text-[15px] tab-num normal-case tracking-tight" style={{ color: "var(--paper)" }}>{value}</p>
  </div>
);

const Footer = () => (
  <footer className="px-8 lg:px-12 pb-10 max-w-[1400px]">
    <HairlineRule className="mb-4" />
    <div className="flex flex-wrap items-baseline justify-between gap-4 mono text-[10.5px] uppercase tracking-[0.18em] text-mute">
      <span>RexCharge · Solar Layout Studio v1.0</span>
      <span>PVGIS TMY · TNB 2024 · ATAP NEM 3.0</span>
      <span>RExharge × Recharge Xolutions Sdn Bhd</span>
    </div>
  </footer>
);

const todayKL = () => {
  const d = new Date();
  return d.toLocaleDateString("en-MY", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
};
