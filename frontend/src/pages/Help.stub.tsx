import HairlineRule from "@/components/chrome/HairlineRule";

const SHORTCUTS = [
  { keys: ["⌘", "K"], action: "Search projects, addresses, kWp" },
  { keys: ["1"], action: "Workspace · dashboard" },
  { keys: ["2"], action: "Captures · uploads inbox" },
  { keys: ["3"], action: "Reports · PDFs" },
  { keys: ["4"], action: "Portfolio · all sites table" },
  { keys: ["N"], action: "New project" },
  { keys: ["L"], action: "Toggle layer overlays · in viewer" },
  { keys: ["S"], action: "Drag sun-path scrubber · in viewer" },
];

const TOPICS = [
  { title: "Pipeline ladder", desc: "Photogrammetry → mesh → roof segmentation → panel pack → shading → yield → bill → PDF." },
  { title: "Why 50 °C cell?", desc: "Malaysian roof empirical · Trina Vertex N temp coef -0.29 % / °C." },
  { title: "ATAP NEM 3.0 vs 2.0", desc: "Self-consumption + System Marginal Price for export · netting cycle 30 days." },
  { title: "Drone capture spec", desc: "Grid mission, 80 % overlap, 60 m AGL · DJI Pilot 2 default." },
  { title: "What goes in the PDF", desc: "Cover · executive summary · planes · layout · monthly yield · financials · assumptions." },
];

export default function Help() {
  return (
    <main className="px-8 lg:px-12 py-10 max-w-[1100px]">
      <div className="mono text-[10.5px] uppercase tracking-[0.24em] text-leaf-deep mb-2">Help</div>
      <h1 className="numeral text-[44px] leading-[1] tracking-[-0.03em] text-ink" style={{ fontWeight: 600 }}>
        Shortcuts &amp; how things work.
      </h1>

      <HairlineRule label="Keyboard shortcuts" className="my-8" />

      <div className="bg-surface rounded-2xl p-5" style={{ border: "1px solid var(--rule)" }}>
        <ul>
          {SHORTCUTS.map((s, i) => (
            <li
              key={i}
              className="grid grid-cols-[auto_1fr] gap-4 items-center py-2.5"
              style={{ borderBottom: i === SHORTCUTS.length - 1 ? "none" : "1px dashed var(--rule)" }}
            >
              <div className="flex items-center gap-1">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="mono text-[10.5px] tab-num uppercase tracking-[0.06em] px-1.5 h-6 grid place-items-center rounded-md"
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--rule)",
                      color: "var(--ink)",
                      minWidth: 24,
                    }}
                  >
                    {k}
                  </kbd>
                ))}
              </div>
              <span className="text-[13px] text-ink-2">{s.action}</span>
            </li>
          ))}
        </ul>
      </div>

      <HairlineRule label="Concepts" className="my-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {TOPICS.map((t) => (
          <div key={t.title} className="bg-surface rounded-2xl p-5" style={{ border: "1px solid var(--rule)" }}>
            <p className="text-[14px] font-extrabold tracking-tight">{t.title}</p>
            <p className="mt-1.5 text-[12.5px] text-mute leading-relaxed">{t.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
