import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ROUTES: Record<string, string> = {
  "1": "/app",
  "2": "/app/captures",
  "3": "/app/reports",
  "4": "/app/portfolio",
  n: "/app/projects/new",
  N: "/app/projects/new",
};

export function useShortcuts() {
  const navigate = useNavigate();
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const dest = ROUTES[e.key];
      if (dest) {
        e.preventDefault();
        navigate(dest);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);
}
