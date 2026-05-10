/* Tiny month-over-month sparkline. Pure SVG path, no chart library.
 * Underlay = dotted baseline; overlay = leaf-green smooth curve. */

export default function Sparkline({
  data,
  width = 120,
  height = 28,
  stroke = "var(--leaf)",
}: {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
}) {
  if (!data.length) {
    return (
      <svg width={width} height={height} aria-hidden>
        <line
          x1={4}
          x2={width - 4}
          y1={height / 2}
          y2={height / 2}
          stroke="var(--rule)"
          strokeWidth={1}
          strokeDasharray="2 3"
        />
      </svg>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const stepX = (width - 8) / (data.length - 1);

  const points = data.map((v, i) => {
    const x = 4 + i * stepX;
    const y = 4 + (height - 8) * (1 - (v - min) / span);
    return [x, y] as const;
  });

  // Catmull-Rom-like smoothing
  const path = points
    .map((p, i, arr) => {
      if (i === 0) return `M ${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
      const prev = arr[i - 1];
      const cx = (prev[0] + p[0]) / 2;
      return `Q ${cx.toFixed(1)} ${prev[1].toFixed(1)} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
    })
    .join(" ");

  const last = points[points.length - 1];

  return (
    <svg width={width} height={height} aria-hidden>
      <line
        x1={4}
        x2={width - 4}
        y1={height - 4}
        y2={height - 4}
        stroke="var(--rule)"
        strokeWidth={1}
        strokeDasharray="1 2"
      />
      <path d={path} fill="none" stroke={stroke} strokeWidth={1.4} strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="2" fill={stroke} />
    </svg>
  );
}
