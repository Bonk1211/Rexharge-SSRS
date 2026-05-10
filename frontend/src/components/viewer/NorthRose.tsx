/* North rose floating over viewer — displays cardinal headings,
 * with N highlighted in leaf-green. Accepts a rotation in degrees
 * to reflect user-set north calibration. */

export default function NorthRose({ rotationDeg = 0 }: { rotationDeg?: number }) {
  return (
    <div
      className="relative w-[78px] h-[78px] rounded-full bg-surface/85 backdrop-blur"
      style={{
        border: "1px solid var(--rule)",
        boxShadow: "0 8px 24px -12px rgba(26,31,28,0.18)",
      }}
    >
      <div
        className="absolute inset-2 rounded-full transition-transform duration-500 ease-out"
        style={{ transform: `rotate(${rotationDeg}deg)` }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--rule)" strokeWidth="0.6" />
          <circle cx="50" cy="50" r="32" fill="none" stroke="var(--rule)" strokeWidth="0.5" strokeDasharray="2 3" />
          {/* tick marks */}
          {Array.from({ length: 36 }).map((_, i) => {
            const angle = (i / 36) * Math.PI * 2;
            const inner = i % 9 === 0 ? 36 : 40;
            const outer = 44;
            const x1 = 50 + inner * Math.cos(angle);
            const y1 = 50 + inner * Math.sin(angle);
            const x2 = 50 + outer * Math.cos(angle);
            const y2 = 50 + outer * Math.sin(angle);
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--ink)" strokeWidth={i % 9 === 0 ? 0.9 : 0.4} />
            );
          })}
          {/* north triangle */}
          <polygon points="50,12 54,46 50,42 46,46" fill="var(--leaf)" stroke="var(--leaf-deep)" strokeWidth="0.4" />
          <polygon points="50,88 54,54 50,58 46,54" fill="var(--ink)" />
          <text x="50" y="9" textAnchor="middle" fontSize="9" fontFamily="Mulish" fontWeight="800" fill="var(--leaf-deep)">N</text>
          <text x="50" y="98" textAnchor="middle" fontSize="6.5" fontFamily="JetBrains Mono Variable, monospace" fill="var(--mute)">S</text>
          <text x="3" y="52" textAnchor="middle" fontSize="6.5" fontFamily="JetBrains Mono Variable, monospace" fill="var(--mute)">W</text>
          <text x="97" y="52" textAnchor="middle" fontSize="6.5" fontFamily="JetBrains Mono Variable, monospace" fill="var(--mute)">E</text>
        </svg>
      </div>
    </div>
  );
}
