import { Link, useLocation, useParams } from "react-router-dom";
import { Bell, MagnifyingGlass, MapPin, Plus, Sparkle } from "@/icons";
import { findProject } from "@/data/mock-projects";

/* TopBar — contextual breadcrumb + global search + ATAP pill + primary CTA.
 * Brand wordmark lives in the FeatureRail; this bar is purely operational. */

const ROUTE_TITLES: Array<{ test: (p: string) => boolean; crumbs: (path: string, id?: string) => string[] }> = [
  { test: (p) => p === "/", crumbs: () => ["Workspace", "Overview"] },
  { test: (p) => p.startsWith("/projects/new"), crumbs: () => ["Workspace", "Projects", "New project"] },
  { test: (p) => p.includes("/analysis"), crumbs: (_, id) => ["Workspace", "Projects", id ?? "—", "Analysis"] },
  { test: (p) => p.includes("/report"), crumbs: (_, id) => ["Workspace", "Projects", id ?? "—", "Report"] },
  { test: (p) => p.startsWith("/captures"), crumbs: () => ["Captures", "Recent uploads"] },
  { test: (p) => p.startsWith("/reports"), crumbs: () => ["Reports", "Engineering PDFs"] },
  { test: (p) => p.startsWith("/tariffs"), crumbs: () => ["Tariffs", "TNB · ATAP NEM 3.0"] },
  { test: (p) => p.startsWith("/portfolio"), crumbs: () => ["Portfolio", "All sites"] },
  { test: (p) => p.startsWith("/settings"), crumbs: () => ["Settings", "Workspace"] },
  { test: (p) => p.startsWith("/help"), crumbs: () => ["Help", "Docs · shortcuts"] },
];

export default function TopBar() {
  const location = useLocation();
  const { id } = useParams();
  const project = id ? findProject(id) : null;
  const onAnalysis = location.pathname.includes("/analysis");

  const route = ROUTE_TITLES.find((r) => r.test(location.pathname));
  const crumbs = route?.crumbs(location.pathname, project?.name?.split(" — ")[0] ?? id) ?? ["Workspace"];

  return (
    <header
      className="sticky top-0 z-30 bg-paper/90 backdrop-blur-md"
      style={{
        height: "var(--topbar-height)",
        borderBottom: "1px solid var(--rule)",
      }}
    >
      <div className="h-full px-6 flex items-center gap-5">
        <Breadcrumb crumbs={crumbs} project={project?.name} onAnalysis={onAnalysis} />

        <div className="flex-1" />

        <SearchInput />

        <Pill icon={<Sparkle weight="duotone" size={13} />} label="ATAP NEM 3.0 · live" />

        <Link
          to="/projects/new"
          className="hidden md:inline-flex items-center gap-2 px-3.5 h-9 rounded-full text-[12px] font-bold tracking-tight text-paper transition-colors"
          style={{ background: "var(--ink)" }}
        >
          <Plus weight="bold" size={13} />
          New project
        </Link>

        <button
          aria-label="Notifications"
          className="relative w-9 h-9 rounded-full grid place-items-center text-mute hover:text-ink hover:bg-surface-2 transition-colors"
        >
          <Bell weight="duotone" size={16} />
          <span
            aria-hidden
            className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--terracotta)" }}
          />
        </button>
      </div>
    </header>
  );
}

const Breadcrumb = ({
  crumbs,
  project,
  onAnalysis,
}: {
  crumbs: string[];
  project?: string;
  onAnalysis: boolean;
}) => (
  <nav className="flex items-center gap-2 text-[12.5px] mono uppercase tracking-[0.16em] min-w-0">
    {crumbs.map((c, i) => {
      const isLast = i === crumbs.length - 1;
      return (
        <span key={i} className="flex items-center gap-2 min-w-0">
          {i > 0 && <span aria-hidden className="text-dim">/</span>}
          <span className={isLast ? "text-ink truncate" : "text-mute truncate"}>{truncate(c, 30)}</span>
          {project && onAnalysis && isLast && (
            <span className="ml-2 inline-flex items-center gap-1 text-leaf-deep">
              <MapPin weight="fill" size={12} />
              <span className="mono text-[10.5px] tracking-[0.12em]">live</span>
            </span>
          )}
        </span>
      );
    })}
  </nav>
);

const SearchInput = () => (
  <label
    className="hidden xl:flex items-center gap-2 px-2.5 h-9 rounded-lg w-[280px]"
    style={{ background: "var(--surface-2)" }}
  >
    <MagnifyingGlass weight="duotone" size={14} className="text-mute" />
    <input
      type="text"
      placeholder="Jump to project, address, kWp…"
      className="flex-1 bg-transparent text-[12.5px] placeholder-dim text-ink outline-none"
    />
    <span className="mono text-[9.5px] text-dim uppercase tracking-[0.14em]">⌘ K</span>
  </label>
);

const Pill = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div
    className="hidden md:flex items-center gap-1.5 px-2.5 h-7 rounded-full text-[10.5px] mono uppercase tracking-[0.16em]"
    style={{
      background: "var(--leaf-tint)",
      color: "var(--leaf-deep)",
      border: "1px solid color-mix(in srgb, var(--leaf) 22%, transparent)",
    }}
  >
    <span>{icon}</span>
    {label}
  </div>
);

const truncate = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
