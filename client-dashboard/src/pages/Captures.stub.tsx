import HairlineRule from "@/components/chrome/HairlineRule";
import StatusPill from "@/components/chrome/StatusPill";
import { DroneGlyph, MeshImportGlyph, PanelGlyph } from "@/icons";
import { ArrowUpRight } from "@/icons";
import { fmtRelTime } from "@/lib/format";

const captures = [
  {
    id: "CAP-2026-0512",
    site: "Petaling Jaya — Light-industrial",
    mode: "drone:terra",
    files: 1,
    sizeMb: 38.2,
    when: "2026-05-05T07:48:00+08:00",
    status: "ready" as const,
  },
  {
    id: "CAP-2026-0511",
    site: "Shah Alam — Triple Shoplot",
    mode: "photos",
    files: 18,
    sizeMb: 412.6,
    when: "2026-05-05T13:02:00+08:00",
    status: "processing" as const,
  },
  {
    id: "CAP-2026-0510",
    site: "Cyberjaya — Office block",
    mode: "drone:video",
    files: 1,
    sizeMb: 1_204,
    when: "2026-05-03T16:30:00+08:00",
    status: "draft" as const,
  },
  {
    id: "CAP-2026-0506",
    site: "Penang — Surau Pilot",
    mode: "drone:terra",
    files: 4,
    sizeMb: 96.3,
    when: "2026-05-04T15:40:00+08:00",
    status: "failed" as const,
  },
];

export default function Captures() {
  return (
    <main className="px-8 lg:px-12 py-10 max-w-[1400px]">
      <div className="mono text-[10.5px] uppercase tracking-[0.24em] text-leaf-deep mb-2">Captures</div>
      <h1 className="numeral text-[44px] leading-[1] tracking-[-0.03em] text-ink" style={{ fontWeight: 600 }}>
        Inbound site footage.
      </h1>
      <p className="mt-3 text-[14px] text-mute max-w-[58ch]">
        Every drone bundle, photo set, and DJI&nbsp;Terra OBJ that lands in the workspace. Hashes are
        deduplicated; reconstruction artefacts cache by SHA-256 of the sorted bundle.
      </p>

      <div className="grid grid-cols-3 gap-4 mt-8 mb-10">
        <ModeCard glyph={<DroneGlyph size={22} />} title="Drone · DJI Terra OBJ" count={2} unit="bundles" tag="< 30 s end-to-end" />
        <ModeCard glyph={<MeshImportGlyph size={22} />} title="Drone video · MP4" count={1} unit="reel" tag="ffmpeg fps=1 → Meshroom" />
        <ModeCard glyph={<PanelGlyph size={22} />} title="Photo set · multi-angle" count={1} unit="zip" tag="Meshroom · GPU" />
      </div>

      <HairlineRule label="Recent inbox" className="mb-5" />

      <div className="bg-surface rounded-2xl overflow-hidden" style={{ border: "1px solid var(--rule)" }}>
        <table className="w-full mono text-[12px] tab-num">
          <thead>
            <tr
              className="text-[9.5px] uppercase tracking-[0.18em] text-mute text-left"
              style={{ borderBottom: "1px solid var(--rule)" }}
            >
              <th className="px-5 py-3 font-normal">ID</th>
              <th className="px-3 py-3 font-normal">Site</th>
              <th className="px-3 py-3 font-normal">Mode</th>
              <th className="px-3 py-3 font-normal text-right">Files</th>
              <th className="px-3 py-3 font-normal text-right">Size</th>
              <th className="px-3 py-3 font-normal">Captured</th>
              <th className="px-3 py-3 font-normal">Status</th>
              <th className="px-5 py-3 font-normal text-right" />
            </tr>
          </thead>
          <tbody>
            {captures.map((c, i) => (
              <tr
                key={c.id}
                style={{ borderBottom: i === captures.length - 1 ? "none" : "1px dashed var(--rule)" }}
              >
                <td className="px-5 py-3 text-leaf-deep">{c.id}</td>
                <td className="px-3 py-3 text-ink-2">{c.site}</td>
                <td className="px-3 py-3 text-ink">{c.mode}</td>
                <td className="px-3 py-3 text-right">{c.files}</td>
                <td className="px-3 py-3 text-right">{c.sizeMb >= 1000 ? `${(c.sizeMb / 1024).toFixed(2)} GB` : `${c.sizeMb.toFixed(1)} MB`}</td>
                <td className="px-3 py-3 text-mute normal-case tracking-tight">{fmtRelTime(c.when)}</td>
                <td className="px-3 py-3"><StatusPill status={c.status} size="sm" /></td>
                <td className="px-5 py-3 text-right">
                  <button className="text-mute hover:text-ink"><ArrowUpRight weight="bold" size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 mono text-[10.5px] uppercase tracking-[0.18em] text-mute">
        stub · v1 wires this to <span className="text-ink">FastAPI · workers/photogrammetry · workers/drone</span>
      </p>
    </main>
  );
}

const ModeCard = ({
  glyph,
  title,
  count,
  unit,
  tag,
}: {
  glyph: React.ReactNode;
  title: string;
  count: number;
  unit: string;
  tag: string;
}) => (
  <div className="bg-surface rounded-2xl p-5 flex items-center gap-4" style={{ border: "1px solid var(--rule)" }}>
    <div className="w-12 h-12 rounded-xl grid place-items-center" style={{ background: "var(--leaf-tint)", color: "var(--leaf-deep)" }}>
      {glyph}
    </div>
    <div className="flex-1">
      <p className="text-[13px] font-extrabold tracking-tight text-ink">{title}</p>
      <p className="mono text-[10px] uppercase tracking-[0.16em] text-mute mt-0.5">{tag}</p>
    </div>
    <div className="text-right">
      <p className="numeral text-[28px] tab-num leading-none" style={{ fontWeight: 600 }}>
        {count}
      </p>
      <p className="mono text-[10px] uppercase tracking-[0.14em] text-mute">{unit}</p>
    </div>
  </div>
);
