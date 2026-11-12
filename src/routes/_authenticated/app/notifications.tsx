import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Button, Card, EmptyState, PageHeader, Skeleton, relativeTime } from "@/components/pc/primitives";
import { useWorkspaceCtx } from "@/components/app/workspace-context";
import { useMarkNotificationRead, useNotifications } from "@/lib/pc/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/app/notifications")({
  head: () => ({ meta: [{ title: "Notifications | SYNEXIS" }] }),
  component: Notifications,
});

function Notifications() {
  const { userId } = useWorkspaceCtx();
  const { data, isLoading } = useNotifications(userId);
  const mark = useMarkNotificationRead(userId);
  const [tab, setTab] = useState<"all" | "unread">("all");
  const all = data ?? [];
  const unread = all.filter((n) => !n.read);
  const shown = tab === "all" ? all : unread;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Assignments and updates that involve you."
        actions={<Button size="sm" variant="outline" disabled={!unread.length} loading={mark.isPending} onClick={() => mark.mutate("all")}><CheckCheck /> Mark all as read</Button>}
      />
      <div role="tablist" aria-label="Filter" className="flex gap-1 border-b-2 border-foreground/15">
        {(["all", "unread"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={cn("-mb-[2px] min-h-11 border-b-2 px-4 text-sm font-bold transition-colors duration-150", tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {t === "all" ? `All (${all.length})` : `Unread (${unread.length})`}
          </button>
        ))}
      </div>
      {isLoading ? <Skeleton className="h-40" /> : !shown.length ? (
        <EmptyState icon={Bell} title={tab === "unread" ? "No unread notifications" : "No notifications yet"}
          sub="You will be notified here when someone assigns you a task."
          action={<Button asChild variant="outline"><Link to="/app/tasks">Go to My Tasks</Link></Button>} />
      ) : (
        <Card className="divide-y-2 divide-foreground/10 p-2">
          {shown.map((n) => (
            <div key={n.id} className="flex items-start gap-3 p-4">
              <span aria-hidden className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-primary")} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold">{n.title}</div>
                {n.body && <div className="text-sm text-muted-foreground">{n.body}</div>}
                <time dateTime={n.created_at} title={new Date(n.created_at).toLocaleString()} className="text-xs text-muted-foreground">{relativeTime(n.created_at)}</time>
              </div>
              {!n.read && <Button size="sm" variant="ghost" onClick={() => mark.mutate(n.id)}>Mark read</Button>}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
