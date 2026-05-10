/* Compact RexCharge mark — square, used in tight spaces (FeatureRail head).
 * Custom glyph: stylised leaf-arc + spark on a deep ink chip. */

export default function CompactMark() {
  return (
    <div
      className="w-10 h-10 rounded-xl relative grid place-items-center"
      style={{ background: "var(--ink)" }}
      aria-label="RexCharge SLS"
    >
      <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden>
        <path
          d="M6 22 C 12 8, 22 6, 26 10"
          stroke="var(--leaf)"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="26" cy="10" r="2.2" fill="var(--solar)" />
        <line x1="6" y1="26" x2="26" y2="26" stroke="var(--paper)" strokeWidth="1.4" />
        <line
          x1="9"
          y1="22"
          x2="14"
          y2="18"
          stroke="var(--mint)"
          strokeWidth="1.2"
          strokeDasharray="1.4 1.4"
        />
      </svg>
    </div>
  );
}
