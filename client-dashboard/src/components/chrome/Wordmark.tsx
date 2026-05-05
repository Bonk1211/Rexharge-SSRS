/* RexCharge SLS wordmark — composite mark.
 * "RE" set in Fraunces semibold for editorial weight.
 * "xcharge" set in Mulish 800 with deliberate negative tracking.
 * The "x" carries a leaf-arc accent (rexharge brand cue) anchored to its center.
 * Sub-tag "Solar Layout Studio" set in mono caps for engineering signal. */

export default function Wordmark({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-baseline gap-2">
      <div className="flex items-baseline">
        <span className="numeral text-[22px] leading-none text-ink" style={{ fontWeight: 600 }}>
          RE
        </span>
        <span className="relative inline-block">
          <span
            className="font-sans text-[22px] leading-none text-ink"
            style={{ fontWeight: 800, letterSpacing: "-0.02em" }}
          >
            xcharge
          </span>
          <LeafArc />
        </span>
      </div>
      {!compact && (
        <span className="mono text-[9.5px] uppercase tracking-[0.22em] text-mute pl-1.5 border-l border-rule">
          Solar&nbsp;Layout&nbsp;Studio
        </span>
      )}
    </div>
  );
}

const LeafArc = () => (
  <svg
    aria-hidden
    width="24"
    height="14"
    viewBox="0 0 24 14"
    className="absolute -top-2 left-[6px] pointer-events-none"
  >
    <path
      d="M2 11 C 6 4, 14 2, 22 4"
      stroke="var(--leaf)"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    <circle cx="22" cy="4" r="1.6" fill="var(--leaf)" />
  </svg>
);
