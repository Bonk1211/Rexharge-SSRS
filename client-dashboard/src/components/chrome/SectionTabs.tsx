import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/* SectionTabs — anchor-style scroll tabs that stick under TopBar.
 * Active section detected via IntersectionObserver. Click scrolls to anchor. */

export interface SectionDef {
  id: string;
  label: string;
  caption?: string;
}

export default function SectionTabs({ sections }: { sections: SectionDef[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [sections]);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div
      className="sticky bg-paper/92 backdrop-blur-md z-20"
      style={{
        top: "var(--topbar-height)",
        borderBottom: "1px solid var(--rule)",
      }}
    >
      <div className="px-6 lg:px-8 h-12 flex items-center gap-1">
        {sections.map((s) => {
          const isActive = s.id === active;
          return (
            <button
              key={s.id}
              onClick={() => handleClick(s.id)}
              className={cn(
                "group relative flex items-center gap-2 h-9 px-3.5 rounded-full transition-colors",
                isActive ? "" : "hover:bg-surface-2",
              )}
              style={{
                background: isActive ? "var(--leaf-tint)" : "transparent",
                color: isActive ? "var(--leaf-deep)" : "var(--ink-2)",
              }}
              aria-current={isActive ? "true" : undefined}
            >
              <span
                aria-hidden
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-colors",
                  isActive ? "" : "opacity-60",
                )}
                style={{ background: isActive ? "var(--leaf)" : "var(--mute)" }}
              />
              <span className="text-[12.5px] font-bold tracking-tight">{s.label}</span>
              {s.caption && (
                <span
                  className={cn(
                    "mono text-[9.5px] uppercase tracking-[0.16em]",
                    isActive ? "text-leaf-deep" : "text-mute",
                  )}
                >
                  {s.caption}
                </span>
              )}
            </button>
          );
        })}
        <div className="flex-1" />
        <span className="hidden xl:inline mono text-[10px] uppercase tracking-[0.16em] text-mute">
          scroll · or click a tab
        </span>
      </div>
    </div>
  );
}
