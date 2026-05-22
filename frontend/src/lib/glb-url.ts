import { useSignedUrl } from "@/store/projects-store";

const ABSOLUTE_URL = /^https?:\/\//i;
const REMOTE_BASE = "https://solar.limziyang.ml/static";
const DEV_PROXY_BASE = "/cs-assets";

function maybeProxy(url: string): string {
  if (import.meta.env.DEV && url.startsWith(REMOTE_BASE)) {
    return DEV_PROXY_BASE + url.slice(REMOTE_BASE.length);
  }
  return url;
}

/** Resolve a report.site.modelUrl into something the browser can fetch.
 * Handles three JSON shapes:
 *   - absolute https URL → proxy via /cs-assets in dev
 *   - /static/foo        → /cs-assets/foo (dev) or REMOTE_BASE/foo (prod)
 *   - /foo (no prefix)   → REMOTE_BASE/foo, then proxy
 */
export function resolveModelUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (ABSOLUTE_URL.test(url)) return maybeProxy(url);
  if (url.startsWith("/static/")) {
    return import.meta.env.DEV
      ? DEV_PROXY_BASE + url.slice("/static".length)
      : REMOTE_BASE + url.slice("/static".length);
  }
  if (url.startsWith("/")) {
    return import.meta.env.DEV ? DEV_PROXY_BASE + url : REMOTE_BASE + url;
  }
  return url;
}

export function useGlbUrl(
  path: string | null | undefined,
): string | null | undefined {
  const isAbsolute = !!path && ABSOLUTE_URL.test(path);
  const supabasePath = isAbsolute ? undefined : path ?? undefined;
  const { data: signed } = useSignedUrl(
    supabasePath ? "project-models" : undefined,
    supabasePath,
  );
  if (isAbsolute) return maybeProxy(path);
  return signed;
}
