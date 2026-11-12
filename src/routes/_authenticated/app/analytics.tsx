import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button, Card, EmptyState, PageHeader, StatCard } from "@/components/pc/primitives";
import { useWorkspaceCtx } from "@/components/app/workspace-context";
import { useMembers, useProjects, useTasks } from "@/lib/pc/data";

export const Route = createFileRoute("/_authenticated/app/analytics")({
  head: () => ({ meta: [{ title: "Analytics | SYNEXIS" }] }),
  component: Analytics,
});

const axis = { fontSize: 12, fill: "var(--muted-foreground)" };

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <h2 className="text-base font-bold">{title}</h2>
      <div className="mt-4 h-64">{children}</div>
    </Card>
  );
}

function Analytics() {
  const { workspace } = useWorkspaceCtx();
  const { data: tasks } = useTasks(workspace.id);
  const { data: projects } = useProjects(workspace.id);
  const { data: members } = useMembers(workspace.id);
  const list = tasks ?? [];
  const done = list.filter((t) => t.status === "done");
  const rate = list.length ? `${Math.round((done.length / list.length) * 100)}%` : "—";

  const weeks = Array.from({ length: 8 }, (_, i) => {
    const end = new Date(); end.setHours(23, 59, 59, 999); end.setDate(end.getDate() - (7 - i) * 7);
    const start = new Date(end); start.setDate(start.getDate() - 6); start.setHours(0, 0, 0, 0);
    return {
      week: start.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      completed: done.filter((t) => t.completed_at && new Date(t.completed_at) >= start && new Date(t.completed_at) <= end).length,
    };
  });
  const byProject = (projects ?? []).map((p) => ({ name: p.name, tasks: list.filter((t) => t.project_id === p.id).length })).filter((p) => p.tasks);
  const byAssignee = (members ?? []).map((m) => ({ name: m.profile?.full_name?.split(" ")[0] ?? "Member", tasks: list.filter((t) => t.assignee_id === m.user_id).length })).filter((m) => m.tasks);

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="How work is moving across the workspace." />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total tasks" value={list.length} />
        <StatCard label="Completed" value={done.length} tone="lime" />
        <StatCard label="Completion rate" value={rate} tone="blue" />
        <StatCard label="Projects" value={(projects ?? []).length} tone="grape" />
      </div>
      {!list.length ? (
        <EmptyState icon={BarChart3} title="No data to chart yet" sub="Charts fill in once your team adds and completes tasks."
          action={<Button asChild><Link to="/app/tasks" search={{ new: "1" }}>Add a task</Link></Button>} />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <ChartCard title="Tasks completed per week">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeks}>
                  <CartesianGrid stroke="var(--border)" strokeOpacity={0.1} vertical={false} />
                  <XAxis dataKey="week" tick={axis} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={axis} tickLine={false} axisLine={false} width={28} />
                  <Tooltip />
                  <Line type="monotone" dataKey="completed" name="Completed" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, stroke: "var(--foreground)", strokeWidth: 2, fill: "var(--lime)" }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          <ChartCard title="Tasks by project">
            {byProject.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byProject} layout="vertical">
                  <XAxis type="number" allowDecimals={false} tick={axis} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" tick={axis} tickLine={false} axisLine={false} width={110} />
                  <Tooltip />
                  <Bar dataKey="tasks" name="Tasks" fill="var(--primary)" stroke="var(--foreground)" strokeWidth={2} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground">No tasks are linked to a project yet.</p>}
          </ChartCard>
          <ChartCard title="Tasks by assignee">
            {byAssignee.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byAssignee}>
                  <XAxis dataKey="name" tick={axis} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={axis} tickLine={false} axisLine={false} width={28} />
                  <Tooltip />
                  <Bar dataKey="tasks" name="Tasks" fill="var(--lime)" stroke="var(--foreground)" strokeWidth={2} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground">No tasks are assigned to anyone yet.</p>}
          </ChartCard>
        </div>
      )}
    </div>
  );
}
