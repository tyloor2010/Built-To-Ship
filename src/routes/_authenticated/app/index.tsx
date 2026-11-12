import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, Check, CheckCircle2, FolderKanban, ListChecks, TrendingUp, UserPlus, Users } from "lucide-react";
import { Avatar, Button, Card, EmptyState, PageHeader, ProgressBar, Skeleton, StatCard, StatusPill, formatDate, labelize, relativeTime } from "@/components/pc/primitives";
import { useWorkspaceCtx } from "@/components/app/workspace-context";
import { useActivity, useMembers, useProjects, useTasks, projectProgress } from "@/lib/pc/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/app/")({
  head: () => ({ meta: [{ title: "Overview | SYNEXIS" }] }),
  component: Overview,
});

function useGreeting() {
  const [g, setG] = useState("Hello");
  useEffect(() => {
    const h = new Date().getHours();
    setG(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
  }, []);
  return g;
}

function Overview() {
  const { workspace, profile, userId } = useWorkspaceCtx();
  const greeting = useGreeting();
  const { data: projects, isLoading } = useProjects(workspace.id);
  const { data: tasks, isLoading: tasksLoading } = useTasks(workspace.id);
  const { data: members } = useMembers(workspace.id);
  const { data: activity } = useActivity(workspace.id, undefined, 8);

  const allTasks = tasks ?? [];
  const allProjects = projects ?? [];
  const memberList = members ?? [];
  const active = allProjects.filter((p) => !["completed", "archived"].includes(p.status));
  const due = allTasks.filter((t) => t.status !== "done" && t.due_date).length;
  const rate = allTasks.length ? `${Math.round((allTasks.filter((t) => t.status === "done").length / allTasks.length) * 100)}%` : "—";
  const firstName = (profile?.full_name ?? profile?.email ?? "there").split(/[ @]/)[0];

  const steps = [
    { done: allProjects.length > 0, label: "Create a project", to: "/app/projects" as const, icon: FolderKanban },
    { done: allTasks.length > 0, label: "Add a task", to: "/app/tasks" as const, icon: ListChecks },
    { done: memberList.length > 1, label: "Invite a teammate", to: "/app/team" as const, icon: UserPlus },
  ];
  const doneSteps = steps.filter((s) => s.done).length;
  const showSetup = !isLoading && !tasksLoading && doneSteps < 3;

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${greeting}, ${firstName}`}
        description={`Here is where ${workspace.name} stands today.`}
        actions={
          <>
            <Button asChild size="sm"><Link to="/app/projects" search={{ new: "1" }}>New project</Link></Button>
            <Button asChild size="sm" variant="outline"><Link to="/app/tasks" search={{ new: "1" }}>New task</Link></Button>
          </>
        }
      />

      {showSetup ? (
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Set up your workspace</h2>
              <p className="text-sm text-muted-foreground">{doneSteps} of 3 steps done</p>
            </div>
            <ProgressBar value={(doneSteps / 3) * 100} className="max-w-xs" />
          </div>
          <ol className="mt-5 grid gap-3 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.label}>
                <Link
                  to={s.to}
                  {...(s.to === "/app/team" ? {} : { search: { new: "1" } as never })}
                  className={cn(
                    "flex min-h-14 items-center gap-3 rounded-[14px] border-2 border-foreground p-3 text-sm font-bold transition-colors duration-150",
                    s.done ? "bg-muted text-muted-foreground" : "bg-card hover:bg-accent",
                  )}
                >
                  <span className={cn("grid size-8 shrink-0 place-items-center rounded-full border-2 border-foreground", s.done ? "bg-lime text-lime-foreground" : "bg-background")}>
                    {s.done ? <Check className="size-4" /> : i + 1}
                  </span>
                  <span className={cn(s.done && "line-through")}>{s.label}</span>
                  <s.icon className="ml-auto size-4" />
                </Link>
              </li>
            ))}
          </ol>
        </Card>
      ) : null}

      {!showSetup && (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard label="Active projects" value={active.length} icon={<TrendingUp className="size-5" />} />
          <StatCard label="Open tasks with a due date" value={due} tone="blue" icon={<CalendarDays className="size-5" />} />
          <StatCard label="Team members" value={memberList.length} tone="lime" icon={<Users className="size-5" />} />
          <StatCard label="Completion rate" value={rate} tone="grape" icon={<CheckCircle2 className="size-5" />} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Projects</h2>
          {isLoading && <Skeleton className="h-40" />}
          {!isLoading && !allProjects.length && (
            <EmptyState
              icon={FolderKanban}
              title="No projects yet"
              sub="Projects group related tasks, deadlines and people."
              action={<Button asChild><Link to="/app/projects" search={{ new: "1" }}>Create a project</Link></Button>}
            />
          )}
          <div className="space-y-3">
            {allProjects.slice(0, 6).map((p) => {
              const progress = projectProgress(allTasks, p.id);
              const count = allTasks.filter((t) => t.project_id === p.id).length;
              return (
                <Card key={p.id} hoverable className="p-5">
                  <Link to="/app/projects/$projectId" params={{ projectId: p.id }} className="block">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="size-4 shrink-0 rounded-full ink-2" style={{ background: p.color }} />
                          <h3 className="truncate text-lg font-bold">{p.name}</h3>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {count} {count === 1 ? "task" : "tasks"} · {p.deadline ? `Due ${formatDate(p.deadline)}` : "No deadline"}
                        </p>
                      </div>
                      <StatusPill value={p.status} />
                    </div>
                    <div className="mt-4 flex items-center gap-4">
                      <ProgressBar value={progress} tone={progress > 70 ? "lime" : "blue"} />
                      <span className="w-12 text-right text-sm font-bold">{count ? `${progress}%` : "—"}</span>
                    </div>
                  </Link>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Activity</h2>
            <Card className="divide-y-2 divide-foreground/10 p-2">
              {!activity?.length && <p className="p-4 text-sm text-muted-foreground">Changes to projects and tasks will appear here.</p>}
              {(activity ?? []).map((a) => {
                const person = memberList.find((m) => m.user_id === a.actor_id);
                const name = a.actor_id === userId ? "You" : (person?.profile?.full_name?.split(" ")[0] ?? "Someone");
                const target = a.action === "created the workspace" ? null : a.target;
                return (
                  <div key={a.id} className="flex items-start gap-3 p-3">
                    <Avatar name={person?.profile?.full_name ?? "Someone"} src={person?.profile?.avatar_url} size={32} />
                    <div className="min-w-0">
                      <p className="text-sm leading-snug">
                        <span className="font-bold">{name}</span> {a.action}
                        {target && <> <span className="font-bold">{a.action.startsWith("moved") ? labelize(target.toLowerCase().replace(/ /g, "_")) : target}</span></>}
                      </p>
                      <time dateTime={a.created_at} title={new Date(a.created_at).toLocaleString()} className="text-xs text-muted-foreground">
                        {relativeTime(a.created_at)}
                      </time>
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold">Team</h2>
            <Card className="p-2">
              <ul className="divide-y-2 divide-foreground/10">
                {memberList.slice(0, 6).map((m) => (
                  <li key={m.id} className="flex items-center gap-3 p-3">
                    <Avatar name={m.profile?.full_name ?? m.invited_email} src={m.profile?.avatar_url} size={32} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold">{m.profile?.full_name ?? m.invited_email ?? "Member"}</div>
                      <div className="text-xs text-muted-foreground">{labelize(m.role)}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="p-2">
                <Button asChild variant="outline" size="sm" className="w-full"><Link to="/app/team">View team</Link></Button>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
