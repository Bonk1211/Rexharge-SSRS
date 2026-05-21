import { useQuery } from "@tanstack/react-query";
import { ArrowsClockwise, CheckCircle, Sparkle, Warning } from "@/icons";
import { listEvents, type ProjectEvent } from "@/lib/projects-api";
import { useProjects } from "@/store/projects-store";

/* Activity feed — recent pipeline events from Supabase.
 * Hairline timeline with mono timestamps. */

type Kind = "ready" | "processing" | "failed" | "atap";

const config: Record<Kind, { Icon: typeof CheckCircle; color: string; bg: string }> = {
  ready: { Icon: CheckCircle, color: "var(--leaf-deep)", bg: "var(--leaf-tint)" },
  processing: { Icon: ArrowsClockwise, color: "var(--ink-blue)", bg: "var(--mint-tint)" },
  failed: { Icon: Warning, color: "var(--crimson)", bg: "color-mix(in srgb, var(--terracotta) 14%, transparent)" },
  atap: { Icon: Sparkle, color: "var(--leaf-deep)", bg: "var(--leaf-tint)" },
};

function kindFor(eventKind: string): Kind {
  if (eventKind === "created") return "ready";
  if (eventKind === "failed") return "failed";
  return "processing";
}

interface EnrichedEvent extends ProjectEvent {
  projectName?: string;
}

function formatTime(iso: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kuala_Lumpur",
    });
  } catch {
    return "—";
  }
}

interface ActivityFeedProps {
  projectId?: string;
}

export default function ActivityFeed({ projectId }: ActivityFeedProps) {
  const { data: projects = [] } = useProjects();

  const singleQuery = useQuery({
    queryKey: ["events", projectId ?? ""],
    queryFn: () => listEvents(projectId as string),
    enabled: !!projectId,
  });

  const allQuery = useQuery<EnrichedEvent[]>({
    queryKey: ["events", "all"],
    queryFn: async () => {
      const top = projects.slice(0, 10);
      const lists = await Promise.all(
        top.map(async (p) => {
          try {
            const events = await listEvents(p.id);
            return events.map((e) => ({ ...e, projectName: p.name }));
          } catch {
            return [] as EnrichedEvent[];
          }
        }),
      );
      const flat: EnrichedEvent[] = lists.flat();
      flat.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
      return flat.slice(0, 6);
    },
    enabled: !projectId && projects.length > 0,
  });

  const events: EnrichedEvent[] = projectId
    ? (singleQuery.data ?? []).map((e) => ({
        ...e,
        projectName: projects.find((p) => p.id === e.projectId)?.name,
      }))
    : allQuery.data ?? [];

  return (
    <div className="bg-surface rounded-2xl p-5" style={{ border: "1px solid var(--rule)" }}>
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-[13px] font-extrabold tracking-tight">Pipeline activity</h3>
        <span className="mono text-[10px] uppercase tracking-[0.16em] text-mute">Today · KL Time</span>
      </div>

      {events.length === 0 ? (
        <p className="text-[12.5px] text-mute">No activity yet — create a project to begin.</p>
      ) : (
        <ol className="relative">
          <span
            aria-hidden
            className="absolute left-[15px] top-2 bottom-2 w-px"
            style={{
              background:
                "repeating-linear-gradient(to bottom, var(--rule) 0, var(--rule) 3px, transparent 3px, transparent 7px)",
            }}
          />
          {events.map((event) => {
            const k = kindFor(event.kind);
            const c = config[k];
            const site = event.projectName ?? event.projectId;
            const time = formatTime(event.createdAt);
            const note = event.message ?? event.kind;
            return (
              <li key={event.id} className="relative pl-9 pb-4 last:pb-0">
                <span
                  className="absolute left-0 top-0 w-[30px] h-[30px] rounded-full flex items-center justify-center"
                  style={{
                    background: c.bg,
                    border: `1px solid color-mix(in srgb, ${c.color} 30%, transparent)`,
                  }}
                >
                  <c.Icon weight={k === "processing" ? "bold" : "fill"} size={13} style={{ color: c.color }} />
                </span>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[12.5px] font-bold text-ink">{site}</span>
                  <span className="mono text-[10px] text-mute tab-num">{time}</span>
                </div>
                <p className="text-[12px] text-mute leading-relaxed">{note}</p>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
