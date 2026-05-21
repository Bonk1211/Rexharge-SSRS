import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  Bounds,
  ContactShadows,
  Html,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  ArrowsClockwise,
  CheckCircle,
  Cube,
  ImageSquare,
  Trash,
} from "@phosphor-icons/react";
import * as THREE from "three";
import {
  DEMO_PHOTO_SET_SAMPLE_HOUSE_3,
  loadDemoPhotoFiles,
} from "@/data/demo-photos";

const MODEL_URL = "/models/econ_horizon_3D.glb";

type Stage = "idle" | "processing" | "done";

interface ImportedPhoto {
  id: string;
  name: string;
  size: number;
  url: string;
  originalFile: File;
}

const stages = [
  ["Add", "Photos imported"],
  ["Build", "Reconstructing"],
  ["Done", "Model ready"],
] as const;

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function createPhoto(file: File): ImportedPhoto {
  return {
    id: `${file.name}-${file.lastModified}-${createId()}`,
    name: file.name,
    size: file.size,
    url: URL.createObjectURL(file),
    originalFile: file,
  };
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function Workspace3DSection({ onComplete }: { onComplete?: (photos: File[], glbUrl: string) => void }) {
  const [photos, setPhotos] = useState<ImportedPhoto[]>([]);
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [modelUrl, setModelUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const photosRef = useRef<ImportedPhoto[]>([]);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.url));
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  function clearTimers() {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }

  function applyPhotos(rawFiles: File[]) {
    const nextPhotos = rawFiles
      .filter((file) => file.type.startsWith("image/"))
      .map(createPhoto)
      .slice(0, 8);

    if (nextPhotos.length === 0) return;

    clearTimers();
    photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.url));
    photosRef.current = nextPhotos;
    setPhotos(nextPhotos);
    setStage("idle");
    setProgress(0);
    setModelUrl("");
  }

  async function loadDemoPhotos() {
    if (loading) return;
    setLoading(true);
    try {
      const files = await loadDemoPhotoFiles(DEMO_PHOTO_SET_SAMPLE_HOUSE_3);
      applyPhotos(files);
    } catch (err) {
      console.error("Failed to load demo photos:", err);
    } finally {
      setLoading(false);
    }
  }

  function removePhoto(id: string) {
    const target = photosRef.current.find((photo) => photo.id === id);
    if (target) URL.revokeObjectURL(target.url);
    const nextPhotos = photosRef.current.filter((photo) => photo.id !== id);
    photosRef.current = nextPhotos;
    setPhotos(nextPhotos);

    if (nextPhotos.length === 0) {
      clearTimers();
      setStage("idle");
      setProgress(0);
      setModelUrl("");
    }
  }

  function generateRender() {
    if (photos.length === 0 || stage === "processing") return;

    clearTimers();
    setStage("processing");
    setProgress(8);
    setModelUrl("");

    const steps: Array<[number, number]> = [
      [550, 22],
      [1150, 43],
      [1850, 67],
      [2600, 88],
      [3300, 100],
    ];

    timersRef.current = [
      ...steps.map(([delay, value]) => window.setTimeout(() => setProgress(value), delay)),
      window.setTimeout(() => {
        setModelUrl(MODEL_URL);
        setStage("done");
        if (onComplete) {
          onComplete(photosRef.current.map(p => p.originalFile), MODEL_URL);
        }
      }, 3600),
    ];
  }

  return (
    <section className="w-full" id="workspace-3d">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="numeral text-[22px] leading-[1.05] text-ink" style={{ fontWeight: 600 }}>
            Create 3D from photos.
          </h2>
          <p className="mt-1 text-[12px] text-mute">
            Built from {DEMO_PHOTO_SET_SAMPLE_HOUSE_3.length} rooftop photos in ~4 s.
          </p>
        </div>
        <span
          className="mono text-[10px] uppercase tracking-[0.18em] text-leaf-deep px-2.5 py-1 rounded-full"
          style={{ background: "var(--leaf-tint)" }}
        >
          Sample House 3
        </span>
      </div>

      <div
        className="grid gap-3 rounded-2xl bg-surface p-4 shadow-soft lg:grid-cols-[3fr_2fr]"
        style={{ border: "1px solid var(--rule)" }}
      >
        <ModelViewer modelUrl={modelUrl} stage={stage} progress={progress} photoCount={photos.length} />
        <ImportPanel
          photos={photos}
          stage={stage}
          progress={progress}
          onLoadDemo={loadDemoPhotos}
          loading={loading}
          onRemove={removePhoto}
          onGenerate={generateRender}
        />
      </div>

      {stage === "done" && (
        <div className="mt-3 flex items-center justify-end gap-2">
          <a
            href={MODEL_URL}
            download="reconstructed_model.glb"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-leaf-deep px-4 text-[12px] font-extrabold tracking-tight text-paper transition-colors hover:bg-leaf"
          >
            <Cube weight="duotone" size={14} />
            Download .glb
          </a>
          <button
            type="button"
            onClick={generateRender}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-surface px-4 text-[12px] font-extrabold tracking-tight text-ink transition-colors hover:bg-surface-2"
            style={{ border: "1px solid var(--rule)" }}
          >
            <ArrowsClockwise weight="bold" size={13} />
            Regenerate
          </button>
        </div>
      )}
    </section>
  );
}

