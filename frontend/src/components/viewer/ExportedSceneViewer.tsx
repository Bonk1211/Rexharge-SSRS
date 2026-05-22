import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { Bounds, Grid, Html, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import CrosshairCorners from "./CrosshairCorners";
import NorthRose from "./NorthRose";
import CoordReadout from "./CoordReadout";
import LayerToggleBar from "./LayerToggleBar";
import { createSolarPanelTexture } from "@/scene/solar-panel-texture";
import { useViewerStore } from "@/store/viewer-store";
import { sunPositionFromHour } from "@/scene/geometry";
import { resolveModelUrl } from "@/lib/glb-url";

type VectorJson = { x: number; y: number; z: number };
type QuaternionJson = { x: number; y: number; z: number; w: number };
type ModelBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
};
type ClipBounds = {
  xMin: number;
  xMax: number;
  zMin: number;
  zMax: number;
};

interface ExportedPanel {
  index: number;
  position_model: VectorJson;
  orientation: {
    quaternion: QuaternionJson;
  };
  panelSpec: {
    width: number;
    height: number;
    depth: number;
    power_stc?: number;
  };
  panelOrientation?: string;
}

interface ExportedSceneReport {
  site: {
    latitude: number;
    longitude: number;
    modelUrl: string;
  };
  buildingIsolation?: {
    clipBounds_model?: ClipBounds;
    modelScale?: number;
    modelBounds?: ModelBounds;
  };
  panelConfig: {
    modelName: string;
  };
  systemSummary: {
    totalPanels: string;
    systemCapacity: string;
    annualYield: string;
  };
  panels: ExportedPanel[];
}

export default function ExportedSceneViewer({ report }: { report: ExportedSceneReport }) {
  const [modelAvailable, setModelAvailable] = useState(false);
  const modelUrl = useMemo(() => resolveModelUrl(report.site.modelUrl), [report.site.modelUrl]);

  useEffect(() => {
    let cancelled = false;
    if (!modelUrl) {
      setModelAvailable(false);
      return;
    }
    fetch(modelUrl, { method: "HEAD" })
      .then((response) => {
        const contentType = response.headers.get("content-type") ?? "";
        const isModelResponse = response.ok && !contentType.includes("text/html");
        if (!cancelled) setModelAvailable(isModelResponse);
      })
      .catch(() => {
        if (!cancelled) setModelAvailable(false);
      });

    return () => {
      cancelled = true;
    };
  }, [modelUrl]);

  const uniquePanels = useMemo(() => {
    const deduped = dedupePanels(report.panels);
    const clip = report.buildingIsolation?.clipBounds_model;
    if (!clip) return deduped;
    return deduped.filter((p) => {
      const { x, z } = p.position_model;
      return x >= clip.xMin && x <= clip.xMax && z >= clip.zMin && z <= clip.zMax;
    });
  }, [report.panels, report.buildingIsolation?.clipBounds_model]);

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-blueprint cursor-crosshair-leaf"
      style={{ border: "1px solid var(--rule)", width: "100%", height: "70vh", maxHeight: 720, minHeight: 360 }}
    >
      <Canvas
        dpr={[1, 1.5]}
        frameloop="demand"
        camera={{ position: [22, 16, 22], fov: 38, near: 0.1, far: 500 }}
        style={{ background: "transparent" }}
        gl={{ localClippingEnabled: true, antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={<LoadingLabel />}>
          <ExportedScene report={report} panels={uniquePanels} modelAvailable={modelAvailable} modelUrl={modelUrl} />
        </Suspense>
      </Canvas>

      <CrosshairCorners />

      <div className="absolute right-4 top-4 pointer-events-none">
        <NorthRose />
      </div>

      <div className="absolute left-4 top-4 flex flex-col gap-1 pointer-events-none">
        <span className="mono text-[10px] uppercase tracking-[0.2em] text-mute">Client design scene</span>
        <div className="flex items-baseline gap-2">
          <span className="numeral text-[28px] leading-none tab-num text-ink" style={{ fontWeight: 600 }}>
            {report.systemSummary.systemCapacity}
          </span>
          <span className="mono text-[10.5px] uppercase tracking-[0.16em] text-leaf-deep">
            {uniquePanels.length}/{report.systemSummary.totalPanels} panels
          </span>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 flex items-end gap-3">
        <CoordReadout lat={report.site.latitude} lon={report.site.longitude} />
        <div
          className="hidden sm:block rounded-lg bg-surface/85 px-3 py-2 backdrop-blur"
          style={{ border: "1px solid var(--rule)" }}
        >
          <p className="mono text-[9.5px] uppercase tracking-[0.16em] text-mute">Annual yield</p>
          <p className="mt-0.5 text-[13px] font-extrabold text-ink">{report.systemSummary.annualYield}</p>
        </div>
      </div>

      <div
        className="absolute bottom-4 right-4 mono text-[9.5px] uppercase tracking-[0.18em] text-mute bg-surface/80 backdrop-blur px-2 py-1 rounded"
        style={{ border: "1px solid var(--rule)" }}
      >
        Drag · orbit · Scroll · zoom
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 bottom-4 hidden md:block">
        <LayerToggleBar />
      </div>

      {!modelAvailable && (
        <div
          className="absolute right-4 top-[72px] max-w-[260px] rounded-lg bg-surface/90 px-3 py-2 text-[11px] leading-5 text-mute backdrop-blur"
          style={{ border: "1px solid var(--rule)" }}
        >
          Missing GLB at <span className="mono text-ink">{report.site.modelUrl}</span>. Showing exported panels with a
          bounds placeholder.
        </div>
      )}
    </div>
  );
}

function CameraRig({ focus }: { focus: { cx: number; cy: number; cz: number; dist: number } }) {
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    camera.position.set(focus.cx + focus.dist, focus.cy + focus.dist * 0.7, focus.cz + focus.dist);
    camera.lookAt(focus.cx, focus.cy, focus.cz);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, focus, invalidate]);
  return null;
}

