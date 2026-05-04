export default function StatsPanel({ stats, roofPitch }) {
  const items = [
    ["Roof type", "Hip roof"],
    ["Roof pitch", `${roofPitch} deg`],
    ["Usable roof area", `${stats.usable_roof_area} m2`],
    ["Estimated panel count", stats.panel_count],
    ["Estimated kWp", `${stats.estimated_kwp} kWp`],
  ];

  return (
    <section className="rounded-lg border border-white/10 bg-white/10 p-4 shadow-2xl shadow-slate-950/20 backdrop-blur-md">
      <h2 className="mb-3 text-lg font-semibold text-white">Stats</h2>
      <dl className="grid gap-2">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-4 rounded-md border border-white/10 bg-slate-950/35 px-3 py-2"
          >
            <dt className="text-sm text-slate-300">{label}</dt>
            <dd className="text-sm font-semibold text-white">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
