import { useViewerStore } from "@/store/viewer-store";
import SliderRow from "./SliderRow";
import HairlineRule from "@/components/chrome/HairlineRule";
import { ArrowsClockwise } from "@/icons";

/* Layout parameter controls — drives the panel packer.
 * In v1 backend, slider change debounces 300ms → POST /layout. Here state-only. */

export default function ParamPanel() {
  const edgeSetback = useViewerStore((s) => s.edgeSetback);
  const obstacleSetback = useViewerStore((s) => s.obstacleSetback);
  const panelGap = useViewerStore((s) => s.panelGap);
  const moduleW = useViewerStore((s) => s.moduleW);
  const setParam = useViewerStore((s) => s.setParam);

  const reset = () => {
    setParam("edgeSetback", 0.4);
    setParam("obstacleSetback", 0.5);
    setParam("panelGap", 0.05);
    setParam("moduleW", 620);
  };

  return (
    <div className="bg-surface rounded-2xl p-5 flex flex-col gap-5" style={{ border: "1px solid var(--rule)" }}>
      <div className="flex items-baseline justify-between">
        <h3 className="text-[13px] font-extrabold tracking-tight">Layout parameters</h3>
        <button
          onClick={reset}
          className="mono text-[10px] uppercase tracking-[0.16em] text-mute hover:text-ink transition-colors flex items-center gap-1"
        >
          <ArrowsClockwise weight="bold" size={10} /> reset
        </button>
      </div>

      <SliderRow
        label="Edge setback"
        unit="m"
        value={edgeSetback}
        min={0.2}
        max={1.0}
        step={0.05}
        marks={[0.4]}
        onChange={(v) => setParam("edgeSetback", v)}
        caption="UBBL fire access · default 0.40 m"
      />

      <HairlineRule variant="dashed" />

      <SliderRow
        label="Obstacle setback"
        unit="m"
        value={obstacleSetback}
        min={0.2}
        max={1.2}
        step={0.05}
        marks={[0.5]}
        onChange={(v) => setParam("obstacleSetback", v)}
        caption="Maintenance + shading buffer"
      />

      <HairlineRule variant="dashed" />

      <SliderRow
        label="Inter-row gap"
        unit="m"
        value={panelGap}
        min={0}
        max={0.2}
        step={0.01}
        marks={[0.05]}
        onChange={(v) => setParam("panelGap", v)}
        caption="Flush-mount portrait orientation"
      />

      <HairlineRule variant="dashed" />

      <SliderRow
        label="Module rating"
        unit="W"
        value={moduleW}
        min={400}
        max={700}
        step={10}
        marks={[620]}
        onChange={(v) => setParam("moduleW", v)}
        caption="Trina Vertex N · 620 W bifacial · default"
      />
    </div>
  );
}
