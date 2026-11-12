import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, SearchX } from "lucide-react";
import { Button, Card, EmptyState, ProgressBar, Skeleton, StatusPill, Avatar, formatDate, labelize, relativeTime } from "@/components/pc/primitives";
import { useWorkspaceCtx } from "@/components/app/workspace-context";
import { projectProgress, useActivity, useFiles, useMembers, useProject, useTasks } from "@/lib/pc/data";
import { WorkspaceFiles } from "@/components/app/WorkspaceFiles";
import { PageHeader } from "@/components/pc/primitives";
import { pageMeta } from "@/lib/pc/page-meta";

export const Route = createFileRoute("/_authenticated/app/projects/$projectId")({
  head: () => pageMeta("Project details", "Track tasks, attachments and progress in your workspace project."),
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
  if (!project || project.workspace_id !== workspace.id) return <EmptyState icon={SearchX} title="Project not found" sub="It may have been deleted, or the link is wrong." action={<Button asChild variant="outline"><Link to="/app/projects">Back to projects</Link></Button>} />;

  const list = tasks ?? [];
  const progress = projectProgress(list, project.id);
  const overdue = list.filter((t) => t.status !== "done" && t.due_date && t.due_date < new Date().toISOString().slice(0, 10));
  const health = overdue.length > 2 ? "off_track" : overdue.length > 0 ? "at_risk" : "on_track";

  return (
    <div className="space-y-6">
      <Link to="/app/projects" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> All projects</Link>
      <PageHeader title={project.name} description={project.description} actions={<StatusPill value={project.status} />} />

      <div role="tablist" className="-mx-4 flex gap-1 overflow-x-auto border-b-2 border-foreground/15 px-4 sm:mx-0 sm:px-0">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={`-mb-[2px] min-h-11 shrink-0 border-b-2 px-4 text-sm font-bold transition-colors duration-150 ${tab === t ? "border-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card className={`p-6 ${health === "on_track" ? "bg-lime" : health === "at_risk" ? "bg-tangerine" : "bg-destructive text-destructive-foreground"}`}>
            <span className="text-[11px] font-black uppercase tracking-widest opacity-80">Project health</span>
            <div className="display mt-2 text-4xl uppercase">{labelize(health)}</div>
            <p className="mt-3 text-sm font-semibold">{overdue.length} overdue · {list.length} total tasks · {progress}% complete</p>
            <ProgressBar value={progress} className="mt-4" tone="blue" />
          </Card>
          <Card className="p-6">
            <h3 className="text-base font-bold">Upcoming deadlines</h3>
            <ul className="mt-3 space-y-2">
              {list.filter((t) => t.due_date && t.status !== "done").slice(0, 5).map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-2 text-sm font-bold">
                  <span className="truncate">{t.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDate(t.due_date)}</span>
                </li>
              ))}
              {!list.some((t) => t.due_date) && <li className="text-sm text-muted-foreground">No open tasks have a due date.</li>}
            </ul>
          </Card>
        </div>
      )}

      {tab === "Tasks" && (
        <Card className="p-4">
          {!list.length && <p className="p-4 text-sm font-semibold text-muted-foreground">No tasks in this project yet. Add one from My Tasks and pick this project.</p>}
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
                <div className="text-sm font-bold">{m.l}</div>
                <div className="text-sm font-bold text-muted-foreground">{m.d ? formatDate(m.d) : "Not set"}</div>
              </div>
            ))}
            {list.filter((t) => t.due_date).map((t) => (
              <div key={t.id} className="relative">
                <span className="absolute -left-[30px] top-1 size-4 rounded-full ink-2 bg-primary" />
                <div className="text-sm font-bold">{t.title}</div>
                <div className="text-xs text-muted-foreground">{formatDate(t.due_date)}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "Files" && (
        <WorkspaceFiles projectId={projectId} />
      )}

      {tab === "Activity" && (
        <Card className="p-4">
          {!activity?.length && <p className="p-4 text-sm font-semibold text-muted-foreground">Changes to this project will appear here.</p>}
          <ul className="divide-y-2 divide-foreground/10">
            {(activity ?? []).map((a) => {
              const person = (members ?? []).find((m) => m.user_id === a.actor_id);
              return (
                <li key={a.id} className="flex items-center gap-3 py-3">
                  <Avatar name={person?.profile?.full_name ?? "Someone"} src={person?.profile?.avatar_url} size={30} />
                  <span className="text-sm"><b>{person?.profile?.full_name?.split(" ")[0] ?? "Someone"}</b> {a.action} <b>{a.target}</b> <span className="text-xs text-muted-foreground" title={new Date(a.created_at).toLocaleString()}>· {relativeTime(a.created_at)}</span></span>
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
                <div className="text-xs text-muted-foreground">{labelize(m.role)}</div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
