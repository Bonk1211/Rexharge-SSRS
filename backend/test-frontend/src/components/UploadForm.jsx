import { Camera, CheckCircle2, ImageUp, Loader2, Sparkles, Trash2 } from "lucide-react";

const stages = [
  ["Import", "Photos received"],
  ["Process", "Analyzing roof geometry"],
  ["Render", "3D model ready"],
];

function createPhoto(file) {
  return {
    id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
    name: file.name,
    size: file.size,
    url: URL.createObjectURL(file),
  };
}

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function UploadForm({
  photos,
  stage,
  progress,
  onPhotosChange,
  onRemovePhoto,
  onGenerate,
}) {
  const isProcessing = stage === "processing";
  const isDone = stage === "done";
  const activeStep = isDone ? 2 : isProcessing ? 1 : photos.length > 0 ? 0 : -1;

  function handleImage(event) {
    const files = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith("image/")
    );
    if (files.length > 0) onPhotosChange(files.map(createPhoto).slice(0, 8));
    event.target.value = "";
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-5">
      <label className="group flex min-h-[190px] cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-[#cfcbbf] bg-[#fffefa] px-5 py-6 text-center transition hover:border-[#74b66b] hover:bg-[#f2faee]">
        <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#d7d3c8] bg-[#f2f0ea]">
          <ImageUp className="h-7 w-7 text-[#4d9d44]" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-base font-semibold text-[#18211d]">
            Import rooftop photos
          </span>
          <span className="mt-1 block text-sm leading-6 text-[#7d8780]">
            Select one or more pictures to start the mock generation sequence.
          </span>
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImage}
          className="sr-only"
          disabled={isProcessing}
        />
      </label>

      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {photos.map((photo, index) => (
            <figure
              key={photo.id}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-[#dedbd1] bg-[#f2f0ea]"
            >
              <img
                src={photo.url}
                alt={`Imported rooftop ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-[#111713]/75 px-2 py-1.5 text-xs text-white backdrop-blur">
                <span className="block truncate">{photo.name}</span>
                <span className="text-[#cbd4cd]">{formatSize(photo.size)}</span>
              </figcaption>
              <button
                type="button"
                onClick={() => onRemovePhoto(photo.id)}
                disabled={isProcessing}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#111713]/80 text-white opacity-95 transition hover:bg-[#d95c52] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={`Remove ${photo.name}`}
                title="Remove photo"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </figure>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-[#dedbd1] bg-[#fffefa] p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-[#18211d]">Generation</h2>
          <span className="rounded-full bg-[#ddf2d5] px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#4d9d44]">
            Demo mode
          </span>
        </div>

        <ol className="grid gap-2">
          {stages.map(([label, description], index) => {
            const complete = activeStep > index;
            const active = activeStep === index;
            return (
              <li
                key={label}
                className={`flex items-center gap-3 rounded-md border px-3 py-3 ${
                  active || complete
                    ? "border-[#bfe6b7] bg-[#f2faee]"
                    : "border-[#dedbd1] bg-[#fbfaf6]"
                }`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d7d3c8] bg-[#f2f0ea]">
                  {complete || (isDone && index === 2) ? (
                    <CheckCircle2 className="h-5 w-5 text-[#4d9d44]" aria-hidden="true" />
                  ) : active && isProcessing ? (
                    <Loader2 className="h-5 w-5 animate-spin text-[#4d9d44]" aria-hidden="true" />
                  ) : index === 0 ? (
                    <Camera className="h-5 w-5 text-[#7d8780]" aria-hidden="true" />
                  ) : (
                    <Sparkles className="h-5 w-5 text-[#7d8780]" aria-hidden="true" />
                  )}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-[#18211d]">{label}</span>
                  <span className="block text-xs text-[#7d8780]">{description}</span>
                </span>
              </li>
            );
          })}
        </ol>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#ece8dd]">
          <div
            className="h-full rounded-full bg-[#62b859] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={photos.length === 0 || isProcessing}
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#111713] px-4 text-sm font-semibold text-white transition hover:bg-[#263028] disabled:cursor-not-allowed disabled:bg-[#b8b4aa]"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          )}
          {isProcessing ? "Processing photos" : isDone ? "Render again" : "Generate 3D render"}
        </button>
      </div>
    </section>
  );
}
