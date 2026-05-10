export default function StatsPanel({ stats, roofPitch, onConfigClick }) {
  const items = [
    ["Roof type", "Hip roof"],
    ["Building Roof Pitch", `${roofPitch} deg`],
    ["Panel Bracket Tilt", `${stats.bracket_tilt || 0} deg`],
    ["Estimated panel count", stats.panel_count || 0],
    ["System Size", `${stats.estimated_kwp || 0} kWp`],
    ["Recommended Inverter", stats.inverter_model || "N/A"],
    ["  ↳ DC/AC Ratio", `${stats.dc_ac_ratio || 0}% (Max 200%)`],
    ["Total Annual Yield", `${stats.annual_yield_kwh || 0} kWh`],
    ["  ↳ Est. TNB Savings", `RM ${stats.savings_rm || 0} / yr`],
    ["25-Year Lifetime Savings", `RM ${(stats.lifetime_savings_rm || 0).toLocaleString()}`],
    ["  ↳ South Slope (Sunnier)", `${stats.yield_south ? Math.round(stats.yield_south) : 0} kWh`],
    ["  ↳ North Slope (Shaded)", `${stats.yield_north ? Math.round(stats.yield_north) : 0} kWh`],
    ["Performance Ratio", `${stats.performance_ratio || 0}`],
    ["  ↳ Soiling Loss", `${stats.soiling_loss_pct || 0}%`],
    ["  ↳ Temp Loss", `${stats.temp_loss_pct || 0}%`],
    ["Avg POA Irradiance", `${stats.poa_irradiance || 0} kWh/m²`],
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

      {stats.monthly_yields && stats.monthly_yields.length === 12 && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <h3 className="mb-2 text-xs font-semibold text-emerald-300 uppercase tracking-wider">
            Monthly Yield Breakdown (kWh)
          </h3>
          <div className="grid grid-cols-4 gap-2 text-xs">
            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, i) => (
              <div key={month} className="flex flex-col items-center justify-center rounded bg-slate-900/50 p-1 border border-white/5">
                <span className="text-slate-400">{month}</span>
                <span className="font-medium text-slate-200">{Math.round(stats.monthly_yields[i])}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.top_3 && stats.top_3.length > 0 && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <h3 className="mb-2 text-xs font-semibold text-emerald-300 uppercase tracking-wider">
            Top 3 Configurations (Design Space)
          </h3>
          <div className="grid gap-2 text-xs">
            {stats.top_3.map((config) => (
              <div
                key={`${config.rank}-${config.bracket_tilt}-${config.orientation}`}
                onClick={() => onConfigClick && onConfigClick(config)}
                className={`flex items-center justify-between rounded px-3 py-2 border cursor-pointer transition-colors hover:border-emerald-300 ${
                  config.rank === 1
                    ? "border-emerald-400/30 bg-emerald-900/20"
                    : "border-white/5 bg-slate-900/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    config.rank === 1 ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-300"
                  }`}>
                    {config.rank}
                  </span>
                  <span className="text-slate-300">
                    {config.bracket_tilt}° {config.orientation}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-white">
                    {Math.round(config.annual_yield)} kWh
                  </span>
                  <span className="text-slate-400 block text-[10px]">
                    RM {Math.round(config.savings_rm || config.annual_yield * 0.51)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
