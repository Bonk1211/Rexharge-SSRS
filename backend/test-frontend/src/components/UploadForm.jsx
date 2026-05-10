import { useMemo, useState } from "react";
import { ImageUp, Images, Loader2, Wand2, X } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

const defaults = {
  building_length: 18,
  building_width: 10,
  building_height: 6,
  roof_pitch: 20,
  roof_overhang: 0.45,
  ridge_length_ratio: 0.56,
  porch_length: 6,
  porch_width: 10,
  porch_offset: 0,
  panel_watt: 620, // Trina Solar Vertex N TSM-NEG19RC.20
  panel_bracket_tilt: -1,
};

const fields = [
  ["building_length", "Building length", "m", 4, 60],
  ["building_width", "Building width", "m", 4, 40],
  ["building_height", "Building height", "m", 3, 18],
  ["roof_pitch", "Roof pitch", "deg", 5, 45],
  ["roof_overhang", "Roof overhang", "m", 0, 2],
  ["ridge_length_ratio", "Ridge length ratio", "x", 0.15, 0.9],
  ["porch_length", "Porch length", "m", 0, 20],
  ["porch_width", "Porch width", "m", 0, 30],
  ["porch_offset", "Porch side offset", "m", -20, 20],
  ["panel_watt", "Panel wattage", "W", 300, 800],
  ["panel_bracket_tilt", "Panel Tilt (-1 = Auto)", "deg", -1, 45],
];

export default function UploadForm({ onGenerated }) {
  const [values, setValues] = useState(defaults);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const payload = useMemo(
    () => ({
      ...values,
      panel_width: 1.134, // Trina Vertex N (1134mm)
      panel_height: 2.382, // Trina Vertex N (2382mm)
    }),
    [values]
  );

  function updateField(name, value) {
    setValues((current) => ({ ...current, [name]: Number(value) }));
  }

  function handleImage(event) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const nextPreviews = files.map((file) => ({
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setPreviews((current) => [...current, ...nextPreviews].slice(0, 12));
    event.target.value = "";
  }

  function removePreview(id) {
    setPreviews((current) => {
      const target = current.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return current.filter((item) => item.id !== id);
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/generate-model`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Model generation failed. Check the backend console for details.");
      }

      const data = await response.json();
      onGenerated(data, payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-white/10 bg-white/10 p-4 shadow-2xl shadow-slate-950/20 backdrop-blur-md"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Inputs</h2>
        <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
          Hip roof
        </span>
      </div>

      <label className="mb-4 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-white/20 bg-slate-950/35 p-4 text-center transition hover:border-emerald-300 hover:bg-emerald-400/10">
        {previews.length > 0 ? (
          <>
            <Images className="h-7 w-7 text-emerald-300" aria-hidden="true" />
            <span className="text-sm font-medium text-slate-200">
              Add more reference photos
            </span>
          </>
        ) : (
          <>
            <ImageUp className="h-8 w-8 text-slate-400" aria-hidden="true" />
            <span className="text-sm font-medium text-slate-200">
              Upload rooftop references
            </span>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImage}
          className="sr-only"
        />
      </label>

      {previews.length > 0 && (
        <div className="mb-4 grid grid-cols-3 gap-2">
          {previews.map((preview, index) => (
            <div
              key={preview.id}
              className="group relative aspect-[4/3] overflow-hidden rounded-md border border-white/10 bg-slate-950/50"
            >
              <img
                src={preview.url}
                alt={`Rooftop reference ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePreview(preview.id)}
                className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/75 text-white opacity-95 transition hover:bg-red-600"
                aria-label={`Remove ${preview.name}`}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {fields.map(([name, label, unit, min, max]) => (
          <label key={name} className="grid gap-1.5">
            <span className="text-sm font-medium text-slate-200">{label}</span>
            <div className="flex h-11 overflow-hidden rounded-md border border-white/10 bg-slate-950/45 focus-within:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-300/15">
              <input
                type="number"
                min={min}
                max={max}
                step="0.1"
                value={values[name]}
                onChange={(event) => updateField(name, event.target.value)}
                className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none"
              />
              <span className="flex w-12 items-center justify-center border-l border-white/10 bg-white/5 text-sm text-slate-300">
                {unit}
              </span>
            </div>
          </label>
        ))}
      </div>

      {error && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Wand2 className="h-4 w-4" aria-hidden="true" />
        )}
        Generate 3D model
      </button>
    </form>
  );
}
