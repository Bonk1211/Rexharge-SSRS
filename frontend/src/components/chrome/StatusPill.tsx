import { CheckCircle, ArrowsClockwise, Warning, DotsThree } from "@/icons";
import type { ProjectStatus } from "@/data/mock-projects";

const config = {
  ready: {
    label: "ready",
    bg: "var(--leaf-tint)",
    fg: "var(--leaf-deep)",
    border: "color-mix(in srgb, var(--leaf) 30%, transparent)",
    Icon: CheckCircle,
    weight: "fill" as const,
  },
  processing: {
    label: "processing",
    bg: "var(--mint-tint)",
    fg: "#1F4E66",
    border: "color-mix(in srgb, #4DCFE0 35%, transparent)",
    Icon: ArrowsClockwise,
    weight: "bold" as const,
  },
  draft: {
    label: "draft",
    bg: "var(--surface-2)",
    fg: "var(--mute)",
    border: "var(--rule)",
    Icon: DotsThree,
    weight: "bold" as const,
  },
  failed: {
    label: "failed",
    bg: "color-mix(in srgb, var(--terracotta) 14%, transparent)",
    fg: "var(--crimson)",
    border: "color-mix(in srgb, var(--crimson) 30%, transparent)",
    Icon: Warning,
    weight: "fill" as const,
  },
};

export default function StatusPill({
  status,
  size = "md",
}: {
  status: ProjectStatus;
  size?: "sm" | "md";
}) {
  const c = config[status];
  const dims = size === "sm" ? "px-1.5 py-0.5 text-[9.5px]" : "px-2 py-0.5 text-[10.5px]";
  const iconSize = size === "sm" ? 9 : 10;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full mono uppercase tracking-[0.16em] ${dims} ${
        status === "processing" ? "animate-pulseSoft" : ""
      }`}
      style={{ background: c.bg, color: c.fg, border: `1px solid ${c.border}` }}
    >
      <c.Icon weight={c.weight} size={iconSize} />
      {c.label}
    </span>
  );
}
