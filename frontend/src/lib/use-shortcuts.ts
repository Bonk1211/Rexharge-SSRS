import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDemoDialog } from "@/store/demo-dialog-store";

const ROUTES: Record<string, string> = {
  "2": "/app/workspace/3d-converter",
  "3": "/app/clients",
};

export function useShortcuts() {
  const navigate = useNavigate();
  const openDemo = useDemoDialog((s) => s.openDialog);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "1" || e.key === "n" || e.key === "N") {
        e.preventDefault();
        openDemo();
        return;
      }
      const dest = ROUTES[e.key];
      if (dest) {
        e.preventDefault();
        navigate(dest);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate, openDemo]);
}
