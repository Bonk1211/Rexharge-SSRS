import { Bell, Gauge, Plus, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import UploadForm from "./components/UploadForm.jsx";
import Viewer from "./components/Viewer.jsx";

const MODEL_URL = "/models/hunyuan_textured_768.glb";

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [stage, setStage] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [modelUrl, setModelUrl] = useState("");
  const photosRef = useRef([]);

  useEffect(() => {
    return () => {
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.url));
    };
  }, []);

  function handlePhotos(nextPhotos) {
    setPhotos((current) => {
      current.forEach((photo) => URL.revokeObjectURL(photo.url));
      photosRef.current = nextPhotos;
      return nextPhotos;
    });
    setStage("idle");
    setProgress(0);
    setModelUrl("");
  }

  function handleRemovePhoto(id) {
    setPhotos((current) => {
      const target = current.find((photo) => photo.id === id);
      if (target) URL.revokeObjectURL(target.url);
      const nextPhotos = current.filter((photo) => photo.id !== id);
      photosRef.current = nextPhotos;
      if (nextPhotos.length === 0) {
        setStage("idle");
        setProgress(0);
        setModelUrl("");
      }
      return nextPhotos;
    });
  }

  function handleGenerate() {
    if (photos.length === 0 || stage === "processing") return;

    setStage("processing");
    setProgress(8);
    setModelUrl("");

    const steps = [
      [550, 22],
      [1150, 43],
      [1850, 67],
      [2600, 88],
      [3300, 100],
    ];

    steps.forEach(([delay, value]) => {
      window.setTimeout(() => setProgress(value), delay);
    });

    window.setTimeout(() => {
      setModelUrl(MODEL_URL);
      setStage("done");
    }, 3600);
  }

  return (
    <main className="min-h-screen bg-[#fbfaf6] text-[#18211d]">
      <div className="grid min-h-screen lg:grid-cols-[80px_320px_minmax(0,1fr)]">
        <nav className="hidden border-r border-[#dedbd1] bg-[#fbfaf6] lg:flex lg:flex-col lg:items-center lg:py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#111713] text-[#9fe28b] shadow-sm">
            <Gauge className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="mt-10 flex h-14 w-14 items-center justify-center rounded-[14px] bg-[#ddf2d5] text-[#4d9d44]">
            <span className="text-sm font-bold">3D</span>
          </div>
          <div className="mt-auto flex h-10 w-10 items-center justify-center rounded-full border border-[#bfe6b7] bg-[#e2f6db] text-[#4d9d44]">
            <span className="text-sm font-semibold">R</span>
          </div>
        </nav>

        <aside className="flex min-h-0 flex-col border-r border-[#dedbd1] bg-[#fbfaf6]">
          <header className="flex h-[84px] shrink-0 items-center border-b border-[#dedbd1] px-5">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-[#7d8780]">
                Workspace / Demo
              </p>
              <h1 className="mt-1 text-xl font-semibold text-[#18211d]">
                Photos to 3D Render
              </h1>
            </div>
          </header>

          <div className="border-b border-[#dedbd1] px-5 py-4">
            <div className="flex h-11 items-center gap-2 rounded-lg bg-[#f2f0ea] px-3 text-sm text-[#8a948d]">
              <Search className="h-4 w-4" aria-hidden="true" />
              <span>Search rooftops, sites, kWp...</span>
            </div>
          </div>

          <UploadForm
            photos={photos}
            stage={stage}
            progress={progress}
            onPhotosChange={handlePhotos}
            onRemovePhoto={handleRemovePhoto}
            onGenerate={handleGenerate}
          />
        </aside>

        <section className="min-w-0">
          <header className="flex h-[84px] items-center justify-between border-b border-[#dedbd1] bg-[#fbfaf6] px-6">
            <div className="hidden h-11 min-w-[330px] items-center gap-2 rounded-lg bg-[#f2f0ea] px-4 text-sm text-[#8a948d] md:flex">
              <Search className="h-4 w-4" aria-hidden="true" />
              <span>Jump to project, address, kWp...</span>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="rounded-full bg-[#ddf2d5] px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#4d9d44]">
                ATAP NEM 3.0 · LIVE
              </span>
              <button className="flex h-11 items-center gap-2 rounded-full bg-[#111713] px-5 text-sm font-semibold text-white shadow-sm">
                <Plus className="h-4 w-4" aria-hidden="true" />
                New project
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-full text-[#6f7a72]">
                <Bell className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </header>

          <div className="relative min-h-[calc(100vh-84px)] overflow-hidden bg-[radial-gradient(#e9e5da_1px,transparent_1px)] bg-[length:22px_22px] px-6 py-8">
            <div className="mx-auto flex max-w-[1380px] flex-col gap-6">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[#58a04f]">
                    Workspace · Sunday, 10 May
                  </p>
                  <h2 className="mt-3 max-w-2xl font-serif text-5xl font-black leading-[0.94] tracking-normal text-[#18211d] md:text-6xl">
                    Photos in, textured render out.
                  </h2>
                  <p className="mt-5 max-w-xl text-base leading-7 text-[#768079]">
                    Import rooftop references, show the processing state, then inspect the generated Hunyuan GLB in the 3D viewer.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button className="flex h-12 items-center gap-2 rounded-full bg-[#111713] px-5 text-sm font-semibold text-white shadow-sm">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    New project
                  </button>
                  <span className="flex h-12 items-center rounded-full bg-[#ddf2d5] px-5 font-mono text-xs font-semibold uppercase tracking-wider text-[#4d9d44]">
                    Bulk-import drone set
                  </span>
                </div>
              </div>

              <div className="grid gap-5 rounded-2xl border border-[#dedbd1] bg-[#fffefa]/88 p-5 shadow-[0_18px_50px_rgba(24,33,29,0.06)] backdrop-blur xl:grid-cols-[minmax(0,1fr)_300px]">
                <Viewer modelUrl={modelUrl} stage={stage} progress={progress} photoCount={photos.length} />
                <div className="grid gap-4 content-start">
                  {[
                    ["Imported photos", photos.length],
                    ["Processing", stage === "processing" ? `${progress}%` : stage === "done" ? "100%" : "0%"],
                    ["Model", stage === "done" ? "Ready" : "Pending"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-[#dedbd1] bg-[#fbfaf6] p-4">
                      <p className="font-mono text-xs uppercase tracking-wider text-[#8a948d]">{label}</p>
                      <p className="mt-2 font-serif text-4xl font-black text-[#18211d]">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
