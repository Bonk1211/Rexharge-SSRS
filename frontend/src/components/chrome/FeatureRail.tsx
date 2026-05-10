import { Link, useLocation } from "react-router-dom";
import type { ComponentType } from "react";
import {
  Buildings,
  GearSix,
  House,
  ListChecks,
  Stack,
  Sparkle,
  User,
} from "@/icons";
import { RinggitGlyph } from "@/icons";
import CompactMark from "./CompactMark";

interface NavItem {
  to: string;
  label: string;
  hint: string;
  shortcut?: string;
  Icon: ComponentType<{ size?: number; weight?: "duotone" | "fill" | "bold" | "regular"; className?: string }>;
  matchPrefix?: string;
}

const NAV: NavItem[] = [
  {
    to: "/",
    label: "Workspace",
    hint: "Portfolio overview",
    shortcut: "1",
    Icon: ({ size, weight }) => <House size={size} weight={weight} />,
  },
  {
    to: "/captures",
    label: "Captures",
    hint: "Drone uploads · photo sets",
    shortcut: "2",
    Icon: ({ size, weight }) => <Stack size={size} weight={weight} />,
  },
  {
    to: "/reports",
    label: "Reports",
    hint: "Engineering PDFs",
    shortcut: "3",
    Icon: ({ size, weight }) => <ListChecks size={size} weight={weight} />,
  },
  {
    to: "/tariffs",
    label: "Tariffs",
    hint: "TNB blocks · ATAP NEM 3.0",
    shortcut: "4",
    Icon: ({ size, className }) => <RinggitGlyph size={size} className={className} />,
  },
  {
    to: "/portfolio",
    label: "Portfolio",
    hint: "All sites · all kWp",
    shortcut: "5",
    Icon: ({ size, weight }) => <Buildings size={size} weight={weight} />,
  },
];

const FOOTER: NavItem[] = [
  {
    to: "/help",
    label: "Help",
    hint: "Docs & shortcuts",
    Icon: ({ size, weight }) => <Sparkle size={size} weight={weight} />,
  },
  {
    to: "/settings",
    label: "Settings",
    hint: "Workspace preferences",
    Icon: ({ size, weight }) => <GearSix size={size} weight={weight} />,
  },
];

export default function FeatureRail() {
  const location = useLocation();
  const path = location.pathname;
  const isActive = (item: NavItem) => {
    if (item.to === "/") return path === "/" || path.startsWith("/workspace") || path.startsWith("/projects");
    return path === item.to || path.startsWith(`${item.to}/`);
  };

  return (
    <aside
      className="hidden lg:flex flex-col items-center bg-surface shrink-0"
      style={{
        width: "var(--rail-feature)",
        borderRight: "1px solid var(--rule)",
        position: "sticky",
        top: 0,
        height: "100vh",
        zIndex: 50,
      }}
    >
      <Link to="/" className="mt-3 mb-4" aria-label="RexCharge home">
        <CompactMark />
      </Link>

      <span aria-hidden className="w-7 hairline" />

      <nav className="flex flex-col items-center gap-1 mt-3 flex-1">
        {NAV.map((item) => (
          <RailButton key={item.to} item={item} active={isActive(item)} />
        ))}
      </nav>

      <div className="mb-3 flex flex-col items-center gap-1">
        <span aria-hidden className="w-7 hairline mb-2" />
        {FOOTER.map((item) => (
          <RailButton key={item.to} item={item} active={isActive(item)} />
        ))}
        <Avatar />
      </div>
    </aside>
  );
}

const RailButton = ({ item, active }: { item: NavItem; active: boolean }) => {
  return (
    <Link
      to={item.to}
      className="group relative w-11 h-11 grid place-items-center rounded-xl transition-colors"
      style={{
        background: active ? "var(--leaf-tint)" : "transparent",
        color: active ? "var(--leaf-deep)" : "var(--ink-2)",
      }}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
    >
      {active && (
        <span
          aria-hidden
          className="absolute -left-[10px] top-2 bottom-2 w-[3px] rounded-full"
          style={{ background: "var(--leaf)" }}
        />
      )}
      <item.Icon size={20} weight={active ? "fill" : "duotone"} />
      {/* Tooltip + label cluster */}
      <span
        className="absolute left-[60px] top-1/2 -translate-y-1/2 pointer-events-none whitespace-nowrap rounded-md px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50"
        style={{
          background: "var(--ink)",
          color: "var(--paper)",
          boxShadow: "0 12px 32px -16px rgba(26,31,28,0.5)",
        }}
        role="tooltip"
      >
        <span className="block text-[12px] font-bold tracking-tight">{item.label}</span>
        <span className="block mono text-[9.5px] uppercase tracking-[0.16em]" style={{ color: "var(--leaf)" }}>
          {item.hint}
        </span>
        {item.shortcut && (
          <span
            className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45"
            style={{ background: "var(--ink)" }}
            aria-hidden
          />
        )}
      </span>

      {item.shortcut && (
        <span
          className="absolute -bottom-0.5 right-1.5 mono text-[8px] uppercase tracking-[0.1em]"
          style={{ color: active ? "var(--leaf-deep)" : "var(--dim)" }}
          aria-hidden
        >
          {item.shortcut}
        </span>
      )}
    </Link>
  );
};

const Avatar = () => (
  <Link
    to="/settings"
    className="mt-2 w-9 h-9 rounded-full grid place-items-center"
    style={{
      background: "var(--leaf-tint)",
      border: "1px solid color-mix(in srgb, var(--leaf) 30%, transparent)",
      color: "var(--leaf-deep)",
    }}
    aria-label="Profile"
  >
    <User weight="duotone" size={14} />
  </Link>
);
