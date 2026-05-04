import { useState } from "react";
import UploadForm from "./components/UploadForm.jsx";
import Viewer from "./components/Viewer.jsx";
import StatsPanel from "./components/StatsPanel.jsx";

const initialStats = {
  usable_roof_area: 0,
  panel_count: 0,
  estimated_kwp: 0,
};

export default function App() {
  const [modelUrl, setModelUrl] = useState("");
  const [stats, setStats] = useState(initialStats);
  const [roofPitch, setRoofPitch] = useState(20);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#164e63_0,#07111f_34%,#020617_100%)]">
      <div className="mx-auto flex min-h-screen w-full flex-col gap-5 px-4 py-5 lg:px-6">
        <header className="flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
              Parametric rooftop generator
            </p>
            <h1 className="text-2xl font-semibold text-white sm:text-3xl">
              Solar Roof 3D MVP
            </h1>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-300">
            Upload a drone reference image, enter dimensions, and generate an approximate hip-roof bungalow GLB.
          </p>
        </header>

        <section className="grid flex-1 gap-5 lg:grid-cols-[390px_minmax(0,1fr)]">
          <aside className="flex flex-col gap-4">
            <UploadForm
              onGenerated={({ model_url, stats: nextStats }, pitch) => {
                setModelUrl(model_url);
                setStats(nextStats);
                setRoofPitch(pitch);
              }}
            />
            <StatsPanel stats={stats} roofPitch={roofPitch} />
          </aside>

          <Viewer modelUrl={modelUrl} />
        </section>
      </div>
    </main>
  );
}
