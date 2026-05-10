import { useMemo } from "react";
import { Grid, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useViewerStore } from "@/store/viewer-store";
import {
  buildHipRoof,
  packPanelsOnSouthSlope,
  sunPositionFromHour,
} from "./geometry";
import { createSolarPanelTexture } from "./solar-panel-texture";

const ROOF = {
  length: 14,
  width: 9,
  height: 4,
  pitchDeg: 22,
  ridgeRatio: 0.56,
};
const OBSTACLE = { x: 4.5, z: 1.6, r: 0.7, h: 1.6 };

export default function RoofScene() {
  const layers = useViewerStore((s) => s.layers);
  const hour = useViewerStore((s) => s.hour);
  const edgeSetback = useViewerStore((s) => s.edgeSetback);
  const obstacleSetback = useViewerStore((s) => s.obstacleSetback);
  const panelGap = useViewerStore((s) => s.panelGap);
  const selectedPanel = useViewerStore((s) => s.selectedPanel);
  const setSelectedPanel = useViewerStore((s) => s.setSelectedPanel);

  const { geom } = useMemo(() => buildHipRoof(ROOF), []);
  const panelTexture = useMemo(() => createSolarPanelTexture(), []);
  const panels = useMemo(
    () =>
      packPanelsOnSouthSlope({
        length: ROOF.length,
        width: ROOF.width,
        pitchDeg: ROOF.pitchDeg,
        ridgeRatio: ROOF.ridgeRatio,
        edgeSetback,
        panelGap,
        obstacleSetback,
        obstacleAt: { x: OBSTACLE.x, z: OBSTACLE.z, r: OBSTACLE.r },
      }),
    [edgeSetback, panelGap, obstacleSetback],
  );

  const sun = useMemo(() => sunPositionFromHour(hour), [hour]);

  return (
    <>
      <ambientLight intensity={0.55} color="#FAFAF7" />
      <hemisphereLight args={["#FFFFFF", "#E4E1D8", 0.6]} />
      <directionalLight
        position={[sun.x, sun.y, sun.z]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* Ground plane / blueprint floor */}
      {layers.grid && (
        <Grid
          args={[120, 120]}
          cellSize={1}
          sectionSize={4}
          cellThickness={0.5}
          sectionThickness={0.8}
          cellColor="#E4E1D8"
          sectionColor="#9CA39F"
          fadeDistance={60}
          fadeStrength={1.5}
          infiniteGrid
        />
      )}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.001, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#F2F0EA" roughness={0.95} />
      </mesh>

      {/* Building walls */}
      {layers.mesh && (
        <mesh position={[0, ROOF.height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[ROOF.length, ROOF.height, ROOF.width]} />
          <meshStandardMaterial color="#EDEAE0" roughness={0.7} metalness={0.05} />
        </mesh>
      )}

      {/* Hip roof */}
      {layers.mesh && (
        <mesh geometry={geom} castShadow receiveShadow>
          <meshStandardMaterial color="#3A4441" roughness={0.55} metalness={0.18} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Roof plane fill highlight */}
      {layers.planes && <SouthSlopeOverlay />}

      {/* Panels */}
      {layers.panels &&
        panels.map((p, i) => (
          <PanelMesh
            key={i}
            x={p.x}
            z={p.z}
            baseY={ROOF.height + p.baseY}
            tilt={p.tiltDeg}
            shadingFactor={p.shadingFactor}
            showShading={layers.shading}
            texture={panelTexture}
            selected={selectedPanel === i}
            onClick={() => setSelectedPanel(selectedPanel === i ? null : i)}
          />
        ))}

      {/* Obstacle (water tank) */}
      {layers.obstacles && (
        <group position={[OBSTACLE.x, ROOF.height + obstacleHeightOnSlope(OBSTACLE.x, OBSTACLE.z), OBSTACLE.z]}>
          <mesh castShadow>
            <cylinderGeometry args={[OBSTACLE.r, OBSTACLE.r, OBSTACLE.h, 24]} />
            <meshStandardMaterial color="#E07856" roughness={0.4} metalness={0.3} />
          </mesh>
          {/* Setback halo on roof surface */}
          <mesh rotation-x={-Math.PI / 2} position={[0, -OBSTACLE.h / 2 + 0.02, 0]}>
            <ringGeometry args={[OBSTACLE.r + 0.02, OBSTACLE.r + obstacleSetback, 48]} />
            <meshBasicMaterial color="#E07856" transparent opacity={0.32} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {/* Sun + sun-path arc */}
      {layers.sunpath && <SunRig position={sun} />}

      {/* North arrow on ground */}
      <NorthMarker />

      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={8}
        maxDistance={50}
        target={[0, ROOF.height / 2, 0]}
      />
    </>
  );
}

const obstacleHeightOnSlope = (x: number, z: number) => {
  // Simplified: water tank base sits on south slope at z>0
  const halfW = ROOF.width / 2;
  const t = Math.max(0, Math.min(1, (halfW - z) / halfW));
  return t * Math.tan((ROOF.pitchDeg * Math.PI) / 180) * halfW + OBSTACLE.h / 2;
};

const PanelMesh = ({
  x,
  z,
  baseY,
  tilt,
  shadingFactor,
  showShading,
  texture,
  selected,
  onClick,
}: {
  x: number;
  z: number;
  baseY: number;
  tilt: number;
  shadingFactor: number;
  showShading: boolean;
  texture: THREE.Texture;
  selected: boolean;
  onClick: () => void;
}) => {
  const tiltRad = (tilt * Math.PI) / 180;
  const color = showShading
    ? heatColor(shadingFactor)
    : selected
    ? "#F4B82E"
    : "#FFFFFF";
  const materials = useMemo(() => {
    const edgeMat = new THREE.MeshStandardMaterial({
      color: "#8995A1",
      metalness: 0.55,
      roughness: 0.28,
    });
    const backMat = new THREE.MeshStandardMaterial({
      color: "#111924",
      metalness: 0.35,
      roughness: 0.5,
    });
    const faceMat = new THREE.MeshStandardMaterial({
      map: texture,
      color,
      metalness: 0.42,
      roughness: 0.26,
    });

    return [edgeMat, edgeMat, faceMat, backMat, edgeMat, edgeMat];
  }, [color, texture]);

  return (
    <group position={[x, baseY + 0.05, z]} rotation={[tiltRad, 0, 0]} onClick={onClick}>
      <mesh castShadow receiveShadow material={materials}>
        <boxGeometry args={[1.3, 0.04, 2.4]} />
      </mesh>
      {selected && (
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[1.36, 0.001, 2.46]} />
          <meshBasicMaterial color="#F4B82E" />
        </mesh>
      )}
    </group>
  );
};

const heatColor = (f: number) => {
  // 1 → leaf green, 0.6 → warm gold, 0.3 → terracotta
  type Stop = [number, [number, number, number]];
  const stops: Stop[] = [
    [0.3, [224, 120, 86]],
    [0.6, [244, 184, 46]],
    [0.85, [193, 234, 227]],
    [1.0, [93, 185, 77]],
  ];
  let lo: Stop = stops[0];
  let hi: Stop = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (f >= stops[i][0] && f <= stops[i + 1][0]) {
      lo = stops[i];
      hi = stops[i + 1];
      break;
    }
  }
  const t = (f - lo[0]) / (hi[0] - lo[0] || 1);
  const r = Math.round(lo[1][0] + t * (hi[1][0] - lo[1][0]));
  const g = Math.round(lo[1][1] + t * (hi[1][1] - lo[1][1]));
  const b = Math.round(lo[1][2] + t * (hi[1][2] - lo[1][2]));
  return `rgb(${r}, ${g}, ${b})`;
};

/* Translucent quad over south slope highlighting "detected plane" */
const SouthSlopeOverlay = () => {
  const halfL = ROOF.length / 2;
  const halfW = ROOF.width / 2;
  const ridgeHalf = halfL * ROOF.ridgeRatio;
  const rise = Math.tan((ROOF.pitchDeg * Math.PI) / 180) * halfW;

  const corners: [number, number, number][] = [
    [-halfL, ROOF.height + 0.02, halfW],
    [halfL, ROOF.height + 0.02, halfW],
    [ridgeHalf, ROOF.height + rise + 0.02, 0],
    [-ridgeHalf, ROOF.height + rise + 0.02, 0],
  ];
  const positions = new Float32Array(corners.flat());
  const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geom.setIndex(new THREE.BufferAttribute(indices, 1));
  geom.computeVertexNormals();

  const outline = [...corners, corners[0]];

  return (
    <>
      <mesh geometry={geom}>
        <meshBasicMaterial color="#5DB94D" transparent opacity={0.16} side={THREE.DoubleSide} />
      </mesh>
      <Line points={outline} color="#3D8D2F" lineWidth={1.4} />
    </>
  );
};

const SunRig = ({ position }: { position: THREE.Vector3 }) => {
  const arcPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      const x = 22 * Math.cos(Math.PI * t);
      const y = Math.max(0.6, 22 * Math.sin(Math.PI * t));
      const z = 0.3 * 22 * 0.05;
      pts.push([x, y, z]);
    }
    return pts;
  }, []);

  return (
    <>
      <Line points={arcPoints} color="#F4B82E" lineWidth={1} dashed dashSize={0.6} gapSize={0.3} />
      <mesh position={position}>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshBasicMaterial color="#F4B82E" />
      </mesh>
      <mesh position={position}>
        <sphereGeometry args={[1.0, 24, 24]} />
        <meshBasicMaterial color="#F4B82E" transparent opacity={0.18} />
      </mesh>
    </>
  );
};

const NorthMarker = () => (
  <group position={[-9, 0.02, -7]}>
    <mesh rotation-x={-Math.PI / 2}>
      <ringGeometry args={[0.7, 0.85, 32]} />
      <meshBasicMaterial color="#1A1F1C" />
    </mesh>
    <mesh position={[0, 0.03, -0.6]} rotation-x={-Math.PI / 2}>
      <coneGeometry args={[0.18, 0.5, 12]} />
      <meshBasicMaterial color="#5DB94D" />
    </mesh>
  </group>
);
