import { Link } from "react-router-dom";
import HairlineRule from "@/components/chrome/HairlineRule";
import StatusPill from "@/components/chrome/StatusPill";
import { ArrowUpRight } from "@/icons";
import { useProjects, usePortfolioStats } from "@/store/projects-store";
import { fmtKWh, fmtKWp, fmtRM, fmtYears } from "@/lib/format";

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
        One row per client project. Click a row to open the monitoring view.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-8 mb-8">
        <SummaryCell label="Active · total" value={`${s.readyProjects} / ${s.totalProjects}`} />
        <SummaryCell label="Total kWp" value={fmtKWp(s.totalKwp)} />
        <SummaryCell label="Annual yield · kWh" value={fmtKWh(s.totalKwh)} />
        <SummaryCell label="Annual savings" value={fmtRM(s.totalSavings, { compact: true })} />
      </div>

      <HairlineRule label="Clients" className="mb-5" />

      <div className="bg-surface rounded-2xl overflow-hidden" style={{ border: "1px solid var(--rule)" }}>
        <table className="w-full mono text-[12px] tab-num">
          <thead>
            <tr
              className="text-[9.5px] uppercase tracking-[0.18em] text-mute text-left"
              style={{ borderBottom: "1px solid var(--rule)" }}
            >
              <th className="px-5 py-3 font-normal">ID</th>
              <th className="px-3 py-3 font-normal">Client</th>
              <th className="px-3 py-3 font-normal">Address</th>
              <th className="px-3 py-3 font-normal text-right">kWp</th>
              <th className="px-3 py-3 font-normal text-right">kWh / yr</th>
              <th className="px-3 py-3 font-normal text-right">Saving / yr</th>
              <th className="px-3 py-3 font-normal text-right">Payback</th>
              <th className="px-3 py-3 font-normal">Status</th>
              <th className="px-5 py-3 font-normal text-right" />
            </tr>
          </thead>
          <tbody>
            {projects.map((p, i) => (
              <tr
                key={p.id}
                style={{ borderBottom: i === projects.length - 1 ? "none" : "1px dashed var(--rule)" }}
              >
                <td className="px-5 py-3 text-leaf-deep">{p.id}</td>
                <td className="px-3 py-3 text-ink-2 normal-case tracking-tight font-sans">
                  <Link to={`/app/projects/${p.id}`} className="font-bold text-ink hover:text-leaf-deep">
                    {p.name}
                  </Link>
                </td>
                <td className="px-3 py-3 text-mute normal-case tracking-tight font-sans">{p.address}</td>
                <td className="px-3 py-3 text-right">{p.kwp ? fmtKWp(p.kwp) : "—"}</td>
                <td className="px-3 py-3 text-right">{p.annualKwh ? fmtKWh(p.annualKwh) : "—"}</td>
                <td className="px-3 py-3 text-right">{p.annualSavingsRm ? fmtRM(p.annualSavingsRm, { compact: true }) : "—"}</td>
                <td className="px-3 py-3 text-right">{p.paybackYears ? fmtYears(p.paybackYears) : "—"}</td>
                <td className="px-3 py-3"><StatusPill status={p.status} size="sm" /></td>
                <td className="px-5 py-3 text-right">
                  <Link to={`/app/projects/${p.id}`} className="text-mute hover:text-ink inline-flex">
                    <ArrowUpRight weight="bold" size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
