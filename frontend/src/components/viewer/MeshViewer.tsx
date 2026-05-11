import { Canvas } from "@react-three/fiber";
import { Suspense, useMemo } from "react";
import { Bounds, ContactShadows, Environment, Html, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import RoofScene from "@/scene/RoofScene";
import CrosshairCorners from "./CrosshairCorners";
import NorthRose from "./NorthRose";
import HeatmapLegend from "./HeatmapLegend";
import CoordReadout from "./CoordReadout";
import LayerToggleBar from "./LayerToggleBar";
import { useViewerStore } from "@/store/viewer-store";

/* MeshViewer — wraps r3f Canvas + HUD overlay layers.
 * Pass glbUrl to render an uploaded project GLB; omit to show the procedural demo scene. */

function GlbModel({ url }: { url: string }) {
  const gltf = useGLTF(url);
  const scene = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((obj) => {
      if (obj instanceof THREE.Mesh) { obj.castShadow = true; obj.receiveShadow = true; }
    });
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    clone.position.set(-center.x, -box.min.y, -center.z);
    return clone;
  }, [gltf.scene]);
  return <primitive object={scene} />;
}

function GlbFallback() {
  return (
    <Html center>
      <div className="flex items-center gap-2 rounded-full border border-rule bg-surface px-4 py-2 text-[12px] font-bold text-ink shadow-soft">
        <span className="animate-spin">⟳</span> Loading model
      </div>
    </Html>
  );
}

export default function MeshViewer({ lat, lon, glbUrl }: { lat: number; lon: number; glbUrl?: string }) {
  const showShading = useViewerStore((s) => s.layers.shading);

  return (
    <div
      className="relative bg-blueprint rounded-2xl overflow-hidden cursor-crosshair-leaf"
      style={{ border: "1px solid var(--rule)", aspectRatio: "16/9", minHeight: 520 }}
    >
      {glbUrl ? (
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [3.8, 2.6, 4.6], fov: 42, near: 0.1, far: 100 }}
          style={{ background: "transparent" }}
        >
          <color attach="background" args={["#f7f5ef"]} />
          <ambientLight intensity={0.9} />
          <hemisphereLight args={["#ffffff", "#94a3b8", 1.2]} />
          <directionalLight castShadow position={[5, 7, 6]} intensity={2.8} shadow-mapSize={[2048, 2048]} />
          <Suspense fallback={<GlbFallback />}>
            <Bounds fit clip observe margin={1.35}>
              <GlbModel url={glbUrl} />
            </Bounds>
            <Environment preset="city" />
            <ContactShadows position={[0, -0.01, 0]} opacity={0.36} scale={8} blur={2.4} far={8} />
          </Suspense>
          <OrbitControls makeDefault autoRotate autoRotateSpeed={0.75} enablePan enableZoom enableRotate minDistance={1.5} maxDistance={18} />
          <gridHelper args={[8, 24, "#d9d4c8", "#e8e3d8"]} position={[0, 0, 0]} />
        </Canvas>
      ) : (
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
      )}

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
