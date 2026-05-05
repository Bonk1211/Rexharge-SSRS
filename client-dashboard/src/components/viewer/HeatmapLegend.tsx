/* Heatmap legend — gradient bar with tick labels for shading factor.
 * Visible only when shading layer is on. */

export default function HeatmapLegend() {
  return (
    <div
      className="bg-surface/90 backdrop-blur rounded-lg px-3 py-2.5 flex flex-col gap-1.5"
      style={{ border: "1px solid var(--rule)", minWidth: 180 }}
    >
      <div className="flex items-center justify-between">
        <span className="mono text-[9.5px] uppercase tracking-[0.18em] text-mute">Shading factor</span>
        <span className="mono text-[9.5px] uppercase tracking-[0.16em] text-leaf-deep">live</span>
      </div>
      <div
        className="h-2.5 rounded-sm"
        style={{
          background:
            "linear-gradient(to right, #E07856 0%, #F4B82E 35%, #C1EAE3 70%, #5DB94D 100%)",
          border: "1px solid var(--rule)",
        }}
      />
      <div className="flex justify-between mono text-[9.5px] tab-num text-mute">
        <span>0.30</span>
        <span>0.55</span>
        <span>0.80</span>
        <span>1.00</span>
      </div>
    </div>
  );
}