function GlobalClipper({ clipBounds }: { clipBounds?: ClipBounds }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    if (!clipBounds) {
      gl.clippingPlanes = [];
      gl.localClippingEnabled = false;
      return;
    }
    // clipBounds_model from sim is already in sim-world coords. Our model is
    // wrapped in a group with the same transform sim applied, so MY world ==
    // sim world. Plane values map 1:1.
    gl.clippingPlanes = [
      new THREE.Plane(new THREE.Vector3(1, 0, 0), -clipBounds.xMin),
      new THREE.Plane(new THREE.Vector3(-1, 0, 0), clipBounds.xMax),
      new THREE.Plane(new THREE.Vector3(0, 0, 1), -clipBounds.zMin),
      new THREE.Plane(new THREE.Vector3(0, 0, -1), clipBounds.zMax),
    ];
    gl.localClippingEnabled = true;
    return () => {
      gl.clippingPlanes = [];
      gl.localClippingEnabled = false;
    };
  }, [gl, clipBounds]);
  return null;
}

function ExportedScene({
  report,
  panels,
  modelAvailable,
  modelUrl,
}: {
  report: ExportedSceneReport;
  panels: ExportedPanel[];
  modelAvailable: boolean;
  modelUrl: string;
}) {
  const bounds = report.buildingIsolation?.modelBounds;
  const clipBounds = report.buildingIsolation?.clipBounds_model;
  const gridY = (bounds?.minY ?? 0) - 0.05;
  const panelTexture = useMemo(() => createSolarPanelTexture(), []);
  const hour = useViewerStore((s) => s.hour);

  // Center camera + controls on the clipBounds region (visible after isolation).
  const focus = useMemo(() => {
    if (!clipBounds || !bounds) return { cx: 0, cy: 0.4, cz: 0, dist: 4 };
    const cx = (clipBounds.xMin + clipBounds.xMax) / 2;
    const cz = (clipBounds.zMin + clipBounds.zMax) / 2;
    const cy = (bounds.minY + bounds.maxY) / 2;
    const w = clipBounds.xMax - clipBounds.xMin;
    const d = clipBounds.zMax - clipBounds.zMin;
    const dist = Math.max(w, d) * 1.6;
    return { cx, cy, cz, dist };
  }, [clipBounds, bounds]);

  const sun = useMemo(() => {
    const v = sunPositionFromHour(hour);
    const k = focus.dist / 22;
    return { x: focus.cx + v.x * k, y: focus.cy + v.y * k, z: focus.cz + v.z * k };
  }, [hour, focus]);

  const sunDir = useMemo(() => {
    return new THREE.Vector3(sun.x - focus.cx, sun.y - focus.cy, sun.z - focus.cz).normalize();
  }, [sun, focus]);

  const showIrradiance = useViewerStore((s) => s.layers.irradiance);
  const showWireframe = useViewerStore((s) => s.layers.wireframe);
  const showMesh = useViewerStore((s) => s.layers.mesh);
  const showPanels = useViewerStore((s) => s.layers.panels);
  const showSunpath = useViewerStore((s) => s.layers.sunpath);
  const showGrid = useViewerStore((s) => s.layers.grid);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidate();
  }, [showIrradiance, showWireframe, showMesh, showPanels, showSunpath, showGrid, sunDir, invalidate]);

  return (
    <>
      <GlobalClipper clipBounds={clipBounds} />
      <ambientLight intensity={0.85} />
      <hemisphereLight args={["#ffffff", "#d8ddd8", 1.1]} />
      <directionalLight position={[sun.x, sun.y, sun.z]} intensity={2.1} />

      <CameraRig focus={focus} />
      {showGrid && (
        <Grid
          position={[focus.cx, gridY, focus.cz]}
          args={[12, 12]}
          cellSize={0.1}
          sectionSize={0.5}
          cellThickness={0.45}
          sectionThickness={0.8}
          cellColor="#E4E1D8"
          sectionColor="#9CA39F"
          fadeDistance={focus.dist * 2}
          fadeStrength={1.35}
          infiniteGrid
        />
      )}

      <group>
          {modelAvailable ? (
            <ReportModelWithPanels
              url={modelUrl}
              panels={panels}
              scale={report.buildingIsolation?.modelScale ?? 0.063}
              texture={panelTexture}
              sunDir={sunDir}
              showIrradiance={showIrradiance}
              showWireframe={showWireframe}
              showMesh={showMesh}
              showPanels={showPanels}
            />
          ) : (
            <>
              <BoundsPlaceholder bounds={bounds} />
              {panels.map((panel, i) => (
                <ReportPanel
                  key={panel.index}
                  panel={panel}
                  scale={report.buildingIsolation?.modelScale ?? 0.063}
                  texture={panelTexture}
                  startDelay={Math.min(0.05, 3 / panels.length) * i}
                  sunDir={sunDir}
                  showIrradiance={showIrradiance}
                />
              ))}
            </>
          )}
        </group>

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={focus.dist * 0.3}
        maxDistance={focus.dist * 6}
        target={[focus.cx, focus.cy, focus.cz]}
      />
    </>
  );
}

