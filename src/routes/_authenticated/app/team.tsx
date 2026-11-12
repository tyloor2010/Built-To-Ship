import { createFileRoute } from "@tanstack/react-router";
import { Avatar, Badge, Card, EmptyState } from "@/components/pc/primitives";
import { useWorkspaceCtx } from "@/components/app/workspace-context";
import { useMembers } from "@/lib/pc/data";

export const Route = createFileRoute("/_authenticated/app/team")({ component: Team });

function Team() {
  const { workspace } = useWorkspaceCtx();
  const { data: members } = useMembers(workspace.id);
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <h1 className="display text-3xl uppercase sm:text-5xl">Team</h1>
      {!members?.length && <EmptyState emoji="👥" title="Just you for now." sub="Invite teammates to collaborate." />}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(members ?? []).map((m) => (
          <Card key={m.id} className="flex items-center gap-3 p-4">
            <Avatar name={m.profile?.full_name ?? m.invited_email} src={m.profile?.avatar_url} size={48} />
            <div className="min-w-0">
              <div className="truncate text-sm font-black">{m.profile?.full_name ?? m.invited_email}</div>
              <div className="truncate text-xs font-semibold text-muted-foreground">{m.profile?.email ?? m.invited_email}</div>
              <Badge tone="blue" className="mt-1">{m.role}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
