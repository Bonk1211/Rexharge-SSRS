import { Suspense, useMemo } from "react";
import {
  Bounds,
  ContactShadows,
  Environment,
  Html,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Box, Image, Loader2 } from "lucide-react";
import * as THREE from "three";

function GeneratedModel({ url }) {
  const gltf = useGLTF(url);

  const scene = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((object) => {
      if (!object.isMesh) return;
      object.castShadow = true;
      object.receiveShadow = true;
    });

    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    clone.position.set(-center.x, -box.min.y, -center.z);

    return clone;
  }, [gltf.scene]);

  return <primitive object={scene} />;
}

function ModelFallback() {
  return (
    <Html center>
      <div className="flex items-center gap-2 rounded-full border border-[#dedbd1] bg-[#fffefa] px-4 py-2 text-sm font-semibold text-[#18211d] shadow-xl">
        <Loader2 className="h-4 w-4 animate-spin text-[#4d9d44]" aria-hidden="true" />
        Loading model
      </div>
    </Html>
  );
}

function EmptyState({ stage, progress, photoCount }) {
  const isProcessing = stage === "processing";
  const hasPhotos = photoCount > 0;

  return (
    <div className="flex h-full min-h-[560px] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#dedbd1] bg-[#f2f0ea]">
        {isProcessing ? (
          <Loader2 className="h-8 w-8 animate-spin text-[#4d9d44]" aria-hidden="true" />
        ) : hasPhotos ? (
          <Box className="h-8 w-8 text-[#4d9d44]" aria-hidden="true" />
        ) : (
          <Image className="h-8 w-8 text-[#7d8780]" aria-hidden="true" />
        )}
      </div>
      <div>
        <h2 className="text-xl font-semibold text-[#18211d]">
          {isProcessing ? "Building 3D render" : hasPhotos ? "Photos imported" : "Awaiting photos"}
        </h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-[#768079]">
          {isProcessing
            ? "The demo is processing the uploaded references and preparing the textured model."
            : hasPhotos
              ? "Start generation to show the processing state and reveal the 3D result."
              : "Import rooftop photos to begin the demo flow."}
        </p>
      </div>
      {isProcessing && (
        <div className="w-full max-w-sm">
          <div className="mb-2 flex items-center justify-between font-mono text-xs font-medium uppercase tracking-wider text-[#7d8780]">
            <span>Processing</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#ece8dd]">
            <div
              className="h-full rounded-full bg-[#62b859] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Viewer({ modelUrl, stage, progress, photoCount }) {
  return (
    <section className="relative min-h-[560px] overflow-hidden rounded-xl border border-[#dedbd1] bg-[#f7f5ef] lg:min-h-[680px]">
      <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-full bg-[#ddf2d5] px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#4d9d44]">
        3D preview · Hunyuan GLB
      </div>

      {modelUrl ? (
        <Canvas
          shadows
          camera={{ position: [3.8, 2.6, 4.6], fov: 42, near: 0.1, far: 100 }}
          onCreated={({ camera }) => {
            camera.lookAt(0, 0.75, 0);
            camera.updateProjectionMatrix();
          }}
        >
          <color attach="background" args={["#f7f5ef"]} />
          <fog attach="fog" args={["#f7f5ef", 18, 42]} />
          <ambientLight intensity={0.9} />
          <hemisphereLight args={["#ffffff", "#94a3b8", 1.2]} />
          <directionalLight
            castShadow
            position={[5, 7, 6]}
            intensity={2.8}
            shadow-mapSize={[2048, 2048]}
          />
          <Suspense fallback={<ModelFallback />}>
            <Bounds fit clip observe margin={1.35}>
              <GeneratedModel url={modelUrl} />
            </Bounds>
            <Environment preset="city" />
            <ContactShadows
              position={[0, -0.01, 0]}
              opacity={0.36}
              scale={8}
              blur={2.4}
              far={8}
            />
          </Suspense>
          <OrbitControls
            makeDefault
            autoRotate
            autoRotateSpeed={0.75}
            enablePan
            enableZoom
            enableRotate
            minDistance={1.5}
            maxDistance={18}
          />
          <gridHelper args={[8, 24, "#d9d4c8", "#e8e3d8"]} position={[0, 0, 0]} />
        </Canvas>
      ) : (
        <EmptyState stage={stage} progress={progress} photoCount={photoCount} />
      )}
    </section>
  );
}

useGLTF.preload("/models/hunyuan_textured_768.glb");
