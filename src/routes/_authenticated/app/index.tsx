import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, CheckCircle2, TrendingUp, Users } from "lucide-react";
import {
  AvatarGroup,
  Avatar,
  Button,
  Card,
  EmptyState,
  ProgressBar,
  Skeleton,
  StatCard,
  StatusPill,
} from "@/components/pc/primitives";
import { useWorkspaceCtx } from "@/components/app/workspace-context";
import { useActivity, useMembers, useProjects, useTasks, projectProgress } from "@/lib/pc/data";

export const Route = createFileRoute("/_authenticated/app/")({
  component: Overview,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "GOOD MORNING";
  if (h < 18) return "GOOD AFTERNOON";
  return "GOOD EVENING";
}

function Overview() {
  const { workspace, profile } = useWorkspaceCtx();
  const { data: projects, isLoading } = useProjects(workspace.id);
  const { data: tasks } = useTasks(workspace.id);
  const { data: members } = useMembers(workspace.id);
  const { data: activity } = useActivity(workspace.id, undefined, 8);

  const allTasks = tasks ?? [];
  const active = (projects ?? []).filter((p) => !["completed", "archived"].includes(p.status));
  const due = allTasks.filter((t) => t.status !== "done" && t.due_date).length;
  const rate = allTasks.length
    ? Math.round((allTasks.filter((t) => t.status === "done").length / allTasks.length) * 100)
    : 0;
  const firstName = (profile?.full_name ?? profile?.email ?? "there").split(" ")[0];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="display text-3xl uppercase sm:text-5xl">
            {greeting()}, {firstName}.
          </h1>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            Here's what's happening across your workspace.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button asChild size="sm">
            <Link to="/app/projects" search={{ new: "1" }}>+ New Project</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/app/tasks" search={{ new: "1" }}>+ New Task</Link>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Active projects" value={active.length} tone="paper" icon={<TrendingUp className="size-5" />} />
        <StatCard label="Tasks due" value={due} tone="blue" icon={<CalendarDays className="size-5" />} />
        <StatCard label="Team members" value={(members ?? []).length} tone="lime" icon={<Users className="size-5" />} />
        <StatCard label="Completion rate" value={`${rate}%`} tone="grape" icon={<CheckCircle2 className="size-5" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="space-y-4">
          <h2 className="display text-2xl uppercase">Project pulse</h2>
          {isLoading && <Skeleton className="h-40" />}
          {!isLoading && !projects?.length && (
            <EmptyState
              emoji="🚀"
              title="No projects yet."
              sub="Let's build something."
              action={
                <Button asChild className="mt-2">
                  <Link to="/app/projects" search={{ new: "1" }}>Create project →</Link>
                </Button>
              }
            />
          )}
          <div className="space-y-3">
            {(projects ?? []).slice(0, 6).map((p) => {
              const progress = projectProgress(allTasks, p.id);
              const count = allTasks.filter((t) => t.project_id === p.id).length;
              return (
                <Card key={p.id} hoverable className="p-5">
                  <Link to="/app/projects/$projectId" params={{ projectId: p.id }} className="block">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="size-4 shrink-0 rounded-full ink-2" style={{ background: p.color }} />
                          <h3 className="display truncate text-xl uppercase">{p.name}</h3>
                        </div>
                        <p className="mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          {count} tasks · {p.deadline ? `Due ${p.deadline}` : "No deadline"}
                        </p>
                      </div>
                      <StatusPill value={p.status} />
                    </div>
                    <div className="mt-4 flex items-center gap-4">
                      <ProgressBar value={progress} tone={progress > 70 ? "lime" : "blue"} />
                      <span className="display text-lg">{progress}%</span>
                    </div>
                  </Link>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="display text-2xl uppercase">Activity</h2>
          <Card className="divide-y-2 divide-foreground/10 p-2">
            {!activity?.length && <p className="p-4 text-sm font-semibold text-muted-foreground">Nothing yet.</p>}
            {(activity ?? []).map((a) => {
              const person = (members ?? []).find((m) => m.user_id === a.actor_id);
              return (
                <div key={a.id} className="flex items-start gap-3 p-3">
                  <Avatar name={person?.profile?.full_name ?? "Someone"} src={person?.profile?.avatar_url} size={32} />
                  <div className="min-w-0">
                    <p className="text-sm font-bold leading-tight">
                      {person?.profile?.full_name ?? "Someone"} {a.action}{" "}
                      {a.target && <span className="text-primary">{a.target}</span>}
                    </p>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {new Date(a.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </Card>

          <h2 className="display text-2xl uppercase">Team</h2>
          <Card className="p-5">
            <AvatarGroup
              size={40}
              max={8}
              people={(members ?? []).map((m) => ({
                name: m.profile?.full_name ?? m.invited_email,
                avatar_url: m.profile?.avatar_url,
              }))}
            />
            <Button asChild variant="outline" size="sm" className="mt-4 w-full">
              <Link to="/app/team">Manage team →</Link>
            </Button>
          </Card>
        </section>
      </div>
    </div>
  );
}