function ReportModelWithPanels({
  url,
  panels,
  scale,
  texture,
  sunDir,
  showIrradiance,
  showWireframe,
  showMesh,
  showPanels,
}: {
  url: string;
  panels: ExportedPanel[];
  scale: number;
  texture: THREE.Texture;
  sunDir: THREE.Vector3;
  showIrradiance: boolean;
  showWireframe: boolean;
  showMesh: boolean;
  showPanels: boolean;
}) {
  const gltf = useGLTF(url);
  const { displayScene, offset } = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      if (object.material) {
        const mats = Array.isArray(object.material) ? object.material : [object.material];
        for (const m of mats) {
          m.side = THREE.DoubleSide;
          (m as THREE.MeshStandardMaterial).wireframe = false;
        }
      }
    });
    // Mirror simulator main.js processModel():
    //   model.position.sub(center); model.position.y += size.y / 2;
    // After this, model world == simulator world == coord space of
    // exported panel `position_model` AND `clipBounds_model`.
    const box = new THREE.Box3().setFromObject(clone);
    const c = box.getCenter(new THREE.Vector3());
    const s = box.getSize(new THREE.Vector3());
    const off = new THREE.Vector3(-c.x, s.y / 2 - c.y, -c.z);
    return { displayScene: clone, offset: off };
  }, [gltf.scene]);

  // Build shared shader material for irradiance heatmap (whole-mesh coloring
  // by cos(surface-normal, sun-dir)) and a wireframe-only material.
  const irradianceMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const wireMatRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const originalMatsRef = useRef<Map<THREE.Mesh, THREE.Material | THREE.Material[]>>(new Map());

  useEffect(() => {
    if (!irradianceMatRef.current) {
      // ShaderMaterial needs explicit clipping shader chunks to respect
      // renderer.clippingPlanes (otherwise heatmap renders past isolation).
      irradianceMatRef.current = new THREE.ShaderMaterial({
        uniforms: { uSunDir: { value: new THREE.Vector3(0, 1, 0) } },
        vertexShader: `
          #include <common>
          #include <clipping_planes_pars_vertex>
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            #include <clipping_planes_vertex>
          }`,
        fragmentShader: `
          #include <common>
          #include <clipping_planes_pars_fragment>
          uniform vec3 uSunDir;
          varying vec3 vNormal;
          void main() {
            #include <clipping_planes_fragment>
            float c = max(0.0, dot(normalize(vNormal), normalize(uSunDir)));
            vec3 color;
            if (c < 0.5) {
              color = mix(vec3(0.88, 0.47, 0.34), vec3(0.96, 0.72, 0.18), c / 0.5);
            } else {
              color = mix(vec3(0.96, 0.72, 0.18), vec3(0.36, 0.73, 0.30), (c - 0.5) / 0.5);
            }
            gl_FragColor = vec4(color, 1.0);
          }`,
        side: THREE.DoubleSide,
        clipping: true,
      });
    }
    if (!wireMatRef.current) {
      wireMatRef.current = new THREE.MeshBasicMaterial({
        color: 0x5DB94D,
        wireframe: true,
        side: THREE.DoubleSide,
        clippingPlanes: [],
      });
      // Use global renderer.clippingPlanes (MeshBasicMaterial respects it
      // automatically when localClippingEnabled is true).
    }
  }, []);

  // Update sun-dir uniform on each hour change.
  useEffect(() => {
    if (irradianceMatRef.current) {
      irradianceMatRef.current.uniforms.uSunDir.value.copy(sunDir);
      irradianceMatRef.current.uniformsNeedUpdate = true;
    }
  }, [sunDir]);

  // Material swap pipeline: irradiance > wireframe > original textures.
  useEffect(() => {
    displayScene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      if (!originalMatsRef.current.has(object)) {
        originalMatsRef.current.set(object, object.material);
      }
      const original = originalMatsRef.current.get(object)!;
      if (showIrradiance && irradianceMatRef.current) {
        object.material = irradianceMatRef.current;
      } else if (showWireframe && wireMatRef.current) {
        object.material = wireMatRef.current;
      } else {
        object.material = original;
      }
    });
  }, [displayScene, showIrradiance, showWireframe]);

  return (
    <>
      {showMesh && (
        <group position={[offset.x, offset.y, offset.z]}>
          <primitive object={displayScene} />
        </group>
      )}
      {showPanels && panels.map((panel, i) => (
        <ReportPanel
          key={panel.index}
          panel={panel}
          scale={scale}
          texture={texture}
          startDelay={Math.min(0.05, 3 / panels.length) * i}
          sunDir={sunDir}
          showIrradiance={showIrradiance}
        />
      ))}
    </>
  );
}

