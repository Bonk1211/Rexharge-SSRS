import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowUpRight } from "@/icons";
import { useProject, useSignedUrl } from "@/store/projects-store";
import HairlineRule from "@/components/chrome/HairlineRule";
import StatusPill from "@/components/chrome/StatusPill";
import SectionTabs from "@/components/chrome/SectionTabs";
import ExportedSceneViewer from "@/components/viewer/ExportedSceneViewer";
import MeshViewer from "@/components/viewer/MeshViewer";
import SunPathScrubber from "@/components/viewer/SunPathScrubber";
import MetricStack from "@/components/metrics/MetricStack";
import ProjectDashboard from "@/components/data/ProjectDashboard";
import { loadProjectReport, type ProjectReport } from "@/data/project-reports";

const SECTIONS = [
  { id: "sec-layout", label: "Layout", caption: "viewer · panels" },
  { id: "sec-dashboard", label: "Dashboard", caption: "system · live · finance" },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: project, isLoading } = useProject(id ?? '');
  const { data: glbUrl } = useSignedUrl(
    project?.modelGlbPath ? 'project-models' : undefined,
    project?.modelGlbPath ?? undefined,
  );

  const [report, setReport] = useState<ProjectReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    if (!project?.reportId) return;
    let cancelled = false;
    setReport(null);
    setReportLoading(true);
    loadProjectReport(project.reportId).then((loadedReport) => {
      if (cancelled) return;
      setReport(loadedReport);
      setReportLoading(false);
    });
    return () => { cancelled = true; };
  }, [project?.reportId]);

  if (isLoading || !project) {
    return (
      <main className="flex-1 min-w-0 w-full px-8 lg:px-12 flex items-center justify-center" style={{ minHeight: "60vh" }}>
        {isLoading
          ? <span className="mono text-[11px] uppercase tracking-[0.18em] text-mute animate-pulse">Loading…</span>
          : <span className="mono text-[11px] uppercase tracking-[0.18em] text-mute">Project not found.</span>
        }
      </main>
    );
  }

  return (
    <main className="flex-1 min-w-0 w-full px-8 lg:px-12">
      {/* Page header */}
      <header className="pt-8 pb-5 flex items-start justify-between gap-6 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => navigate("/app/clients")}
              className="mono text-[10px] uppercase tracking-[0.18em] text-mute hover:text-ink"
            >
              ← Clients
            </button>
            <span className="text-dim">/</span>
            <span className="mono text-[10px] uppercase tracking-[0.18em] text-mute">{project.id}</span>
            <StatusPill status={project.status} size="sm" />
          </div>
          <h1
            className="numeral text-[36px] md:text-[44px] leading-[0.98] tracking-[-0.03em] text-ink"
            style={{ fontWeight: 600 }}
          >
            {project.name}
          </h1>
          <p className="mt-2 text-[13px] text-mute">
            {project.address} · lat {project.lat.toFixed(4)}, lon {project.lon.toFixed(4)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={__SIMULATOR_URL__}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 h-10 inline-flex items-center gap-2 rounded-full text-[12px] font-bold text-paper"
            style={{ background: "var(--ink)" }}
          >
            <ArrowUpRight weight="duotone" size={14} />
            Open in simulator
          </a>
        </div>
      </header>

      <SectionTabs sections={SECTIONS} />

      <div className="py-8">
        {/* SECTION 1 — Layout */}
        <section id="sec-layout" className="scroll-mt-32 mb-12">
          <SectionHeader index="01" title="Layout" subtitle="Reconstructed mesh + greedy panel pack + sun-path." />
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_var(--right-width)] gap-5">
            <div className="flex flex-col gap-4 min-w-0">
              {glbUrl ? (
                <MeshViewer lat={project.lat} lon={project.lon} glbUrl={glbUrl} />
              ) : report ? (
                <ExportedSceneViewer report={report} />
              ) : reportLoading ? (
                <ReportViewerSkeleton />
              ) : (
                <MeshViewer lat={project.lat} lon={project.lon} />
              )}
              <div className="flex justify-center">
                <SunPathScrubber />
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <MetricStack
                kwp={project.kwp}
                kwh={project.annualKwh}
                savings={project.annualSavingsRm}
                payback={project.paybackYears}
                panels={project.panels}
                capacityFactor={project.capacityFactor}
              />
            </div>
          </div>
        </section>

        {/* SECTION 2 — Dashboard */}
        <section id="sec-dashboard" className="scroll-mt-32 mb-12">
          <SectionHeader index="02" title="Dashboard" subtitle="System summary · real-time · environmental · loss · inverter · finance." />
          <ProjectDashboard project={project} />
        </section>

        <HairlineRule className="mt-16" />
        <p className="mt-4 mono text-[10px] uppercase tracking-[0.18em] text-mute">
          RexCharge SLS v1.0 · pvlib + PVGIS TMY · ATAP NEM 3.0
        </p>
      </div>
    </main>
  );
}

const SectionHeader = ({
  index,
  title,
  subtitle,
}: {
  index: string;
  title: string;
  subtitle: string;
}) => (
  <div className="flex items-baseline gap-4 mb-5">
    <span className="mono text-[11px] tab-num uppercase tracking-[0.22em] text-leaf-deep">{index}</span>
    <span aria-hidden className="hairline flex-1" />
    <div className="flex items-baseline gap-3">
      <h2 className="numeral text-[22px] tracking-[-0.02em] text-ink" style={{ fontWeight: 600 }}>
        {title}
      </h2>
      <span className="mono text-[10.5px] uppercase tracking-[0.16em] text-mute">{subtitle}</span>
    </div>
  </div>
);

const ReportViewerSkeleton = () => (
  <div
    className="relative overflow-hidden rounded-2xl bg-blueprint"
    style={{ border: "1px solid var(--rule)", aspectRatio: "16/9", minHeight: 520 }}
  >
    <div className="absolute inset-0 grid place-items-center">
      <div
        className="rounded-full bg-surface px-4 py-2 text-[12px] font-bold text-ink shadow-soft"
        style={{ border: "1px solid var(--rule)" }}
      >
        Loading project model
      </div>
    </div>
  </div>
);
