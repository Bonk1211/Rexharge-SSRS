import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
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
import { useGlbUrl } from "@/lib/glb-url";
import type { Project } from "@/data/projects";

class GlbErrorBoundary extends Component<
  { onError: () => void; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: unknown) {
    console.warn("[Mini3DPreview] GLB load failed:", err);
    this.props.onError();
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

function GlbModel({ url, onLoaded }: { url: string; onLoaded: () => void }) {
  const gltf = useGLTF(url);
  const scene = useMemo(() => {
    const clone = gltf.scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    clone.position.set(-center.x, -box.min.y, -center.z);
    return clone;
  }, [gltf.scene]);
  useEffect(() => {
    onLoaded();
  }, [scene, onLoaded]);
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
  const glbUrl = useGlbUrl(project.modelGlbPath);
  const [meshLoaded, setMeshLoaded] = useState(false);
  const [glbFailed, setGlbFailed] = useState(false);
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const handleLoaded = useCallback(() => setMeshLoaded(true), []);
  const handleGlbError = useCallback(() => setGlbFailed(true), []);
  const showThumbnail = !!project.thumbnailUrl && !thumbnailFailed;
  const showGlb = !!glbUrl && !glbFailed;

  return (
    <div className="absolute inset-0">
      {showThumbnail && (
        <img
          src={project.thumbnailUrl ?? undefined}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 pointer-events-none"
          style={{ opacity: meshLoaded && showGlb ? 0 : 1 }}
          onError={() => setThumbnailFailed(true)}
        />
      )}
      <Canvas
        dpr={[1, 1.5]}
        camera={
          showGlb
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
          {showGlb ? (
            <GlbErrorBoundary onError={handleGlbError}>
              <Bounds fit clip observe margin={1.4}>
                <GlbModel url={glbUrl!} onLoaded={handleLoaded} />
              </Bounds>
            </GlbErrorBoundary>
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
    </div>
  );
}