function clipMeshToBounds(mesh: THREE.Mesh, clipBounds: ClipBounds) {
  const source = mesh.geometry;
  const position = source.getAttribute("position");
  if (!position) return;

  const index = source.getIndex();
  const keep: number[] = [];
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const centroid = new THREE.Vector3();

  const triangleCount = index ? index.count / 3 : position.count / 3;
  for (let triangle = 0; triangle < triangleCount; triangle++) {
    const ia = index ? index.getX(triangle * 3) : triangle * 3;
    const ib = index ? index.getX(triangle * 3 + 1) : triangle * 3 + 1;
    const ic = index ? index.getX(triangle * 3 + 2) : triangle * 3 + 2;

    a.fromBufferAttribute(position, ia).applyMatrix4(mesh.matrixWorld);
    b.fromBufferAttribute(position, ib).applyMatrix4(mesh.matrixWorld);
    c.fromBufferAttribute(position, ic).applyMatrix4(mesh.matrixWorld);
    centroid.copy(a).add(b).add(c).multiplyScalar(1 / 3);

    if (
      centroid.x >= clipBounds.xMin &&
      centroid.x <= clipBounds.xMax &&
      centroid.z >= clipBounds.zMin &&
      centroid.z <= clipBounds.zMax
    ) {
      keep.push(ia, ib, ic);
    }
  }

  if (keep.length === 0) {
    mesh.visible = false;
    return;
  }

  if (keep.length === triangleCount * 3) return;

  const clipped = new THREE.BufferGeometry();
  for (const name of Object.keys(source.attributes)) {
    const attr = source.getAttribute(name);
    const values: number[] = [];
    for (const vertexIndex of keep) {
      for (let item = 0; item < attr.itemSize; item++) {
        values.push(attr.getComponent(vertexIndex, item));
      }
    }
    clipped.setAttribute(name, new THREE.BufferAttribute(new Float32Array(values), attr.itemSize, attr.normalized));
  }

  clipped.computeBoundingBox();
  clipped.computeBoundingSphere();
  if (!clipped.getAttribute("normal")) clipped.computeVertexNormals();
  mesh.geometry = clipped;
}

