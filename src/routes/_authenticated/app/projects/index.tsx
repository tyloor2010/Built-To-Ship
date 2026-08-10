import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Card, EmptyState, Input, ProgressBar, Select, Skeleton, StatusPill, AvatarGroup } from "@/components/pc/primitives";
import { CreateProjectModal } from "@/components/app/CreateProjectModal";
import { useWorkspaceCtx } from "@/components/app/workspace-context";
import { PROJECT_STATUSES, projectProgress, useMembers, useProjects, useTasks } from "@/lib/pc/data";
import { labelize } from "@/components/pc/primitives";

type Search = { new?: string };

export const Route = createFileRoute("/_authenticated/app/projects/")({
  validateSearch: (s: Record<string, unknown>): Search => (s['new'] ? { new: String(s['new']) } : {}),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { workspace, canWrite } = useWorkspaceCtx();
  const search = Route.useSearch();
  const [open, setOpen] = useState(search.new === "1");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const { data: projects, isLoading } = useProjects(workspace.id);
  const { data: tasks } = useTasks(workspace.id);
  const { data: members } = useMembers(workspace.id);

  const filtered = (projects ?? [])
    .filter((p) => (status === "all" ? true : p.status === status))
    .filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <CreateProjectModal open={open} onClose={() => setOpen(false)} />
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h1 className="display text-4xl uppercase sm:text-5xl">Projects</h1>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">Everything your team is building.</p>
        </div>
        {canWrite && <Button onClick={() => setOpen(true)}>+ New Project</Button>}
      </header>

      <div className="flex flex-wrap gap-3">
        <Input className="max-w-xs" placeholder="Search projects…" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select className="max-w-[180px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">ALL STATUSES</option>
          {PROJECT_STATUSES.map((s) => (
            <option key={s} value={s}>{labelize(s)}</option>
          ))}
        </Select>
        <Button variant="outline" onClick={() => setView(view === "grid" ? "list" : "grid")}>
          {view === "grid" ? "List view" : "Grid view"}
        </Button>
      </div>

      {isLoading && <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({length:3}).map((_,i)=><Skeleton key={i} className="h-48" />)}</div>}

      {!isLoading && !filtered.length && (
        <EmptyState emoji="📁" title="No projects yet." sub="Let's build something." action={canWrite ? <Button className="mt-2" onClick={() => setOpen(true)}>Create project →</Button> : undefined} />
      )}

      <div className={view === "grid" ? "grid gap-5 md:grid-cols-2 xl:grid-cols-3" : "space-y-3"}>
        {filtered.map((p) => {
          const progress = projectProgress(tasks ?? [], p.id);
          const count = (tasks ?? []).filter((t) => t.project_id === p.id).length;
          return (
            <Card key={p.id} hoverable className="p-5">
              <Link to="/app/projects/$projectId" params={{ projectId: p.id }} className="block">
                <div className="flex items-start justify-between gap-3">
                  <span className="size-5 shrink-0 rounded-full ink-2" style={{ background: p.color }} />
                  <StatusPill value={p.status} />
                </div>
                <h3 className="display mt-3 text-2xl uppercase">{p.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm font-semibold text-muted-foreground">{p.description || "No description."}</p>
                <div className="mt-4 flex items-center gap-3">
                  <ProgressBar value={progress} tone={progress > 70 ? "lime" : "blue"} />
                  <span className="display text-lg">{progress}%</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                    {p.deadline ? `Due ${p.deadline}` : "No deadline"} · {count} tasks
                  </span>
                  <AvatarGroup size={26} people={(members ?? []).slice(0, 4).map((m) => ({ name: m.profile?.full_name ?? m.invited_email, avatar_url: m.profile?.avatar_url }))} />
                </div>
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
