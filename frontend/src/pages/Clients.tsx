import HairlineRule from "@/components/chrome/HairlineRule";
import ProjectCard from "@/components/data/ProjectCard";
import { useProjects, usePortfolioStats } from "@/store/projects-store";
import { fmtKWh, fmtKWp, fmtRM } from "@/lib/format";

export default function Clients() {
  const { data: projects = [] } = useProjects();
  const s = usePortfolioStats();
  return (
    <main className="flex-1 min-w-0 w-full px-8 lg:px-12 py-10">
      <div className="mono text-[10.5px] uppercase tracking-[0.24em] text-leaf-deep mb-2">Clients</div>
      <h1 className="numeral text-[44px] leading-[1] tracking-[-0.03em] text-ink" style={{ fontWeight: 600 }}>
        Clients &amp; sites.
      </h1>
      <p className="mt-3 text-[14px] text-mute max-w-[58ch]">
        Each card opens the site&rsquo;s analysis view.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-8 mb-8">
        <SummaryCell label="Active · total" value={`${s.readyProjects} / ${s.totalProjects}`} />
        <SummaryCell label="Total kWp" value={fmtKWp(s.totalKwp)} />
        <SummaryCell label="Annual yield · kWh" value={fmtKWh(s.totalKwh)} />
        <SummaryCell label="Annual savings" value={fmtRM(s.totalSavings, { compact: true })} />
      </div>

      <HairlineRule label="Clients" className="mb-5" />

      {projects.length === 0 ? (
        <p className="text-[13px] text-mute py-6">No projects yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      )}
    </main>
  );
}

const SummaryCell = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-surface rounded-2xl p-5" style={{ border: "1px solid var(--rule)" }}>
    <p className="mono text-[10px] uppercase tracking-[0.18em] text-mute mb-1">{label}</p>
    <p className="numeral text-[28px] tab-num leading-none" style={{ fontWeight: 600 }}>
      {value}
    </p>
  </div>
);