// Drop-in animation matching simulator/_animatePanelDrop:
//   each panel starts above its final pos along surface normal, fades + eases in.
const DROP_HEIGHT = 0.5;
const PANEL_DURATION = 0.7; // seconds
function ReportPanel({
  panel,
  scale,
  texture,
  startDelay = 0,
  sunDir,
  showIrradiance,
}: {
  panel: ExportedPanel;
  scale: number;
  texture: THREE.Texture;
  startDelay?: number;
  sunDir: THREE.Vector3;
  showIrradiance: boolean;
}) {
  const { position_model: position, orientation, panelSpec } = panel;
  const quaternion = orientation.quaternion;
  const isLandscape = panel.panelOrientation === "landscape";
  const width = (isLandscape ? panelSpec.height : panelSpec.width) * scale;
  const height = (isLandscape ? panelSpec.width : panelSpec.height) * scale;
  const depth = Math.max(panelSpec.depth * scale, 0.003);
  const groupRef = useRef<THREE.Group>(null);
  const startTimeRef = useRef<number | null>(null);
  const normal = useMemo(() => {
    const q = new THREE.Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
    return new THREE.Vector3(0, 1, 0).applyQuaternion(q);
  }, [quaternion.x, quaternion.y, quaternion.z, quaternion.w]);
  const invalidate = useThree((s) => s.invalidate);
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    if (startTimeRef.current === null) startTimeRef.current = clock.elapsedTime;
    const local = clock.elapsedTime - startTimeRef.current - startDelay;
    if (local < 0) {
      groupRef.current.position.set(
        position.x + normal.x * DROP_HEIGHT,
        position.y + 0.004 + normal.y * DROP_HEIGHT,
        position.z + normal.z * DROP_HEIGHT,
      );
      groupRef.current.visible = false;
      invalidate();
      return;
    }
    groupRef.current.visible = true;
    const t = Math.min(1, local / PANEL_DURATION);
    const eased = 1 - Math.pow(1 - t, 3);
    const lift = DROP_HEIGHT * (1 - eased);
    groupRef.current.position.set(
      position.x + normal.x * lift,
      position.y + 0.004 + normal.y * lift,
      position.z + normal.z * lift,
    );
    if (t < 1) invalidate();
  });
  const materials = useMemo(() => {
    const edgeMat = new THREE.MeshStandardMaterial({
      color: "#87939F",
      roughness: 0.28,
      metalness: 0.56,
    });
    const backMat = new THREE.MeshStandardMaterial({
      color: "#101821",
      roughness: 0.52,
      metalness: 0.35,
    });
    const faceMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.24,
      metalness: 0.42,
    });

    return [edgeMat, edgeMat, faceMat, backMat, edgeMat, edgeMat];
  }, [texture]);

  // Irradiance heatmap: dot(panel-normal, sun-dir) → 0..1 → color ramp.
  useEffect(() => {
    const faceMat = materials[2] as THREE.MeshStandardMaterial;
    if (!showIrradiance) {
      faceMat.map = texture;
      faceMat.color.set("#FFFFFF");
      faceMat.emissive.set("#000000");
      faceMat.needsUpdate = true;
      return;
    }
    const cos = Math.max(0, normal.dot(sunDir));
    // Ramp: red (cos=0) → amber (0.5) → green (1).
    let r: number, g: number, b: number;
    if (cos < 0.5) {
      const t = cos / 0.5;
      r = 224 + (244 - 224) * t;
      g = 120 + (184 - 120) * t;
      b = 86 + (46 - 86) * t;
    } else {
      const t = (cos - 0.5) / 0.5;
      r = 244 + (93 - 244) * t;
      g = 184 + (185 - 184) * t;
      b = 46 + (77 - 46) * t;
    }
    faceMat.map = null;
    faceMat.color.setRGB(r / 255, g / 255, b / 255);
    faceMat.emissive.setRGB((r / 255) * 0.15, (g / 255) * 0.15, (b / 255) * 0.15);
    faceMat.needsUpdate = true;
  }, [materials, showIrradiance, sunDir, normal, texture]);

  return (
    <group
      ref={groupRef}
      position={[position.x, position.y + 0.004, position.z]}
      quaternion={[quaternion.x, quaternion.y, quaternion.z, quaternion.w]}
    >
      <mesh castShadow receiveShadow material={materials}>
        <boxGeometry args={[width, depth, height]} />
      </mesh>
    </group>
  );
}

