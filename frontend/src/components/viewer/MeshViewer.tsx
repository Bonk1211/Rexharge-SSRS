import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import RoofScene from "@/scene/RoofScene";
import CrosshairCorners from "./CrosshairCorners";
import NorthRose from "./NorthRose";
import HeatmapLegend from "./HeatmapLegend";
import CoordReadout from "./CoordReadout";
import LayerToggleBar from "./LayerToggleBar";
import { useViewerStore } from "@/store/viewer-store";

/* MeshViewer — wraps r3f Canvas + HUD overlay layers.
 * The HUD is purely DOM (faster, sharper text) above the WebGL surface. */

export default function MeshViewer({ lat, lon }: { lat: number; lon: number }) {
  const showShading = useViewerStore((s) => s.layers.shading);

  return (
    <div
      className="relative bg-blueprint rounded-2xl overflow-hidden cursor-crosshair-leaf"
      style={{ border: "1px solid var(--rule)", aspectRatio: "16/9", minHeight: 520 }}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [16, 12, 18], fov: 38, near: 0.1, far: 200 }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <RoofScene />
        </Suspense>
      </Canvas>

      {/* Corner instrument frame */}
      <CrosshairCorners />

      {/* Top-right north rose */}
      <div className="absolute top-4 right-4 pointer-events-none">
        <NorthRose />
      </div>

      {/* Top-left site tag */}
      <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none">
        <span className="mono text-[10px] uppercase tracking-[0.2em] text-mute">Reconstructed mesh</span>
        <div className="flex items-baseline gap-2">
          <span
            className="numeral text-[28px] leading-none tab-num text-ink"
            style={{ fontWeight: 600 }}
          >
            BJ-01
          </span>
          <span className="mono text-[10.5px] uppercase tracking-[0.16em] text-leaf-deep">demo · cached</span>
        </div>
      </div>

      {/* Bottom-left coordinate readout + heatmap legend */}
      <div className="absolute bottom-4 left-4 flex items-end gap-3">
        <CoordReadout lat={lat} lon={lon} />
        {showShading && <HeatmapLegend />}
      </div>

      {/* Bottom-right axis hint */}
      <div
        className="absolute bottom-4 right-4 mono text-[9.5px] uppercase tracking-[0.18em] text-mute bg-surface/80 backdrop-blur px-2 py-1 rounded"
        style={{ border: "1px solid var(--rule)" }}
      >
        Drag · orbit  ·  Scroll · zoom
      </div>

      {/* Floating layer bar — bottom centre */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-4 hidden md:block">
        <LayerToggleBar />
      </div>
    </div>
  );
}
