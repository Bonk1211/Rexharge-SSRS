import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Bounds,
  ContactShadows,
  Html,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import RoofScene from "@/scene/RoofScene";
import { useSignedUrl } from "@/store/projects-store";
import type { Project } from "@/data/mock-projects";

function GlbModel({ url }: { url: string }) {
  const gltf = useGLTF(url);
  const scene = useMemo(() => {
    const clone = gltf.scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    clone.position.set(-center.x, -box.min.y, -center.z);
    return clone;
  }, [gltf.scene]);
  return <primitive object={scene} />;
}

function LoadingBadge() {
  return (
    <Html center>
      <div className="mono text-[9px] uppercase tracking-[0.18em] text-mute">
        loading model
      </div>
    </Html>
  );
}

export default function Mini3DPreview({ project }: { project: Project }) {
  const { data: glbUrl } = useSignedUrl(
    project.modelGlbPath ? "project-models" : undefined,
    project.modelGlbPath ?? undefined,
  );

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={
        glbUrl
          ? { position: [3.8, 2.6, 4.6], fov: 42, near: 0.1, far: 100 }
          : { position: [16, 12, 18], fov: 38, near: 0.1, far: 200 }
      }
      style={{ background: "transparent" }}
      gl={{ antialias: true, powerPreference: "low-power" }}
    >
      <color attach="background" args={["#f7f5ef"]} />
      <ambientLight intensity={0.9} />
      <hemisphereLight args={["#ffffff", "#94a3b8", 1.0]} />
      <directionalLight position={[5, 7, 6]} intensity={2.2} />
      <Suspense fallback={<LoadingBadge />}>
        {glbUrl ? (
          <Bounds fit clip observe margin={1.4}>
            <GlbModel url={glbUrl} />
          </Bounds>
        ) : (
          <RoofScene />
        )}
        <ContactShadows
          position={[0, -0.01, 0]}
          opacity={0.28}
          scale={8}
          blur={2.6}
          far={8}
        />
      </Suspense>
      <OrbitControls
        makeDefault
        autoRotate
        autoRotateSpeed={0.9}
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
      />
    </Canvas>
  );
}