function BoundsPlaceholder({ bounds }: { bounds?: ModelBounds }) {
  if (!bounds) return null;
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  const depth = bounds.maxZ - bounds.minZ;
  const center: [number, number, number] = [
    (bounds.minX + bounds.maxX) / 2,
    (bounds.minY + bounds.maxY) / 2,
    (bounds.minZ + bounds.maxZ) / 2,
  ];

  return (
    <mesh position={center} receiveShadow>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color="#EDEAE0" transparent opacity={0.32} roughness={0.8} />
    </mesh>
  );
}

function LoadingLabel() {
  return (
    <Html center>
      <div
        className="rounded-full bg-surface px-4 py-2 text-[12px] font-bold text-ink shadow-soft"
        style={{ border: "1px solid var(--rule)" }}
      >
        Loading scene
      </div>
    </Html>
  );
}

function dedupePanels(panels: ExportedPanel[]) {
  const seen = new Set<string>();
  return panels.filter((panel) => {
    const position = panel.position_model;
    const quaternion = panel.orientation.quaternion;
    const key = [
      position.x.toFixed(6),
      position.y.toFixed(6),
      position.z.toFixed(6),
      quaternion.x.toFixed(6),
      quaternion.y.toFixed(6),
      quaternion.z.toFixed(6),
      quaternion.w.toFixed(6),
    ].join(":");

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

type PanelAlignment = {
  offsetX: number;
  offsetZ: number;
};

function getPanelAlignment(url: string): PanelAlignment {
  if (url.includes("ssu_um")) {
    return { offsetX: 0, offsetZ: -0.45 };
  }

  return { offsetX: 0, offsetZ: 0 };
}

function projectPanelsToModel(
  panels: ExportedPanel[],
  scene: THREE.Object3D,
  scale: number,
  alignment: PanelAlignment,
  bounds?: ModelBounds,
) {
  const raycaster = new THREE.Raycaster();
  const direction = new THREE.Vector3(0, -1, 0);
  const meshes: THREE.Mesh[] = [];
  scene.updateMatrixWorld(true);
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) meshes.push(object);
  });

  const topY = bounds?.maxY ?? 1;
  const rayStartY = topY + 1;
  return panels.map((panel) => {
    const position = panel.position_model;
    const alignedX = position.x + alignment.offsetX;
    const alignedZ = position.z + alignment.offsetZ;
    const quaternion = panel.orientation.quaternion;
    const panelQuat = new THREE.Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
    const panelNormal = new THREE.Vector3(0, 1, 0).applyQuaternion(panelQuat).normalize();
    const panelDepth = Math.max(panel.panelSpec.depth * scale, 0.003);
    const origin = new THREE.Vector3(alignedX, rayStartY, alignedZ);

    raycaster.set(origin, direction);
    const hits = raycaster.intersectObjects(meshes, false);
    const hit = findHighestRoofHit(hits);
    if (!hit) return panel;

    return {
      ...panel,
      position_model: {
        x: alignedX,
        y: hit.point.y + Math.abs(panelNormal.y) * (panelDepth / 2 + 0.002),
        z: alignedZ,
      },
    };
  });
}

function findHighestRoofHit(hits: THREE.Intersection[]) {
  if (hits.length === 0) return null;

  const scoredHits = hits
    .map((hit) => ({
      hit,
      normalY: getWorldNormalY(hit),
    }))
    .sort((a, b) => b.hit.point.y - a.hit.point.y);

  return scoredHits.find(({ normalY }) => normalY > 0.08)?.hit ?? scoredHits[0].hit;
}

function getWorldNormalY(hit: THREE.Intersection) {
  if (!hit.face) return 0;
    const normal = hit.face.normal.clone();
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld);
    normal.applyMatrix3(normalMatrix).normalize();
  return normal.y;
}
