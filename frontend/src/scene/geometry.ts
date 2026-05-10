import * as THREE from "three";

/** Procedural rooftop geometry — hip roof on rectangular footprint.
 * Mirrors the parametric build in `3d-generator/backend/model_generator._hip_roof`
 * so the placeholder mesh matches the engine's mental model. */

export interface RoofConfig {
  length: number;
  width: number;
  height: number;
  pitchDeg: number;
  ridgeRatio: number;
}

export const buildHipRoof = (cfg: RoofConfig) => {
  const { length, width, height, pitchDeg, ridgeRatio } = cfg;
  const halfL = length / 2;
  const halfW = width / 2;
  const rise = Math.tan((pitchDeg * Math.PI) / 180) * halfW;
  const ridgeHalf = Math.max(0.3, halfL * ridgeRatio);

  const v = [
    [-halfL, height, -halfW],
    [halfL, height, -halfW],
    [halfL, height, halfW],
    [-halfL, height, halfW],
    [-ridgeHalf, height + rise, 0],
    [ridgeHalf, height + rise, 0],
  ] as const;

  const faces = [
    // south slope
    [0, 1, 5],
    [0, 5, 4],
    // north slope
    [3, 4, 5],
    [3, 5, 2],
    // east hip
    [1, 2, 5],
    // west hip
    [0, 4, 3],
  ];

  const geom = new THREE.BufferGeometry();
  const positions: number[] = [];
  const normals: number[] = [];

  for (const f of faces) {
    const a = v[f[0]];
    const b = v[f[1]];
    const c = v[f[2]];
    positions.push(...a, ...b, ...c);
    const ab = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const ac = new THREE.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    const n = ab.cross(ac).normalize();
    normals.push(n.x, n.y, n.z, n.x, n.y, n.z, n.x, n.y, n.z);
  }

  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geom.computeBoundingBox();
  geom.computeBoundingSphere();

  return { geom, ridgeRise: rise, ridgeHalf };
};

export interface PanelPlacement {
  x: number;
  z: number;
  yawDeg: number;
  tiltDeg: number;
  baseY: number;
  shadingFactor: number;
}

/** Greedy panel pack on south slope of hip roof.
 * Returns center xy positions in the slope's local frame, oriented up-slope. */
export const packPanelsOnSouthSlope = ({
  length,
  width,
  pitchDeg,
  ridgeRatio,
  edgeSetback,
  panelGap,
  panelW = 1.3,
  panelH = 2.4,
  obstacleAt,
  obstacleSetback,
}: {
  length: number;
  width: number;
  pitchDeg: number;
  ridgeRatio: number;
  edgeSetback: number;
  panelGap: number;
  panelW?: number;
  panelH?: number;
  obstacleAt?: { x: number; z: number; r: number };
  obstacleSetback: number;
}): PanelPlacement[] => {
  const placements: PanelPlacement[] = [];
  const halfL = length / 2;
  const halfW = width / 2;
  const rise = Math.tan((pitchDeg * Math.PI) / 180) * halfW;
  const slopeLen = Math.sqrt(halfW * halfW + rise * rise);
  const ridgeHalf = halfL * ridgeRatio;

  const usableSlope = slopeLen - 2 * edgeSetback;
  const cols = Math.floor((usableSlope + panelGap) / (panelH + panelGap));
  const rowsPossible = Math.floor((length - 2 * edgeSetback + panelGap) / (panelW + panelGap));

  const startSlope = -slopeLen / 2 + edgeSetback + panelH / 2;
  const startX = -length / 2 + edgeSetback + panelW / 2;

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rowsPossible; r++) {
      const sLocal = startSlope + c * (panelH + panelGap);
      const xLocal = startX + r * (panelW + panelGap);

      // Drop panels near hip cuts
      const ridgeMargin = (1 - ridgeRatio) * halfL * 0.9;
      if (Math.abs(xLocal) > halfL - ridgeMargin) continue;

      // Convert slope-coord to world (south slope)
      const t = (sLocal + slopeLen / 2) / slopeLen; // 0..1 from eave to ridge
      const z = halfW - t * halfW;
      const y = t * rise;

      // obstacle skip
      if (obstacleAt) {
        const dx = xLocal - obstacleAt.x;
        const dz = z - obstacleAt.z;
        if (Math.sqrt(dx * dx + dz * dz) < obstacleAt.r + obstacleSetback) continue;
      }

      // Shading factor: lower near obstacle
      let shadingFactor = 1;
      if (obstacleAt) {
        const dx = xLocal - obstacleAt.x;
        const dz = z - obstacleAt.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const influence = Math.max(0, 1 - dist / (obstacleAt.r * 4));
        shadingFactor = 1 - influence * 0.42;
      }
      // Slight degradation toward hips
      shadingFactor *= 0.94 + 0.06 * (1 - Math.abs(xLocal) / halfL);

      placements.push({
        x: xLocal,
        z,
        yawDeg: 0,
        tiltDeg: pitchDeg,
        baseY: y,
        shadingFactor,
      });
    }
  }
  return placements;
};

/** Sun position from solar hour, latitude.
 * Simplified equator-leaning model — for placeholder demo only. */
export const sunPositionFromHour = (hour: number, latitude = 3) => {
  const t = (hour - 6) / 12; // 0..1 sunrise → sunset
  const arcRadius = 22;
  const x = arcRadius * Math.cos(Math.PI * t); // +R east → -R west
  const y = Math.max(0.6, arcRadius * Math.sin(Math.PI * t));
  const z = Math.sin((latitude * Math.PI) / 180) * arcRadius * 0.3; // slight north
  return new THREE.Vector3(x, y, z);
};
