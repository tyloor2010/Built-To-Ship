import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Badge, Button, Card, EmptyState, ProgressBar, Skeleton, StatusPill, Avatar } from "@/components/pc/primitives";
import { useWorkspaceCtx } from "@/components/app/workspace-context";
import { projectProgress, useActivity, useFiles, useMembers, useProject, useTasks } from "@/lib/pc/data";

export const Route = createFileRoute("/_authenticated/app/projects/$projectId")({
  component: ProjectDetail,
});

const TABS = ["Overview", "Tasks", "Timeline", "Files", "Activity", "Team"] as const;

function ProjectDetail() {
  const { projectId } = Route.useParams();
  const { workspace } = useWorkspaceCtx();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const { data: project, isLoading } = useProject(projectId);
  const { data: tasks } = useTasks(workspace.id, projectId);
  const { data: members } = useMembers(workspace.id);
  const { data: files } = useFiles(workspace.id, projectId);
  const { data: activity } = useActivity(workspace.id, projectId, 20);

  if (isLoading) return <Skeleton className="h-72" />;
  if (!project) return <EmptyState emoji="🕳️" title="Project not found." sub="It may have been deleted." />;

  const list = tasks ?? [];
  const progress = projectProgress(list, project.id);
  const overdue = list.filter((t) => t.status !== "done" && t.due_date && t.due_date < new Date().toISOString().slice(0, 10));
  const health = overdue.length > 2 ? "off_track" : overdue.length > 0 ? "at_risk" : "on_track";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Link to="/app/projects" className="text-xs font-black uppercase tracking-widest text-muted-foreground">← All projects</Link>
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="size-6 shrink-0 rounded-full ink-2" style={{ background: project.color }} />
            <h1 className="display truncate text-4xl uppercase sm:text-5xl">{project.name}</h1>
          </div>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">{project.description || "No description."}</p>
        </div>
        <StatusPill value={project.status} />
      </header>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-[12px] ink-2 px-4 py-2 text-xs font-black uppercase tracking-widest ${tab === t ? "bg-primary text-primary-foreground shadow-hard-sm" : "bg-card"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card className={`p-6 ${health === "on_track" ? "bg-lime" : health === "at_risk" ? "bg-tangerine" : "bg-destructive text-destructive-foreground"}`}>
            <span className="text-[11px] font-black uppercase tracking-widest opacity-80">Project health</span>
            <div className="display mt-2 text-5xl uppercase">{health.replace("_", " ")}</div>
            <p className="mt-3 text-sm font-bold">{overdue.length} overdue · {list.length} total tasks · {progress}% complete</p>
            <ProgressBar value={progress} className="mt-4" tone="blue" />
          </Card>
          <Card className="p-6">
            <h3 className="display text-xl uppercase">Upcoming deadlines</h3>
            <ul className="mt-3 space-y-2">
              {list.filter((t) => t.due_date && t.status !== "done").slice(0, 5).map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-2 text-sm font-bold">
                  <span className="truncate">{t.title}</span>
                  <Badge tone="paper">{t.due_date}</Badge>
                </li>
              ))}
              {!list.some((t) => t.due_date) && <li className="text-sm font-semibold text-muted-foreground">Nothing scheduled.</li>}
            </ul>
          </Card>
        </div>
      )}

      {tab === "Tasks" && (
        <Card className="p-4">
          {!list.length && <p className="p-4 text-sm font-semibold text-muted-foreground">No tasks yet. Add them from My Tasks.</p>}
          <ul className="divide-y-2 divide-foreground/10">
            {list.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                <span className="min-w-0 truncate text-sm font-bold">{t.title}</span>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusPill value={t.priority} />
                  <StatusPill value={t.status} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === "Timeline" && (
        <Card className="p-6">
          <div className="space-y-4 border-l-3 border-foreground pl-5">
            {[{ l: "Start", d: project.start_date }, { l: "Deadline", d: project.deadline }].map((m) => (
              <div key={m.l} className="relative">
                <span className="absolute -left-[30px] top-1 size-4 rounded-full ink-2 bg-lime" />
                <div className="display text-lg uppercase">{m.l}</div>
                <div className="text-sm font-bold text-muted-foreground">{m.d ?? "Not set"}</div>
              </div>
            ))}
            {list.filter((t) => t.due_date).map((t) => (
              <div key={t.id} className="relative">
                <span className="absolute -left-[30px] top-1 size-4 rounded-full ink-2 bg-primary" />
                <div className="text-sm font-black uppercase">{t.title}</div>
                <div className="text-xs font-bold text-muted-foreground">{t.due_date}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "Files" && (
        <Card className="p-4">
          {!files?.length ? <p className="p-4 text-sm font-semibold text-muted-foreground">No files attached.</p> : (
            <ul className="divide-y-2 divide-foreground/10">
              {files.map((f) => (<li key={f.id} className="py-3 text-sm font-bold">{f.name}</li>))}
            </ul>
          )}
        </Card>
      )}

      {tab === "Activity" && (
        <Card className="p-4">
          {!activity?.length && <p className="p-4 text-sm font-semibold text-muted-foreground">No activity yet.</p>}
          <ul className="divide-y-2 divide-foreground/10">
            {(activity ?? []).map((a) => {
              const person = (members ?? []).find((m) => m.user_id === a.actor_id);
              return (
                <li key={a.id} className="flex items-center gap-3 py-3">
                  <Avatar name={person?.profile?.full_name ?? "Someone"} size={30} />
                  <span className="text-sm font-bold">{person?.profile?.full_name ?? "Someone"} {a.action} {a.target}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {tab === "Team" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(members ?? []).map((m) => (
            <Card key={m.id} className="flex items-center gap-3 p-4">
              <Avatar name={m.profile?.full_name ?? m.invited_email} src={m.profile?.avatar_url} size={44} />
              <div className="min-w-0">
                <div className="truncate text-sm font-black">{m.profile?.full_name ?? m.invited_email}</div>
                <Badge tone="blue">{m.role}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
