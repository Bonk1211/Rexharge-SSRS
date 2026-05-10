import { Link } from "react-router-dom";
import HairlineRule from "@/components/chrome/HairlineRule";
import { Download, ArrowUpRight, Sparkle } from "@/icons";
import { projects } from "@/data/mock-projects";
import { fmtKWp, fmtRM, fmtRelTime } from "@/lib/format";

export default function Reports() {
  const ready = projects.filter((p) => p.status === "ready");
  return (
    <main className="px-8 lg:px-12 py-10 max-w-[1400px]">
      <div className="mono text-[10.5px] uppercase tracking-[0.24em] text-leaf-deep mb-2">Reports</div>
      <h1 className="numeral text-[44px] leading-[1] tracking-[-0.03em] text-ink" style={{ fontWeight: 600 }}>
        Engineering PDFs.
      </h1>
      <p className="mt-3 text-[14px] text-mute max-w-[58ch]">
        WeasyPrint cover, Playwright snapshots of the 3D scene, monthly yield tables, financial
        appendix citing PVGIS &amp; TNB&nbsp;2024. Eight pages, contract-ready.
      </p>

      <HairlineRule label="Generated reports" className="my-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {ready.map((p) => (
          <Link
            key={p.id}
            to={`/projects/${p.id}/report`}
            className="group bg-surface rounded-2xl p-5 flex flex-col gap-4 transition-colors hover:bg-leaf-tint/40"
            style={{ border: "1px solid var(--rule)" }}
          >
            {/* Mini cover preview */}
            <div
              className="aspect-[3/2] rounded-lg p-4 flex flex-col justify-between"
              style={{
                background: "var(--surface-2)",
                backgroundImage:
                  "repeating-linear-gradient(135deg, transparent 0 12px, color-mix(in srgb, var(--leaf) 6%, transparent) 12px 13px)",
                border: "1px dashed var(--rule)",
              }}
            >
              <span className="mono text-[9.5px] uppercase tracking-[0.18em] text-mute">REXCHARGE · COVER</span>
              <p className="numeral text-[22px] tab-num leading-[1]" style={{ fontWeight: 600 }}>
                {fmtKWp(p.kwp)} kWp
              </p>
              <p className="mono text-[9.5px] uppercase tracking-[0.18em] text-leaf-deep">
                annual {fmtRM(p.annualSavingsRm, { compact: true })} saved
              </p>
            </div>
            <div>
              <p className="text-[13.5px] font-extrabold tracking-tight">{p.name}</p>
              <p className="mono text-[10px] uppercase tracking-[0.16em] text-mute mt-1">
                8 pp · pdf v1 · {fmtRelTime(p.capturedAt)}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 mono text-[10.5px] uppercase tracking-[0.18em] text-leaf-deep">
                <Download weight="bold" size={11} />
                Open
              </span>
              <ArrowUpRight weight="bold" size={14} className="text-mute group-hover:text-ink" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-2xl p-5 flex items-center gap-3" style={{ background: "var(--leaf-tint)" }}>
        <Sparkle weight="duotone" size={16} className="text-leaf-deep" />
        <p className="text-[12.5px] text-ink-2">
          <span className="font-bold text-ink">Bulk export · v1.1.</span> Generate the entire portfolio's
          PDFs in one zip — useful for ATAP submissions.
        </p>
      </div>
    </main>
  );
}
