/* Four corner brackets — engineering instrument frame.
 * Each bracket is two perpendicular hairlines forming an L. */

const Corner = ({
  position,
}: {
  position: "tl" | "tr" | "bl" | "br";
}) => {
  const map: Record<string, string> = {
    tl: "top-3 left-3 border-t border-l",
    tr: "top-3 right-3 border-t border-r",
    bl: "bottom-3 left-3 border-b border-l",
    br: "bottom-3 right-3 border-b border-r",
  };
  return (
    <span
      aria-hidden
      className={`absolute w-4 h-4 ${map[position]}`}
      style={{ borderColor: "var(--ink)" }}
    />
  );
};

export default function CrosshairCorners() {
  return (
    <>
      <Corner position="tl" />
      <Corner position="tr" />
      <Corner position="bl" />
      <Corner position="br" />
    </>
  );
}
