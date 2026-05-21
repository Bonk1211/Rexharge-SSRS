import { Link } from "react-router-dom";
import { ArrowUpRight, Plus } from "@/icons";
import {
  useProjects,
  usePortfolioStats,
  usePortfolioCharts,
} from "@/store/projects-store";
import MetricTile from "@/components/metrics/MetricTile";
import ActivityFeed from "@/components/data/ActivityFeed";
import PowerCurveCard from "@/components/data/PowerCurveCard";
import YieldVsTargetCard from "@/components/data/YieldVsTargetCard";
import PortfolioGaugesRow from "@/components/data/PortfolioGaugesRow";
import StatusPill from "@/components/chrome/StatusPill";
import type { Project } from "@/data/mock-projects";

export default function Monitoring() {
  const { data: projects = [], isLoading } = useProjects();
  const stats = usePortfolioStats();
  const { powerCurve, monthly, gauges } = usePortfolioCharts();

  return (
    <main className="flex-1 min-w-0 w-full px-8 lg:px-12 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="mono text-[10.5px] uppercase tracking-[0.24em] text-leaf-deep mb-2">
          Monitoring
        </div>
        <h1
          className="numeral text-[36px] tracking-[-0.02em] text-ink"
          style={{ fontWeight: 600 }}
        >
          Active rooftops.
        </h1>
        <p className="mt-2 text-[13.5px] text-mute">
          Live portfolio totals, sites needing attention, and the latest pipeline events.
        </p>
      </div>

      {/* Portfolio tiles */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-7">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl animate-pulse bg-surface"
              style={{
                minHeight: 140,
                border: "1px solid var(--rule)",
              }}
            />
          ))}
        </div>
      ) : (
        <div
          className="bg-surface rounded-2xl p-6 grid grid-cols-2 lg:grid-cols-4 gap-6"
          style={{ border: "1px solid var(--rule)" }}
        >
          <MetricTile
            label="Portfolio · installed"
            value={stats.totalKwp}
            decimals={1}
            unit="kWp"
            accent="leaf"
            hint={`${stats.readyProjects} of ${stats.totalProjects} sites`}
            variant="md"
            delay={120}
          />
          <MetricTile
            label="Annual yield"
            value={stats.totalKwh}
            unit="kWh"
            accent="solar"
            hint="PVGIS TMY · Perez POA"
            variant="md"
            delay={240}
          />
          <MetricTile
            label="Annual savings"
            value={stats.totalSavings}
            prefix="RM "
            accent="leaf"
            hint="TNB + ATAP NEM"
            variant="md"
            delay={360}
          />
          <MetricTile
            label="Mean payback"
            value={stats.avgPayback}
            decimals={1}
            unit="years"
            accent="terracotta"
            hint="@ RM 4,500 / kWp CAPEX"
            variant="md"
            delay={480}
          />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && projects.length === 0 && (
        <div className="mt-10 flex items-center gap-3">
          <p className="text-[13.5px] text-mute">No projects yet —</p>
          <Link
            to="/app/projects/new"
            className="px-4 h-9 inline-flex items-center gap-2 rounded-full text-[12.5px] font-bold tracking-tight text-paper"
            style={{ background: "var(--ink)" }}
          >
            <Plus weight="bold" size={13} /> New project
          </Link>
        </div>
      )}

      {/* Chart row — power curve + monthly yield */}
      {!isLoading && projects.length > 0 && (
        <section className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-5">
          <PowerCurveCard data={powerCurve} />
          <YieldVsTargetCard data={monthly} />
        </section>
      )}

      {/* Gauge row */}
      {!isLoading && projects.length > 0 && (
        <section className="mt-5">
          <PortfolioGaugesRow {...gauges} />
        </section>
      )}

      {/* Two-column section */}
      {!isLoading && projects.length > 0 && (
        <section className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2">
            <SitesNeedingAttention projects={projects} />
          </div>
          <div className="xl:col-span-1">
            <ActivityFeed />
          </div>
        </section>
      )}
    </main>
  );
}

function SitesNeedingAttention({ projects }: { projects: Project[] }) {
  const flagged = projects.filter(
    (p) => p.status === "processing" || p.status === "failed" || p.status === "draft",
  );

  return (
    <div
      className="bg-surface rounded-2xl p-5"
      style={{ border: "1px solid var(--rule)" }}
    >
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-[13px] font-extrabold tracking-tight">
          Sites needing attention
        </h3>
        <span className="mono text-[10px] uppercase tracking-[0.16em] text-mute">
          {flagged.length} {flagged.length === 1 ? "site" : "sites"}
        </span>
      </div>

      {flagged.length === 0 ? (
        <p className="text-[12.5px] text-mute py-6">Every site is in good shape.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {flagged.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-4 rounded-xl px-3 py-3"
              style={{ border: "1px solid var(--rule)", background: "var(--surface-2)" }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[14px] font-bold text-ink truncate">{p.name}</span>
                  <StatusPill status={p.status} size="sm" />
                </div>
                <p className="text-[12px] text-mute truncate">{p.address}</p>
              </div>
              <Link
                to={`/app/projects/${p.id}`}
                className="inline-flex items-center gap-1 mono text-[10.5px] uppercase tracking-[0.18em] text-leaf-deep shrink-0"
              >
                Open
                <ArrowUpRight weight="bold" size={11} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
