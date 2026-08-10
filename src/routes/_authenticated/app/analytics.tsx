import { createFileRoute } from "@tanstack/react-router";
import { Card, ProgressBar, StatCard } from "@/components/pc/primitives";
import { useWorkspaceCtx } from "@/components/app/workspace-context";
import { TASK_STATUSES, useProjects, useTasks } from "@/lib/pc/data";
import { labelize } from "@/components/pc/primitives";

export const Route = createFileRoute("/_authenticated/app/analytics")({ component: Analytics });

function Analytics() {
  const { workspace } = useWorkspaceCtx();
  const { data: tasks } = useTasks(workspace.id);
  const { data: projects } = useProjects(workspace.id);
  const list = tasks ?? [];
  const done = list.filter((t) => t.status === "done").length;
  const rate = list.length ? Math.round((done / list.length) * 100) : 0;
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <h1 className="display text-4xl uppercase sm:text-5xl">Analytics</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total tasks" value={list.length} tone="paper" />
        <StatCard label="Completed" value={done} tone="lime" />
        <StatCard label="Completion rate" value={`${rate}%`} tone="blue" />
        <StatCard label="Projects" value={(projects ?? []).length} tone="grape" />
      </div>
      <Card className="p-6">
        <h2 className="display text-2xl uppercase">Tasks by status</h2>
        <div className="mt-4 space-y-4">
          {TASK_STATUSES.map((s) => {
            const n = list.filter((t) => t.status === s).length;
            const pct = list.length ? Math.round((n / list.length) * 100) : 0;
            return (
              <div key={s}>
                <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                  <span>{labelize(s)}</span><span>{n}</span>
                </div>
                <ProgressBar value={pct} className="mt-1" tone={s === "done" ? "lime" : "blue"} />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
