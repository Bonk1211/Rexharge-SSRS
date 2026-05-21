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
