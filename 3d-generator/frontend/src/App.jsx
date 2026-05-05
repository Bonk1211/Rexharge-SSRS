import { useState } from "react";
import UploadForm from "./components/UploadForm.jsx";
import Viewer from "./components/Viewer.jsx";
import StatsPanel from "./components/StatsPanel.jsx";

const initialStats = {
  usable_roof_area: 0,
  panel_count: 0,
  bracket_tilt: 0,
  estimated_kwp: 0,
  annual_yield_kwh: 0,
  yield_south: 0,
  yield_north: 0,
  monthly_yields: [],
  performance_ratio: 0,
  soiling_loss_pct: 0,
  temp_loss_pct: 0,
  poa_irradiance: 0,
  orientation: "N/A",
  top_3: []
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function App() {
  const [modelUrl, setModelUrl] = useState("");
  const [stats, setStats] = useState(initialStats);
  const [roofPitch, setRoofPitch] = useState(20);
  const [lastPayload, setLastPayload] = useState(null);

  const handleConfigClick = async (config) => {
    if (!lastPayload) return;
    const nextPayload = { ...lastPayload, panel_bracket_tilt: config.bracket_tilt };
    try {
      const response = await fetch(`${API_BASE}/generate-model`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextPayload),
      });
      const data = await response.json();
      setModelUrl(data.model_url);
      setStats(data.stats);
      setLastPayload(nextPayload);
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <main className="h-screen bg-[radial-gradient(circle_at_top_left,#164e63_0,#07111f_34%,#020617_100%)] overflow-hidden">
      <div className="mx-auto flex h-full w-full flex-col gap-5 px-4 py-5 lg:px-6">
        <header className="flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between shrink-0">
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

        <section className="grid flex-1 gap-5 overflow-hidden lg:grid-cols-[390px_minmax(0,1fr)]">
          <aside className="flex h-full flex-col gap-4 overflow-y-auto pr-2 pb-4 styled-scrollbar">
            <UploadForm
              onGenerated={(data, payload) => {
                setModelUrl(data.model_url);
                setStats(data.stats);
                setRoofPitch(payload.roof_pitch);
                setLastPayload(payload);
              }}
            />
            <StatsPanel stats={stats} roofPitch={roofPitch} onConfigClick={handleConfigClick} />
          </aside>

          <Viewer modelUrl={modelUrl} />
        </section>
      </div>
    </main>
  );
}
