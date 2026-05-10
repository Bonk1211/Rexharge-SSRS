import { Link, useParams } from "react-router-dom";
import ProjectRail from "@/components/chrome/ProjectRail";
import { findProject } from "@/data/mock-projects";
import { Download } from "@/icons";
import { fmtKWh, fmtKWp, fmtRM, fmtYears } from "@/lib/format";

export default function Report() {
  const { id } = useParams();
  const project = findProject(id);

  return (
    <div className="flex">
      <ProjectRail />
      <main className="flex-1 px-12 py-10 max-w-[1100px]">
        <div className="mono text-[10.5px] uppercase tracking-[0.24em] text-leaf-deep mb-2">
          Engineering report · 8 pp · WeasyPrint draft
        </div>

        <div
          className="bg-surface rounded-2xl p-10 mt-4"
          style={{ border: "1px solid var(--rule)", boxShadow: "0 24px 64px -32px rgba(26,31,28,0.24)" }}
        >
          <div className="flex items-baseline justify-between mb-6">
            <span className="mono text-[10.5px] uppercase tracking-[0.18em] text-mute">
              RexCharge SLS · Cover sheet
            </span>
            <span className="mono text-[10.5px] uppercase tracking-[0.18em] text-leaf-deep">{project.id}</span>
          </div>
          <h1
            className="numeral text-[52px] leading-[0.96] tracking-[-0.035em]"
            style={{ fontWeight: 600 }}
          >
            {project.name}
          </h1>
          <p className="mt-2 text-[14px] text-mute">{project.address}</p>

          <div className="mt-10 grid grid-cols-4 gap-6">
            <Cell k="Installed" v={`${fmtKWp(project.kwp)} kWp`} />
            <Cell k="Annual yield" v={`${fmtKWh(project.annualKwh)} kWh`} />
            <Cell k="Annual savings" v={fmtRM(project.annualSavingsRm)} />
            <Cell k="Payback" v={fmtYears(project.paybackYears)} />
          </div>

          <div className="mt-10 mono text-[10.5px] uppercase tracking-[0.18em] text-mute">
            Stub preview · v1 ships full WeasyPrint render w/ Playwright snapshots of the 3D viewer.
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            className="px-4 h-10 inline-flex items-center gap-2 rounded-full text-[12.5px] font-bold tracking-tight text-paper"
            style={{ background: "var(--ink)" }}
          >
            <Download weight="bold" size={14} />
            Download PDF
          </button>
          <Link to={`/projects/${id}/analysis`} className="mono text-[10.5px] uppercase tracking-[0.18em] text-mute hover:text-ink">
            ← Back to analysis
          </Link>
        </div>
      </main>
    </div>
  );
}

const Cell = ({ k, v }: { k: string; v: string }) => (
  <div className="flex flex-col gap-1">
    <span className="mono text-[10px] uppercase tracking-[0.18em] text-mute">{k}</span>
    <span className="numeral text-[28px] tab-num leading-none" style={{ fontWeight: 600 }}>
      {v}
    </span>
  </div>
);
