import { useEffect, useState } from "react";
import { CrosshairSimple } from "@/icons";

/* Tracks pointer position over a parent container; emits coords as a HUD
 * tag in mono caps. Assumes mounted inside a relatively-positioned parent. */

export default function CoordReadout({ lat = 3.0578, lon = 101.6612 }: { lat?: number; lon?: number }) {
  const [pos, setPos] = useState<{ x: number; y: number; vx: number; vy: number }>({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = (e.currentTarget as HTMLElement) ?? document.documentElement;
      const rect = (target as HTMLElement).getBoundingClientRect();
      setPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        vx: rect.width,
        vy: rect.height,
      });
    };
    document.addEventListener("mousemove", handler);
    return () => document.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div
      className="bg-surface/90 backdrop-blur rounded-md px-2.5 py-1.5 flex items-center gap-2"
      style={{ border: "1px solid var(--rule)" }}
    >
      <CrosshairSimple weight="duotone" size={11} className="text-leaf-deep" />
      <div className="mono text-[10px] tab-num text-ink">
        <span className="text-mute">lat </span>
        {lat.toFixed(4)}°<span className="text-mute"> · lon </span>
        {lon.toFixed(4)}°
      </div>
      <span className="hairline-v h-3 mx-1" />
      <span className="mono text-[10px] text-mute tab-num">
        x{Math.round(pos.x)} y{Math.round(pos.y)}
      </span>
    </div>
  );
}
