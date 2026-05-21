import { useState } from "react";
import { toast } from "sonner";
import { ArrowUpRight } from "@/icons";
import Workspace3DSection from "@/components/workspace3d/Workspace3DSection";
import { uploadScratchGlb, getSignedUrl } from "@/lib/projects-api";

export default function Workspace3DConverter() {
  const [result, setResult] = useState<{ files: File[]; glbUrl: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleOpenSimulator = async () => {
    if (!result) return;
    setUploading(true);
    try {
      const res = await fetch(result.glbUrl);
      const blob = await res.blob();
      const glbFile = new File([blob], "reconstructed_model.glb", { type: "model/gltf-binary" });

      const { bucket, path } = await uploadScratchGlb(glbFile);
      const signedModel = await getSignedUrl(bucket, path, 86400);

      // TODO: when `pipeline_runs` table exists, look up (lat, lng, usage, gmap)
      // for this GLB path and append &lat=&lng=&usage=&gmap= to the URL below.
      const url = `${__SIMULATOR_URL__}/simulator?model=${signedModel}`;
      console.info("[Workspace3DConverter] opening simulator:", url);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err && "message" in err
            ? String((err as { message: unknown }).message)
            : JSON.stringify(err);
      console.error("[Workspace3DConverter] open simulator failed:", err);
      toast.error(msg || "Could not open simulator");
    } finally {
      setUploading(false);
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
          Import, process, and render. The model is stored at Supabase and handed off to the simulator.
        </p>
      </div>

      <Workspace3DSection onComplete={(files, glbUrl) => setResult({ files, glbUrl })} />

      {result && (
        <div className="mt-8 flex justify-end animate-riseIn">
          <button
            onClick={handleOpenSimulator}
            disabled={uploading}
            className="px-6 h-11 inline-flex items-center gap-2 rounded-full text-[14px] font-bold tracking-tight text-paper transition-opacity disabled:opacity-50 hover:opacity-90"
            style={{ background: "var(--ink)" }}
          >
            {uploading ? "Uploading…" : "Open in simulator"}
            {!uploading && <ArrowUpRight weight="bold" size={14} />}
          </button>
        </div>
      )}
    </main>
  );
}
