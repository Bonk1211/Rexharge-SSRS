import { useRef, useEffect } from "react";
import type { ComponentType } from "react";
import type { IconProps } from "@phosphor-icons/react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  Bell,
  Buildings,
  GearSix,
  House,
  ListChecks,
  MagnifyingGlass,
  Plus,
  Sparkle,
  Stack,
  User,
} from "@/icons";
import { useSearchStore } from "@/store/search-store";
import CompactMark from "./CompactMark";

type IconCmp = ComponentType<IconProps>;

interface NavItem {
  to: string;
  label: string;
  shortcut?: string;
  Icon: IconCmp;
  match?: (p: string) => boolean;
}

const NAV: NavItem[] = [
  {
    to: "/app",
    label: "Workspace",
    shortcut: "1",
    Icon: House,
    match: (p) => p === "/app" || p === "/app/" || p.startsWith("/app/workspace") || p.startsWith("/app/projects"),
  },
  { to: "/app/captures", label: "Captures", shortcut: "2", Icon: Stack },
  { to: "/app/reports", label: "Reports", shortcut: "3", Icon: ListChecks },
  { to: "/app/portfolio", label: "Portfolio", shortcut: "4", Icon: Buildings },
];

export default function TopBar() {
  const location = useLocation();
  const path = location.pathname;
  const isActive = (item: NavItem) =>
    item.match ? item.match(path) : path === item.to || path.startsWith(`${item.to}/`);

  return (
    <header
      className="sticky top-0 z-30 bg-paper/90 backdrop-blur-md"
      style={{ height: "var(--topbar-height)", borderBottom: "1px solid var(--rule)" }}
    >
      <div className="h-full px-5 flex items-center gap-4">
        <Link to="/app" className="shrink-0" aria-label="RexCharge home">
          <CompactMark />
        </Link>

        <nav className="hidden md:flex items-center gap-0.5">
          {NAV.map((item) => (
            <NavLink key={item.to} item={item} active={isActive(item)} />
          ))}
        </nav>

        <div className="flex-1" />

        <SearchInput />

        <Pill icon={<Sparkle weight="duotone" size={13} />} label="ATAP NEM 3.0 · live" />

        <Link
          to="/app/projects/new"
          className="hidden md:inline-flex items-center gap-2 px-3.5 h-9 rounded-full text-[12px] font-bold tracking-tight text-paper transition-colors shrink-0"
          style={{ background: "var(--ink)" }}
        >
          <Plus weight="bold" size={13} />
          New project
        </Link>

        <button
          aria-label="Notifications"
          onClick={() => toast("Coming soon")}
          className="relative w-9 h-9 rounded-full grid place-items-center text-mute hover:text-ink hover:bg-surface-2 transition-colors shrink-0"
        >
          <Bell weight="duotone" size={16} />
          <span
            aria-hidden
            className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--terracotta)" }}
          />
        </button>

        <Link
          to="/app/help"
          aria-label="Help"
          className="hidden lg:grid w-9 h-9 rounded-full place-items-center text-mute hover:text-ink hover:bg-surface-2 transition-colors shrink-0"
        >
          <Sparkle weight="duotone" size={16} />
        </Link>

        <Link
          to="/app/settings"
          aria-label="Settings"
          className="hidden lg:grid w-9 h-9 rounded-full place-items-center text-mute hover:text-ink hover:bg-surface-2 transition-colors shrink-0"
        >
          <GearSix weight="duotone" size={16} />
        </Link>

        <Link
          to="/app/settings"
          aria-label="Profile"
          className="w-9 h-9 rounded-full grid place-items-center shrink-0"
          style={{
            background: "var(--leaf-tint)",
            border: "1px solid color-mix(in srgb, var(--leaf) 30%, transparent)",
            color: "var(--leaf-deep)",
          }}
        >
          <User weight="duotone" size={14} />
        </Link>
      </div>
    </header>
  );
}

const NavLink = ({ item, active }: { item: NavItem; active: boolean }) => (
  <Link
    to={item.to}
    aria-current={active ? "page" : undefined}
    className="group relative inline-flex items-center gap-2 px-3 h-9 rounded-lg text-[12.5px] font-bold tracking-tight transition-colors"
    style={{
      background: active ? "var(--leaf-tint)" : "transparent",
      color: active ? "var(--leaf-deep)" : "var(--ink-2)",
    }}
  >
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
  </Link>
);

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
        placeholder="Jump to project, address, kWp…"
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

const Pill = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div
    className="hidden md:flex items-center gap-1.5 px-2.5 h-7 rounded-full text-[10.5px] mono uppercase tracking-[0.16em] shrink-0"
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