function ImportPanel({
  photos,
  stage,
  progress,
  onLoadDemo,
  loading,
  onRemove,
  onGenerate,
}: {
  photos: ImportedPhoto[];
  stage: Stage;
  progress: number;
  onLoadDemo: () => void;
  loading: boolean;
  onRemove: (id: string) => void;
  onGenerate: () => void;
}) {
  const isProcessing = stage === "processing";
  const activeStep = stage === "done" ? 2 : isProcessing ? 1 : photos.length > 0 ? 0 : -1;

  return (
    <div className="flex flex-col gap-3 h-[320px] overflow-y-auto pr-1">
      <div
        className="rounded-xl bg-paper p-3 flex flex-col gap-2.5"
        style={{ border: "1px solid var(--rule)" }}
      >
        <div className="flex items-baseline justify-between">
          <div>
            <h3 className="text-[12.5px] font-extrabold tracking-tight text-ink">Use sample dataset</h3>
            <p className="mono text-[9.5px] uppercase tracking-[0.16em] text-mute mt-0.5">
              Sample House 3
            </p>
          </div>
          <div className="text-right">
            <p className="numeral text-[16px] tab-num leading-none" style={{ fontWeight: 600 }}>
              {DEMO_PHOTO_SET_SAMPLE_HOUSE_3.length}
            </p>
            <p className="mono text-[9px] uppercase tracking-[0.14em] text-mute">photos</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {DEMO_PHOTO_SET_SAMPLE_HOUSE_3.slice(0, 3).map((ref) => (
            <img
              key={ref.name}
              src={ref.url}
              alt=""
              className="aspect-[4/3] w-full rounded-md object-cover"
              style={{ border: "1px solid var(--rule)" }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={onLoadDemo}
          disabled={isProcessing || loading}
          className="flex h-8 w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 text-[11.5px] font-extrabold tracking-tight text-paper transition-colors hover:bg-ink-2 disabled:cursor-not-allowed disabled:bg-dim"
        >
          {loading ? (
            <ArrowsClockwise className="animate-spin" weight="bold" size={12} />
          ) : (
            <ImageSquare weight="duotone" size={13} />
          )}
          {loading ? "Loading…" : photos.length > 0 ? "Reload photos" : "Load photos"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {photos.length === 0
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`slot-${i}`}
                className="aspect-[4/3] rounded-lg bg-surface-2"
                style={{ border: "1px dashed var(--rule)" }}
              />
            ))
          : photos.map((photo, index) => (
              <figure
                key={photo.id}
                className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-surface-2"
                style={{ border: "1px solid var(--rule)" }}
              >
                <img src={photo.url} alt={`Imported rooftop ${index + 1}`} className="h-full w-full object-cover" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-ink/75 px-2 py-1.5 text-[10px] text-paper backdrop-blur">
                  <span className="block truncate">{photo.name}</span>
                  <span className="text-paper/65">{formatSize(photo.size)}</span>
                </figcaption>
                <button
                  type="button"
                  onClick={() => onRemove(photo.id)}
                  disabled={isProcessing}
                  className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-ink/80 text-paper transition-colors hover:bg-crimson disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`Remove ${photo.name}`}
                >
                  <Trash weight="bold" size={13} />
                </button>
              </figure>
            ))}
      </div>

      <div className="rounded-xl bg-paper p-3" style={{ border: "1px solid var(--rule)" }}>
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-[12.5px] font-extrabold tracking-tight text-ink">
            {isProcessing ? "Generating…" : stage === "done" ? "Ready" : "Ready to generate"}
          </span>
          <span className="mono text-[10px] uppercase tracking-[0.14em] text-mute tab-num">
            {progress}%
          </span>
        </div>

        <ol className="grid gap-1.5">
          {stages.map(([label, description], index) => {
            const complete = activeStep > index;
            const active = activeStep === index;
            return (
              <li
                key={label}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5"
                style={{
                  background: active || complete ? "var(--leaf-tint)" : "var(--surface)",
                  border: "1px solid var(--rule)",
                }}
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface-2 text-leaf-deep mono text-[10px] font-bold">
                  {complete || (stage === "done" && index === 2) ? (
                    <CheckCircle weight="fill" size={13} />
                  ) : active && isProcessing ? (
                    <ArrowsClockwise className="animate-spin" weight="bold" size={12} />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </span>
                <span>
                  <span className="block text-[11.5px] font-bold text-ink">{label}</span>
                  <span className="block text-[10px] text-mute">{description}</span>
                </span>
              </li>
            );
          })}
        </ol>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-3">
          <div className="h-full rounded-full bg-leaf transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={photos.length === 0 || isProcessing}
          className="mt-2.5 flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 text-[12px] font-extrabold tracking-tight text-paper transition-colors hover:bg-ink-2 disabled:cursor-not-allowed disabled:bg-dim"
        >
          {isProcessing ? <ArrowsClockwise className="animate-spin" weight="bold" size={14} /> : <Cube weight="duotone" size={15} />}
          {isProcessing
            ? `Generating · ${progress}%`
            : stage === "done"
            ? "Regenerate"
            : "Generate 3D model"}
        </button>
      </div>
    </div>
  );
}

function GeneratedModel({ url }: { url: string }) {
  const gltf = useGLTF(url);

  const scene = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
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
      <div className="flex items-center gap-2 rounded-full border border-rule bg-surface px-4 py-2 text-[12px] font-bold text-ink shadow-soft">
        <ArrowsClockwise className="animate-spin text-leaf-deep" weight="bold" size={14} />
        Loading model
      </div>
    </Html>
  );
}

function EmptyState({ stage, progress, photoCount }: { stage: Stage; progress: number; photoCount: number }) {
  const isProcessing = stage === "processing";
  const hasPhotos = photoCount > 0;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-surface-2 text-leaf-deep">
        {isProcessing ? <ArrowsClockwise className="animate-spin" weight="bold" size={22} /> : <Cube weight="duotone" size={22} />}
      </div>
      <div>
        <h3 className="text-[14px] font-extrabold text-ink">
          {isProcessing
            ? "Building your 3D model…"
            : hasPhotos
            ? "Ready to generate"
            : "Your model will appear here"}
        </h3>
        <p className="mt-1.5 max-w-md text-[11.5px] leading-5 text-mute">
          {isProcessing
            ? "Reconstructing roof geometry…"
            : hasPhotos
            ? "Click Generate 3D model to see the result."
            : "Load the sample dataset on the right to start."}
        </p>
      </div>
      {isProcessing && (
        <div className="w-full max-w-sm">
          <div className="mb-2 flex items-center justify-between mono text-[10px] uppercase tracking-[0.16em] text-mute">
            <span>Processing</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
            <div className="h-full rounded-full bg-leaf transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

function ModelViewer({
  modelUrl,
  stage,
  progress,
  photoCount,
}: {
  modelUrl: string;
  stage: Stage;
  progress: number;
  photoCount: number;
}) {
  return (
    <section className="relative h-[320px] overflow-hidden rounded-xl bg-blueprint" style={{ border: "1px solid var(--rule)" }}>
      <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-full bg-leaf-tint px-3 py-1.5 mono text-[10px] uppercase tracking-[0.16em] text-leaf-deep">
        3D preview
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
          <directionalLight castShadow position={[5, 7, 6]} intensity={2.8} shadow-mapSize={[2048, 2048]} />
          <Suspense fallback={<ModelFallback />}>
            <Bounds fit clip observe margin={1.35}>
              <GeneratedModel url={modelUrl} />
            </Bounds>
            <ContactShadows position={[0, -0.01, 0]} opacity={0.36} scale={8} blur={2.4} far={8} />
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

useGLTF.preload(MODEL_URL);
