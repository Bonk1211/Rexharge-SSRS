import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Workspace3DSection from "@/components/workspace3d/Workspace3DSection";

export default function Workspace3DConverter() {
  const [result, setResult] = useState<{ files: File[]; glbUrl: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const res = await fetch(result.glbUrl);
      const blob = await res.blob();
      const glbFile = new File([blob], "reconstructed_model.glb", { type: "model/gltf-binary" });
      const allFiles = [
        { kind: "glb", file: glbFile },
        ...result.files.map((file) => ({ kind: "source_photo", file })),
      ];
      navigate("/app/projects/new", { state: { prefilledFiles: allFiles, prefilledMode: "photos" } });
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  return (
    <main className="flex-1 min-w-0 w-full px-8 lg:px-12 pt-10 pb-12">
      <div className="mb-8">
        <div className="mono text-[10.5px] uppercase tracking-[0.24em] text-leaf-deep mb-2">
          Workspace · 3D converter
        </div>
        <h1
          className="numeral text-[32px] tracking-[-0.02em] text-ink"
          style={{ fontWeight: 600 }}
        >
          Convert photos into a textured GLB.
        </h1>
        <p className="mt-3 text-[14px] text-mute max-w-[56ch]">
          Import, processing, and render flow powered by the Hunyuan model on the backend.
        </p>
      </div>

      <Workspace3DSection onComplete={(files, glbUrl) => setResult({ files, glbUrl })} />

      {result && (
        <div className="mt-8 flex justify-end animate-riseIn">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 h-11 inline-flex items-center gap-2 rounded-full text-[14px] font-bold tracking-tight text-paper transition-opacity disabled:opacity-50 hover:opacity-90"
            style={{ background: "var(--ink)" }}
          >
            {saving ? "Packaging files..." : "Save as new project →"}
          </button>
        </div>
      )}
    </main>
  );
}
