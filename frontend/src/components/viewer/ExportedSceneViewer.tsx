import { Canvas } from "@react-three/fiber";
import { Bounds, Grid, Html, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import CrosshairCorners from "./CrosshairCorners";
import NorthRose from "./NorthRose";
import CoordReadout from "./CoordReadout";
import { createSolarPanelTexture } from "@/scene/solar-panel-texture";

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

  useEffect(() => {
    let cancelled = false;

    fetch(report.site.modelUrl, { method: "HEAD" })
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
  }, [report.site.modelUrl]);

  const uniquePanels = useMemo(() => dedupePanels(report.panels), [report.panels]);

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-blueprint cursor-crosshair-leaf"
      style={{ border: "1px solid var(--rule)", aspectRatio: "16/9", minHeight: 520 }}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [1.8, 1.35, 2.2], fov: 38, near: 0.01, far: 100 }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={<LoadingLabel />}>
          <ExportedScene report={report} panels={uniquePanels} modelAvailable={modelAvailable} />
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

function ExportedScene({
  report,
  panels,
  modelAvailable,
}: {
  report: ExportedSceneReport;
  panels: ExportedPanel[];
  modelAvailable: boolean;
}) {
  const bounds = report.buildingIsolation?.modelBounds;
  const clipBounds = report.buildingIsolation?.clipBounds_model;
  const gridY = (bounds?.minY ?? 0) - 0.25;
  const panelTexture = useMemo(() => createSolarPanelTexture(), []);

  return (
    <>
      <ambientLight intensity={0.85} />
      <hemisphereLight args={["#ffffff", "#d8ddd8", 1.1]} />
      <directionalLight castShadow position={[2.8, 4, 3]} intensity={2.1} shadow-mapSize={[2048, 2048]} />

      <Grid
        position={[0, gridY, 0]}
        args={[12, 12]}
        cellSize={0.1}
        sectionSize={0.5}
        cellThickness={0.45}
        sectionThickness={0.8}
        cellColor="#E4E1D8"
        sectionColor="#9CA39F"
        fadeDistance={8}
        fadeStrength={1.35}
        infiniteGrid
      />

      <Bounds fit clip observe margin={1.45}>
        <group>
          {modelAvailable ? (
            <ReportModelWithPanels
              url={report.site.modelUrl}
              panels={panels}
              scale={report.buildingIsolation?.modelScale ?? 0.063}
              bounds={bounds}
              clipBounds={clipBounds}
              texture={panelTexture}
            />
          ) : (
            <>
              <BoundsPlaceholder bounds={bounds} />
              {panels.map((panel) => (
                <ReportPanel
                  key={panel.index}
                  panel={panel}
                  scale={report.buildingIsolation?.modelScale ?? 0.063}
                  texture={panelTexture}
                />
              ))}
            </>
          )}
        </group>
      </Bounds>

      <OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={0.45} maxDistance={8} />
    </>
  );
}

function ReportModelWithPanels({
  url,
  panels,
  scale,
  bounds,
  clipBounds,
  texture,
}: {
  url: string;
  panels: ExportedPanel[];
  scale: number;
  bounds?: ModelBounds;
  clipBounds?: ClipBounds;
  texture: THREE.Texture;
}) {
  const gltf = useGLTF(url);
  const panelAlignment = useMemo(() => getPanelAlignment(url), [url]);
  // Unclipped scene clone used for raycasting (so rays always hit the full roof)
  const raycastScene = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.updateMatrixWorld(true);
    clone.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
    return clone;
  }, [gltf.scene]);
  // Clipped scene clone used for display
  const displayScene = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.updateMatrixWorld(true);
    clone.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
      if (clipBounds) clipMeshToBounds(object, clipBounds);
    });
    return clone;
  }, [clipBounds, gltf.scene]);
  const projectedPanels = useMemo(
    () => projectPanelsToModel(panels, raycastScene, scale, panelAlignment, bounds),
    [bounds, panelAlignment, panels, scale, raycastScene],
  );

  return (
    <>
      <primitive object={displayScene} />
      {projectedPanels.map((panel) => (
        <ReportPanel key={panel.index} panel={panel} scale={scale} texture={texture} />
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

function ReportPanel({ panel, scale, texture }: { panel: ExportedPanel; scale: number; texture: THREE.Texture }) {
  const { position_model: position, orientation, panelSpec } = panel;
  const quaternion = orientation.quaternion;
  const isLandscape = panel.panelOrientation === "landscape";
  const width = (isLandscape ? panelSpec.height : panelSpec.width) * scale;
  const height = (isLandscape ? panelSpec.width : panelSpec.height) * scale;
  const depth = Math.max(panelSpec.depth * scale, 0.003);
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

  return (
    <group
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
