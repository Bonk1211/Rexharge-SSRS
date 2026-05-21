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
  Sparkle,
  Trash,
} from "@phosphor-icons/react";
import * as THREE from "three";

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
  ["Import", "Photos received"],
  ["Process", "Reconstructing roof geometry"],
  ["Render", "Textured GLB ready"],
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

  function handlePhotos(files: FileList | null) {
    const nextPhotos = Array.from(files ?? [])
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
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mono text-[10.5px] uppercase tracking-[0.22em] text-leaf-deep">
            Workspace · 3D reconstruction
          </p>
          <h2 className="mt-2 numeral text-[34px] leading-[0.98] text-ink">
            Photo set to textured model.
          </h2>
        </div>
        <HeaderStats photos={photos.length} stage={stage} progress={progress} />
      </div>

      <div
        className="grid gap-5 rounded-2xl bg-surface p-5 shadow-soft lg:grid-cols-[340px_minmax(0,1fr)]"
        style={{ border: "1px solid var(--rule)" }}
      >
        <ImportPanel
          photos={photos}
          stage={stage}
          progress={progress}
          onPhotos={handlePhotos}
          onRemove={removePhoto}
          onGenerate={generateRender}
        />
        <ModelViewer modelUrl={modelUrl} stage={stage} progress={progress} photoCount={photos.length} />
      </div>
    </section>
  );
}

function HeaderStats({ photos, stage, progress }: { photos: number; stage: Stage; progress: number }) {
  const pct = stage === "processing" ? progress : stage === "done" ? 100 : 0;
  const modelStatus = stage === "done" ? "Ready" : stage === "processing" ? "Building" : "Pending";
  return (
    <div className="flex flex-wrap items-stretch gap-2">
      <StatPill label="Photos" value={String(photos)} />
      <StatPill label="Progress" value={`${pct}%`} />
      <StatPill label="Model" value={modelStatus} accent={stage === "done"} />
    </div>
  );
}

function StatPill({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className="flex items-center gap-2 rounded-full px-3 py-1.5"
      style={{
        background: accent ? "var(--leaf-tint)" : "var(--surface-2)",
        border: "1px solid var(--rule)",
      }}
    >
      <span className="mono text-[10px] uppercase tracking-[0.18em] text-mute">{label}</span>
      <span
        className="numeral tab-num text-[13px] font-bold"
        style={{ color: accent ? "var(--leaf-deep)" : "var(--ink)" }}
      >
        {value}
      </span>
    </div>
  );
}

function ImportPanel({
  photos,
  stage,
  progress,
  onPhotos,
  onRemove,
  onGenerate,
}: {
  photos: ImportedPhoto[];
  stage: Stage;
  progress: number;
  onPhotos: (files: FileList | null) => void;
  onRemove: (id: string) => void;
  onGenerate: () => void;
}) {
  const isProcessing = stage === "processing";
  const activeStep = stage === "done" ? 2 : isProcessing ? 1 : photos.length > 0 ? 0 : -1;

  return (
    <div className="flex flex-col gap-3">
      <label className="group flex min-h-[128px] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed border-rule bg-paper px-4 py-4 text-center transition-colors hover:border-leaf hover:bg-leaf-tint/35">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-surface-2 text-leaf-deep">
          <ImageSquare weight="duotone" size={24} />
        </span>
        <span>
          <span className="block text-[13px] font-extrabold tracking-tight text-ink">
            Import rooftop photos
          </span>
          <span className="mt-1 block text-[12px] leading-5 text-mute">
            Select one or more images to run the demo flow.
          </span>
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={isProcessing}
          onChange={(event) => {
            onPhotos(event.target.files);
            event.target.value = "";
          }}
          className="sr-only"
        />
      </label>

      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {photos.map((photo, index) => (
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
      )}

      <div className="rounded-xl bg-paper p-3" style={{ border: "1px solid var(--rule)" }}>
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-[13px] font-extrabold tracking-tight text-ink">Generation</span>
          <span className="rounded-full bg-leaf-tint px-2.5 py-1 mono text-[9.5px] uppercase tracking-[0.16em] text-leaf-deep">
            Demo mode
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
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-2 text-leaf-deep">
                  {complete || (stage === "done" && index === 2) ? (
                    <CheckCircle weight="fill" size={17} />
                  ) : active && isProcessing ? (
                    <ArrowsClockwise className="animate-spin" weight="bold" size={16} />
                  ) : (
                    <Sparkle weight="duotone" size={16} />
                  )}
                </span>
                <span>
                  <span className="block text-[12px] font-bold text-ink">{label}</span>
                  <span className="block text-[10.5px] text-mute">{description}</span>
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
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 text-[12.5px] font-extrabold tracking-tight text-paper transition-colors hover:bg-ink-2 disabled:cursor-not-allowed disabled:bg-dim"
        >
          {isProcessing ? <ArrowsClockwise className="animate-spin" weight="bold" size={14} /> : <Cube weight="duotone" size={15} />}
          {isProcessing ? "Processing photos" : stage === "done" ? "Render again" : "Generate 3D render"}
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
    <div className="flex h-full min-h-[420px] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-surface-2 text-leaf-deep">
        {isProcessing ? <ArrowsClockwise className="animate-spin" weight="bold" size={30} /> : <Cube weight="duotone" size={30} />}
      </div>
      <div>
        <h3 className="text-[16px] font-extrabold text-ink">
          {isProcessing ? "Building 3D render" : hasPhotos ? "Photos imported" : "Awaiting photos"}
        </h3>
        <p className="mt-2 max-w-md text-[12.5px] leading-6 text-mute">
          {isProcessing
            ? "The demo is processing the uploaded references and preparing the textured model."
            : hasPhotos
              ? "Start generation to show the processing state and reveal the 3D result."
              : "Import rooftop photos to begin the demo flow."}
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
    <section className="relative min-h-[420px] overflow-hidden rounded-xl bg-blueprint" style={{ border: "1px solid var(--rule)" }}>
      <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-full bg-leaf-tint px-3 py-1.5 mono text-[10px] uppercase tracking-[0.16em] text-leaf-deep">
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
