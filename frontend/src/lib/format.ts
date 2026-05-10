/** Format helpers — RM, kWh, kWp, percentages with sensible defaults. */

export const fmtRM = (n: number, opts: { compact?: boolean } = {}) => {
  if (opts.compact && Math.abs(n) >= 1000) {
    return `RM ${(n / 1000).toLocaleString("en-MY", { maximumFractionDigits: 1 })}k`;
  }
  return `RM ${n.toLocaleString("en-MY", { maximumFractionDigits: 0 })}`;
};

export const fmtKWh = (n: number) =>
  `${n.toLocaleString("en-MY", { maximumFractionDigits: 0 })}`;

export const fmtKWp = (n: number) =>
  n.toLocaleString("en-MY", { minimumFractionDigits: 1, maximumFractionDigits: 2 });

export const fmtPct = (n: number, digits = 1) =>
  `${(n * 100).toFixed(digits)}%`;

export const fmtMeters = (n: number) => `${n.toFixed(2)} m`;

export const fmtYears = (n: number) =>
  `${n.toLocaleString("en-MY", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} yr`;

export const fmtRelTime = (iso: string) => {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.round(ms / 60_000);
  if (min < 1) return "moments ago";
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const days = Math.round(hr / 24);
  if (days < 30) return `${days} d ago`;
  return new Date(iso).toLocaleDateString("en-MY", { day: "2-digit", month: "short" });
};
