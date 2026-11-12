import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { Avatar, Card, EmptyState, PageHeader, Skeleton, labelize } from "@/components/pc/primitives";
import { useWorkspaceCtx } from "@/components/app/workspace-context";
import { useMembers } from "@/lib/pc/data";

export const Route = createFileRoute("/_authenticated/app/team")({
  head: () => ({ meta: [{ title: "Team | SYNEXIS" }] }),
  component: Team,
});

function Team() {
  const { workspace } = useWorkspaceCtx();
  const { data: members, isLoading } = useMembers(workspace.id);
  const list = (members ?? []) as (NonNullable<typeof members>[number] & { created_at?: string })[];
  return (
    <div className="space-y-6">
      <PageHeader title="Team" description={`People with access to ${workspace.name}.`} />
      {isLoading ? <Skeleton className="h-40" /> : !list.length ? (
        <EmptyState icon={Users} title="No members" sub="People who join this workspace will be listed here." />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b-2 border-foreground">
                {["Name", "Email", "Role", "Joined"].map((h) => <th key={h} scope="col" className="px-5 py-3 text-[11px] font-black uppercase tracking-widest text-muted-foreground">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-foreground/10">
              {list.map((m) => (
                <tr key={m.id}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={m.profile?.full_name ?? m.invited_email} src={m.profile?.avatar_url} size={32} />
                      <span className="font-bold">{m.profile?.full_name ?? "Invited"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{m.profile?.email ?? m.invited_email}</td>
                  <td className="px-5 py-3">{labelize(m.role)}</td>
                  <td className="px-5 py-3 text-muted-foreground">{m.created_at ? new Date(m.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      <p className="text-sm text-muted-foreground">Inviting teammates by email is not available yet.</p>
    </div>
  );
}
