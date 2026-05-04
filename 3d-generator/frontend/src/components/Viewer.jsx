import { Suspense, useMemo } from "react";
import { ContactShadows, Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Box } from "lucide-react";
import * as THREE from "three";

const materials = {
  body: new THREE.MeshBasicMaterial({
    color: "#e7e2d8",
    side: THREE.DoubleSide,
  }),
  roof: new THREE.MeshBasicMaterial({
    color: "#8c5f45",
    side: THREE.DoubleSide,
  }),
  panel: new THREE.MeshBasicMaterial({
    color: "#1565c0",
    side: THREE.DoubleSide,
  }),
  porch: new THREE.MeshBasicMaterial({
    color: "#b7bbc1",
    side: THREE.DoubleSide,
  }),
  vent: new THREE.MeshBasicMaterial({
    color: "#4b5563",
    side: THREE.DoubleSide,
  }),
};

function classifyMesh(name) {
  const key = name.toLowerCase();
  if (key.includes("solar")) return "panel";
  if (key.includes("roof")) return "roof";
  if (key.includes("porch")) return "porch";
  if (key.includes("vent")) return "vent";
  return "body";
}

function addEdges(mesh) {
  const edges = new THREE.EdgesGeometry(mesh.geometry, 25);
  const lines = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({
      color: "#334155",
      transparent: true,
      opacity: 0.18,
    })
  );
  lines.name = `${mesh.name || "mesh"}_edges`;
  mesh.add(lines);
}

function GeneratedModel({ url }) {
  const gltf = useGLTF(url);

  const scene = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((object) => {
      if (!object.isMesh) return;
      object.castShadow = true;
      object.receiveShadow = true;
      object.material = materials[classifyMesh(object.name)];
      addEdges(object);
    });
    return clone;
  }, [gltf.scene]);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <primitive object={scene} />
    </group>
  );
}

export default function Viewer({ modelUrl }) {
  return (
    <section className="relative min-h-[620px] overflow-hidden rounded-lg border border-white/10 bg-slate-900 shadow-2xl shadow-slate-950/30 lg:min-h-[calc(100vh-132px)]">
      <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-xs font-medium text-slate-200 shadow-lg backdrop-blur-md">
        Drag to orbit · Scroll to zoom · Right-drag to pan
      </div>

      {modelUrl ? (
        <Canvas
          shadows
          camera={{ position: [22, 18, 22], fov: 38, near: 0.1, far: 200 }}
          onCreated={({ camera }) => {
            camera.lookAt(0, 4, 0);
            camera.updateProjectionMatrix();
          }}
        >
          <color attach="background" args={["#e8eef5"]} />
          <fog attach="fog" args={["#e8eef5", 58, 110]} />
          <ambientLight intensity={1.35} />
          <hemisphereLight args={["#ffffff", "#94a3b8", 1.1]} />
          <directionalLight
            castShadow
            position={[18, 28, 24]}
            intensity={3.4}
            shadow-mapSize={[2048, 2048]}
          />
          <Suspense fallback={null}>
            <GeneratedModel url={modelUrl} />
            <Environment preset="city" />
            <ContactShadows
              position={[0, -0.02, 0]}
              opacity={0.42}
              scale={42}
              blur={2.4}
              far={18}
            />
          </Suspense>
          <OrbitControls
            makeDefault
            enablePan
            enableZoom
            enableRotate
            target={[0, 4, 0]}
            minDistance={10}
            maxDistance={80}
          />
          <gridHelper args={[48, 48, "#9aa8b8", "#cbd5e1"]} position={[0, -0.04, 0]} />
        </Canvas>
      ) : (
        <div className="flex h-full min-h-[620px] flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/10 backdrop-blur-md">
            <Box className="h-7 w-7 text-emerald-300" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">No model generated yet</h2>
            <p className="mt-1 max-w-md text-sm leading-6 text-slate-300">
              Enter bungalow dimensions and generate a parametric GLB to inspect it here.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
