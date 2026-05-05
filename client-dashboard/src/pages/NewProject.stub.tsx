import { Link } from "react-router-dom";
import ProjectRail from "@/components/chrome/ProjectRail";
import HairlineRule from "@/components/chrome/HairlineRule";
import { ArrowRight } from "@/icons";
import { DroneGlyph, MeshImportGlyph, PanelGlyph } from "@/icons";

export default function NewProject() {
  return (
    <div className="flex">
      <ProjectRail />
      <main className="flex-1 px-12 py-10 max-w-[1200px]">
        <div className="mono text-[10.5px] uppercase tracking-[0.24em] text-leaf-deep mb-2">
          Step 1 of 4 · Site setup
        </div>
        <h1
          className="numeral text-[44px] leading-[1] tracking-[-0.03em] text-ink"
          style={{ fontWeight: 600 }}
        >
          New rooftop project.
        </h1>
        <p className="mt-3 text-[14px] text-mute max-w-[58ch]">
          Pick an intake path. The simulation core is shared — same Open3D plane segmentation,
          same trimesh raycaster, same pvlib yield engine.
        </p>

        <HairlineRule className="my-8" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Path
            title="Drone capture"
            tag="Recommended"
            desc="MP4 video, geotagged JPEGs, or DJI Terra OBJ bundle. Scale + georeference auto-extracted."
            Icon={DroneGlyph}
          />
          <Path
            title="Photo set"
            tag="Phone OK"
            desc="10–25 multi-angle photos. Meshroom photogrammetry ~8 min on GPU. Manual scale calibration after recon."
            Icon={MeshImportGlyph}
          />
          <Path
            title="Demo site"
            tag="< 9 s"
            desc="Pre-baked Bukit Jalil residential mesh from cached PVGIS data. Use to rehearse demos."
            Icon={PanelGlyph}
          />
        </div>

        <div className="mt-10 mono text-[11px] uppercase tracking-[0.18em] text-mute flex items-center gap-2">
          stub · v1 wires this to <span className="text-ink">FastAPI · /api/projects</span>
        </div>

        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 mono text-[11px] uppercase tracking-[0.18em] text-leaf-deep"
        >
          ← Back to workspace
        </Link>
      </main>
    </div>
  );
}

const Path = ({
  title,
  tag,
  desc,
  Icon,
}: {
  title: string;
  tag: string;
  desc: string;
  Icon: React.FC<{ size?: number; className?: string }>;
}) => (
  <button
    className="group text-left bg-surface rounded-2xl p-6 flex flex-col gap-4 transition-colors hover:bg-leaf-tint"
    style={{ border: "1px solid var(--rule)" }}
  >
    <div className="flex items-center justify-between">
      <Icon size={28} className="text-ink" />
      <span
        className="mono text-[9.5px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full"
        style={{ background: "var(--leaf-tint)", color: "var(--leaf-deep)" }}
      >
        {tag}
      </span>
    </div>
    <div>
      <h3 className="text-[16px] font-extrabold tracking-[-0.01em]">{title}</h3>
      <p className="text-[12.5px] text-mute mt-1.5 leading-relaxed">{desc}</p>
    </div>
    <span className="inline-flex items-center gap-1 mono text-[10.5px] uppercase tracking-[0.18em] text-leaf-deep mt-auto">
      Continue <ArrowRight weight="bold" size={11} />
    </span>
  </button>
);
