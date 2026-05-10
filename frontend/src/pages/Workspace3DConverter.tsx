import ProjectRail from "@/components/chrome/ProjectRail";
import Workspace3DSection from "@/components/workspace3d/Workspace3DSection";

export default function Workspace3DConverter() {
  return (
    <div className="flex">
      <ProjectRail />

      <main className="flex-1 min-w-0">
        <section className="relative overflow-hidden">
          <div className="px-8 lg:px-12 pt-10 pb-12">
            <div className="mb-8">
              <div className="mono text-[10.5px] uppercase tracking-[0.24em] text-leaf-deep mb-2">
                Workspace · 3D converter
              </div>
              <h1
                className="text-[42px] md:text-[54px] numeral leading-[0.96] tracking-[-0.035em] text-ink"
                style={{ fontWeight: 600 }}
              >
                Convert photos
                <br />
                <span className="italic" style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 100" }}>
                  into a textured GLB.
                </span>
              </h1>
              <p className="mt-3 text-[14px] text-mute max-w-[56ch]">
                Mock the import, processing, and render flow using the generated Hunyuan model from the backend.
              </p>
            </div>

            <Workspace3DSection />
          </div>
        </section>
      </main>
    </div>
  );
}
