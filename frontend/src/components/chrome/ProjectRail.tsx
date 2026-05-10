import { Link, useLocation, useParams } from "react-router-dom";
import { Cube, House, MagnifyingGlass, Plus } from "@/icons";
import type { IconProps } from "@phosphor-icons/react";
import type { ComponentType } from "react";
import { projects } from "@/data/mock-projects";
import StatusPill from "./StatusPill";
import HairlineRule from "./HairlineRule";
import { fmtKWp } from "@/lib/format";

export default function ProjectRail() {
  const { id } = useParams();
  const location = useLocation();
  const path = location.pathname;

  return (
    <aside
      className="hidden lg:flex flex-col bg-surface"
      style={{
        width: "var(--rail-width)",
        borderRight: "1px solid var(--rule)",
        height: "calc(100vh - var(--topbar-height))",
        position: "sticky",
        top: "var(--topbar-height)",
      }}
    >
      <div className="px-4 pt-5 pb-3">
        <SearchInput />
      </div>

      <HairlineRule label="Workspace" className="px-4" />

      <nav className="px-2 py-2 space-y-0.5">
        <WorkspaceLink
          to="/"
          label="Overview"
          caption="Portfolio overview"
          active={path === "/"}
          Icon={House}
        />
        <WorkspaceLink
          to="/workspace/3d-converter"
          label="3D Converter"
          caption="Photos to GLB"
          active={path.startsWith("/workspace/3d-converter")}
          Icon={Cube}
        />
      </nav>

      <HairlineRule label="Projects" className="px-4" />

      <ul className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {projects.map((p) => {
          const active = p.id === id;
          return (
            <li key={p.id}>
              <Link
                to={`/projects/${p.id}/analysis`}
                className="block group rounded-lg px-2.5 py-2 transition-colors relative"
                style={{
                  background: active ? "var(--leaf-tint)" : "transparent",
                }}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
                    style={{ background: "var(--leaf)" }}
                  />
                )}
                <div className="flex items-start gap-2.5">
                  <Thumb hue={p.thumbnailHue} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className={`text-[12.5px] truncate ${
                          active ? "text-ink font-bold" : "text-ink-2 font-semibold"
                        }`}
                      >
                        {p.name.split(" — ")[0]}
                      </span>
                      <span className="mono text-[10px] text-mute tab-num shrink-0">
                        {p.kwp ? `${fmtKWp(p.kwp)} kWp` : "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <StatusPill status={p.status} size="sm" />
                      <span className="mono text-[9.5px] text-mute uppercase tracking-[0.14em]">
                        {p.intakeMode.replace("_", "·")}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="p-3 border-t" style={{ borderColor: "var(--rule)" }}>
        <Link
          to="/projects/new"
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg group transition-colors"
          style={{ background: "var(--ink)", color: "var(--paper)" }}
        >
          <span className="flex items-center gap-2 text-[12.5px] font-bold tracking-tight">
            <Plus weight="bold" size={13} />
            New project
          </span>
          <span className="mono text-[9.5px] uppercase tracking-[0.18em] text-leaf">N</span>
        </Link>
      </div>
    </aside>
  );
}

const SearchInput = () => (
  <label className="flex items-center gap-2 px-2.5 h-9 rounded-lg" style={{ background: "var(--surface-2)" }}>
    <MagnifyingGlass weight="duotone" size={14} className="text-mute" />
    <input
      type="text"
      placeholder="Search rooftops, sites, kWp…"
      className="flex-1 bg-transparent text-[12.5px] placeholder-dim text-ink outline-none"
    />
    <span className="mono text-[9.5px] text-dim uppercase tracking-[0.14em]">⌘ K</span>
  </label>
);

const WorkspaceLink = ({
  to,
  label,
  caption,
  active,
  Icon,
}: {
  to: string;
  label: string;
  caption: string;
  active: boolean;
  Icon: ComponentType<IconProps>;
}) => (
  <Link
    to={to}
    className="block group rounded-lg px-2.5 py-2 transition-colors relative"
    style={{ background: active ? "var(--leaf-tint)" : "transparent" }}
  >
    {active && (
      <span
        aria-hidden
        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
        style={{ background: "var(--leaf)" }}
      />
    )}
    <div className="flex items-center gap-2.5">
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-md"
        style={{
          background: active ? "var(--surface)" : "var(--surface-2)",
          color: active ? "var(--leaf-deep)" : "var(--ink-2)",
          border: "1px solid var(--rule)",
        }}
      >
        <Icon size={18} weight={active ? "fill" : "duotone"} />
      </span>
      <span className="min-w-0">
        <span className={`block truncate text-[12.5px] ${active ? "font-bold text-ink" : "font-semibold text-ink-2"}`}>
          {label}
        </span>
        <span className="mono block truncate text-[9.5px] uppercase tracking-[0.14em] text-mute">
          {caption}
        </span>
      </span>
    </div>
  </Link>
);

const Thumb = ({ hue }: { hue: number }) => (
  <div
    className="w-9 h-9 rounded-md shrink-0 relative overflow-hidden"
    style={{
      background: `linear-gradient(135deg, hsl(${hue} 38% 88%), hsl(${hue} 30% 76%))`,
      border: "1px solid var(--rule)",
    }}
  >
    <span
      aria-hidden
      className="absolute inset-1 rounded-sm"
      style={{
        background: `linear-gradient(135deg, transparent 40%, hsl(${hue} 40% 30% / 0.18) 100%)`,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.4)",
      }}
    />
  </div>
);
