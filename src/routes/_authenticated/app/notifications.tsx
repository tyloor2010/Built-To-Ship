import { createFileRoute } from "@tanstack/react-router";
import { Card, EmptyState } from "@/components/pc/primitives";
import { useWorkspaceCtx } from "@/components/app/workspace-context";
import { useNotifications } from "@/lib/pc/data";

export const Route = createFileRoute("/_authenticated/app/notifications")({ component: Notifications });

function Notifications() {
  const { workspace } = useWorkspaceCtx();
  const { data } = useNotifications(workspace.id);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="display text-4xl uppercase sm:text-5xl">Notifications</h1>
      {!data?.length && <EmptyState emoji="🔔" title="All clear." sub="You're caught up." />}
      <Card className="divide-y-2 divide-foreground/10 p-2">
        {(data ?? []).map((n) => (
          <div key={n.id} className="p-4">
            <div className="text-sm font-black uppercase">{n.title}</div>
            <div className="text-sm font-semibold text-muted-foreground">{n.body}</div>
          </div>
        ))}
      </Card>
    </div>
  );
}
