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
    <main className="flex-1 min-w-0 w-full px-8 lg:px-12 py-6">
      {/* Header */}
      <div className="mb-5 flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <div className="mono text-[10px] uppercase tracking-[0.24em] text-leaf-deep">
            Monitoring
          </div>
          <h1
            className="numeral text-[26px] tracking-[-0.02em] text-ink leading-tight"
            style={{ fontWeight: 600 }}
          >
            Active rooftops.
          </h1>
        </div>
        <span className="mono text-[10.5px] uppercase tracking-[0.18em] text-mute">
          {projects.length} {projects.length === 1 ? "site" : "sites"} · live
        </span>
      </div>

      {/* Portfolio tiles */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl animate-pulse bg-surface"
              style={{ minHeight: 96, border: "1px solid var(--rule)" }}
            />
          ))}
        </div>
      ) : (
        <div
          className="bg-surface rounded-xl p-4 grid grid-cols-2 lg:grid-cols-4 gap-4"
          style={{ border: "1px solid var(--rule)" }}
        >
          <MetricTile
            label="Installed"
            value={stats.totalKwp}
            decimals={1}
            unit="kWp"
            accent="leaf"
            hint={`${stats.readyProjects}/${stats.totalProjects} ready`}
            variant="sm"
            delay={80}
          />
          <MetricTile
            label="Annual yield"
            value={stats.totalKwh}
            unit="kWh"
            accent="solar"
            hint="PVGIS TMY"
            variant="sm"
            delay={160}
          />
          <MetricTile
            label="Annual savings"
            value={stats.totalSavings}
            prefix="RM "
            accent="leaf"
            hint="TNB + NEM"
            variant="sm"
            delay={240}
          />
          <MetricTile
            label="Mean payback"
            value={stats.avgPayback}
            decimals={1}
            unit="yr"
            accent="terracotta"
            hint="@ RM 4.5k/kWp"
            variant="sm"
            delay={320}
          />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && projects.length === 0 && (
        <div className="mt-6 flex items-center gap-3">
          <p className="text-[13px] text-mute">No projects yet —</p>
          <Link
            to="/app/projects/new"
            className="px-3.5 h-8 inline-flex items-center gap-2 rounded-full text-[12px] font-bold tracking-tight text-paper"
            style={{ background: "var(--ink)" }}
          >
            <Plus weight="bold" size={12} /> New project
          </Link>
        </div>
      )}

      {/* Chart row */}
      {!isLoading && projects.length > 0 && (
        <section className="mt-5 grid grid-cols-1 xl:grid-cols-2 gap-4">
          <PowerCurveCard data={powerCurve} />
          <YieldVsTargetCard data={monthly} />
        </section>
      )}

      {/* Gauge row */}
      {!isLoading && projects.length > 0 && (
        <section className="mt-4">
          <PortfolioGaugesRow {...gauges} />
        </section>
      )}

      {/* Attention + activity */}
      {!isLoading && projects.length > 0 && (
        <section className="mt-5 grid grid-cols-1 xl:grid-cols-3 gap-4">
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
      className="bg-surface rounded-xl p-4"
      style={{ border: "1px solid var(--rule)" }}
    >
      <div className="flex items-baseline justify-between mb-2.5">
        <h3 className="text-[12.5px] font-extrabold tracking-tight">
          Sites needing attention
        </h3>
        <span className="mono text-[10px] uppercase tracking-[0.16em] text-mute">
          {flagged.length}
        </span>
      </div>

      {flagged.length === 0 ? (
        <p className="text-[12px] text-mute py-3">Every site is in good shape.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {flagged.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-lg px-3 py-2"
              style={{ border: "1px solid var(--rule)", background: "var(--surface-2)" }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-ink truncate">{p.name}</span>
                  <StatusPill status={p.status} size="sm" />
                </div>
                <p className="text-[11.5px] text-mute truncate mt-0.5">{p.address}</p>
              </div>
              <Link
                to={`/app/projects/${p.id}`}
                className="inline-flex items-center gap-1 mono text-[10px] uppercase tracking-[0.18em] text-leaf-deep shrink-0"
              >
                Open
                <ArrowUpRight weight="bold" size={10} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
