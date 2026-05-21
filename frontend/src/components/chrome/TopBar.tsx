import { useRef, useEffect } from "react";
import type { ComponentType } from "react";
import type { IconProps } from "@phosphor-icons/react";
import { Link, useLocation } from "react-router-dom";
import {
  Buildings,
  Cube,
  MagnifyingGlass,
  Plus,
  WaveSine,
} from "@/icons";
import { useSearchStore } from "@/store/search-store";
import { useDemoDialog } from "@/store/demo-dialog-store";
import CompactMark from "./CompactMark";

type IconCmp = ComponentType<IconProps>;

interface NavItem {
  to: string;
  label: string;
  shortcut?: string;
  Icon: IconCmp;
  match?: (p: string) => boolean;
  onClick?: () => void;
}

const buildNav = (openDemo: () => void): NavItem[] => [
  {
    to: "/app/projects/new",
    label: "New project",
    shortcut: "1",
    Icon: Plus,
    match: (p) => p.startsWith("/app/projects/new"),
    onClick: openDemo,
  },
  {
    to: "/app/workspace/3d-converter",
    label: "3D converter",
    shortcut: "2",
    Icon: Cube,
    match: (p) => p.startsWith("/app/workspace/3d-converter"),
  },
  {
    to: "/app/clients",
    label: "Clients",
    shortcut: "3",
    Icon: Buildings,
    match: (p) => p.startsWith("/app/clients"),
  },
  {
    to: "/app",
    label: "Monitoring",
    shortcut: "4",
    Icon: WaveSine,
    match: (p) =>
      p === "/app" ||
      p === "/app/" ||
      (p.startsWith("/app/projects/") && !p.startsWith("/app/projects/new")),
    onClick: () => {},
  },
];

export default function TopBar() {
  const location = useLocation();
  const path = location.pathname;
  const openDemo = useDemoDialog((s) => s.openDialog);
  const nav = buildNav(openDemo);
  const isActive = (item: NavItem) =>
    item.match ? item.match(path) : path === item.to || path.startsWith(`${item.to}/`);

  return (
    <header
      className="sticky top-0 z-30 bg-paper/90 backdrop-blur-md"
      style={{ height: "var(--topbar-height)", borderBottom: "1px solid var(--rule)" }}
    >
      <div className="h-full px-5 flex items-center gap-4">
        <Link to="/" className="shrink-0" aria-label="RexCharge — landing">
          <CompactMark />
        </Link>

        <nav className="hidden md:flex items-center gap-0.5">
          {nav.map((item) => (
            <NavLink key={item.to} item={item} active={isActive(item)} />
          ))}
        </nav>

        <div className="flex-1" />

        <SearchInput />

        <button
          type="button"
          onClick={openDemo}
          className="hidden md:inline-flex items-center gap-2 px-3.5 h-9 rounded-full text-[12px] font-bold tracking-tight text-paper transition-colors shrink-0"
          style={{ background: "var(--ink)" }}
        >
          <Plus weight="bold" size={13} />
          New project
        </button>
      </div>
    </header>
  );
}

const NavLink = ({ item, active }: { item: NavItem; active: boolean }) => {
  const baseProps = {
    "aria-current": active ? ("page" as const) : undefined,
    className:
      "group relative inline-flex items-center gap-2 px-3 h-9 rounded-lg text-[12.5px] font-bold tracking-tight transition-colors",
    style: {
      background: active ? "var(--leaf-tint)" : "transparent",
      color: active ? "var(--leaf-deep)" : "var(--ink-2)",
    },
  };

  const body = (
    <>
      <item.Icon size={15} weight={active ? "fill" : "duotone"} />
      <span>{item.label}</span>
      {item.shortcut && (
        <span
          className="mono text-[9px] uppercase tracking-[0.14em]"
          style={{ color: active ? "var(--leaf-deep)" : "var(--dim)" }}
          aria-hidden
        >
          {item.shortcut}
        </span>
      )}
    </>
  );

  if (item.onClick) {
    return (
      <button type="button" onClick={item.onClick} {...baseProps}>
        {body}
      </button>
    );
  }

  return (
    <Link to={item.to} {...baseProps}>
      {body}
    </Link>
  );
};

const SearchInput = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { query, setQuery, clear } = useSearchStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <label
      className="hidden xl:flex items-center gap-2 px-2.5 h-9 rounded-lg w-[260px] shrink-0"
      style={{ background: "var(--surface-2)" }}
    >
      <MagnifyingGlass weight="duotone" size={14} className="text-mute" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            clear();
            inputRef.current?.blur();
          }
        }}
        placeholder="Jump to client, address, kWp…"
        className="flex-1 bg-transparent text-[12.5px] placeholder-dim text-ink outline-none"
      />
      {query ? (
        <button onClick={() => clear()} className="text-[10px] text-mute hover:text-ink transition-colors">
          ✕
        </button>
      ) : (
        <span className="mono text-[9.5px] text-dim uppercase tracking-[0.14em]">⌘ K</span>
      )}
    </label>
  );
};
