import { cn } from "@/lib/cn";

type Variant = "solid" | "dashed" | "dotted" | "double";

export default function HairlineRule({
  className,
  variant = "solid",
  vertical,
  label,
}: {
  className?: string;
  variant?: Variant;
  vertical?: boolean;
  label?: string;
}) {
  if (label) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <Line variant={variant} className="flex-1" />
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-mute">{label}</span>
        <Line variant={variant} className="flex-1" />
      </div>
    );
  }
  if (vertical) {
    return <div className={cn("w-px self-stretch", styleFor(variant, true), className)} />;
  }
  return <Line variant={variant} className={className} />;
}

const Line = ({ variant, className }: { variant: Variant; className?: string }) => (
  <div className={cn("h-px", styleFor(variant, false), className)} />
);

const styleFor = (v: Variant, vertical: boolean) => {
  const dir = vertical ? "border-l" : "border-t";
  if (v === "dashed") return `${dir} border-dashed border-rule`;
  if (v === "dotted") return `${dir} border-dotted border-rule`;
  if (v === "double") return `${dir} border-double border-2 border-rule`;
  return "bg-rule";
};
