import { Cube, Eye, EyeSlash, Polygon, Stack, WaveSine } from "@/icons";
import { PanelGlyph, ParapetGlyph, SunPathGlyph } from "@/icons";
import { useViewerStore, type Layer } from "@/store/viewer-store";

const LAYERS: Array<{ key: Layer; label: string; Icon: React.FC<{ size?: number; className?: string }> }> = [
  { key: "mesh", label: "Mesh", Icon: ({ size }) => <Cube weight="duotone" size={size} /> },
  { key: "panels", label: "Panels", Icon: ({ size }) => <PanelGlyph size={size} /> },
  { key: "sunpath", label: "Sun path", Icon: ({ size }) => <SunPathGlyph size={size} /> },
  { key: "grid", label: "Grid", Icon: ({ size }) => <Stack weight="duotone" size={size} /> },
  { key: "irradiance", label: "Irradiance", Icon: ({ size }) => <WaveSine weight="duotone" size={size} /> },
  { key: "wireframe", label: "Wireframe", Icon: ({ size }) => <Polygon weight="bold" size={size} /> },
];

export default function LayerToggleBar() {
  const layers = useViewerStore((s) => s.layers);
  const toggle = useViewerStore((s) => s.toggleLayer);

  return (
    <div
      className="bg-surface/90 backdrop-blur rounded-xl px-2 py-1.5 flex items-center gap-0.5"
      style={{ border: "1px solid var(--rule)" }}
    >
      {LAYERS.map(({ key, label, Icon }) => {
        const on = layers[key];
        return (
          <button
            key={key}
            onClick={() => toggle(key)}
            className="group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors"
            style={{
              background: on ? "var(--leaf-tint)" : "transparent",
              color: on ? "var(--leaf-deep)" : "var(--mute)",
            }}
            aria-pressed={on}
            title={`${on ? "Hide" : "Show"} ${label.toLowerCase()}`}
          >
            <Icon size={14} />
            <span className="mono text-[10.5px] uppercase tracking-[0.16em]">{label}</span>
            {on ? (
              <Eye weight="bold" size={10} className="opacity-60" />
            ) : (
              <EyeSlash weight="bold" size={10} className="opacity-50" />
            )}
          </button>
        );
      })}
    </div>
  );
}
