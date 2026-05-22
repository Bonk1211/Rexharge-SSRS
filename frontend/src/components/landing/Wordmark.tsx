interface WordmarkProps {
  compact?: boolean;
}

export default function Wordmark({ compact }: WordmarkProps) {
  return (
    <div className="flex items-baseline" style={{ gap: 10 }}>
      <div className="flex items-baseline">
        <span className="numeral" style={{ fontSize: 24, fontWeight: 600, color: "var(--ink)", lineHeight: 1 }}>
          RE
        </span>
        <span style={{ position: "relative", display: "inline-block" }}>
          <span
            style={{
              fontFamily: "Mulish, sans-serif",
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "var(--ink)",
              lineHeight: 1,
            }}
          >
            xharge
          </span>
          <svg
            aria-hidden
            width="26"
            height="14"
            viewBox="0 0 26 14"
            style={{ position: "absolute", top: -8, left: 4, pointerEvents: "none" }}
          >
            <path d="M2 11 C 6 4, 14 2, 22 4" stroke="var(--leaf)" strokeWidth="2" fill="none" strokeLinecap="round" />
            <circle cx="22" cy="4" r="1.8" fill="var(--leaf)" />
          </svg>
        </span>
      </div>
      {!compact && (
        <span
          className="mono wordmark-caption"
          style={{
            fontSize: 10,
            letterSpacing: "0.22em",
            color: "var(--mute)",
            paddingLeft: 10,
            borderLeft: "1px solid var(--rule)",
            textTransform: "uppercase",
          }}
        >
          Solar&nbsp;Layout&nbsp;Studio
        </span>
      )}
    </div>
  );
}
