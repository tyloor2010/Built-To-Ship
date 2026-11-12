import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { FolderKanban, LayoutGrid, List, Plus, Search } from "lucide-react";
import { AvatarGroup, Button, Card, EmptyState, Input, PageHeader, ProgressBar, Select, Skeleton, StatusPill, formatDate, labelize } from "@/components/pc/primitives";
import { CreateProjectModal } from "@/components/app/CreateProjectModal";
import { useWorkspaceCtx } from "@/components/app/workspace-context";
import { PROJECT_STATUSES, projectProgress, useMembers, useProjects, useTasks } from "@/lib/pc/data";
import { cn } from "@/lib/utils";

type Search = { new?: string };

export const Route = createFileRoute("/_authenticated/app/projects/")({
  validateSearch: (s: Record<string, unknown>): Search => (s["new"] ? { new: String(s["new"]) } : {}),
  head: () => ({ meta: [{ title: "Projects | SYNEXIS" }] }),
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
  const all = projects ?? [];

  const filtered = all
    .filter((p) => (status === "all" ? true : p.status === status))
    .filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <CreateProjectModal open={open} onClose={() => setOpen(false)} />
      <PageHeader
        title="Projects"
        description="Every project in this workspace, with progress and deadlines."
        actions={canWrite && <Button size="sm" onClick={() => setOpen(true)}><Plus /> New project</Button>}
      />

      {all.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative w-full max-w-xs">
            <span className="sr-only">Search projects</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search projects" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <Select aria-label="Filter by status" className="w-44" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{labelize(s)}</option>)}
          </Select>
          <div role="radiogroup" aria-label="Layout" className="flex rounded-[14px] border-2 border-foreground bg-card p-0.5 sm:ml-auto">
            {([["grid", "Grid", LayoutGrid], ["list", "List", List]] as const).map(([v, l, I]) => (
              <button key={v} role="radio" aria-checked={view === v} onClick={() => setView(v)}
                className={cn("inline-flex h-10 items-center gap-1.5 rounded-[11px] px-3 text-sm font-bold transition-colors duration-150", view === v ? "bg-foreground text-background" : "hover:bg-muted")}>
                <I className="size-4" /> {l}
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading && <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48" />)}</div>}

      {!isLoading && !all.length && (
        <EmptyState icon={FolderKanban} title="No projects yet" sub="A project holds tasks, deadlines and the people working on them."
          action={canWrite ? <Button onClick={() => setOpen(true)}>Create a project</Button> : undefined} />
      )}
      {!isLoading && all.length > 0 && !filtered.length && (
        <EmptyState icon={Search} title="No matching projects" sub="Try another name or clear the status filter."
          action={<Button variant="outline" onClick={() => { setQ(""); setStatus("all"); }}>Clear filters</Button>} />
      )}

      <div className={view === "grid" ? "grid gap-5 md:grid-cols-2 xl:grid-cols-3" : "space-y-3"}>
        {filtered.map((p) => {
          const scoped = (tasks ?? []).filter((t) => t.project_id === p.id);
          const progress = projectProgress(tasks ?? [], p.id);
          const people = (members ?? []).filter((m) => m.user_id && (scoped.some((t) => t.assignee_id === m.user_id) || m.user_id === p.owner_id));
          return (
            <Card key={p.id} hoverable className="overflow-hidden">
              <Link to="/app/projects/$projectId" params={{ projectId: p.id }} className={cn("block", view === "list" && "sm:grid sm:grid-cols-[minmax(0,1fr)_260px] sm:items-center sm:gap-6")}>
                <div className="h-2 border-b-2 border-foreground" style={{ background: p.color }} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold leading-snug">{p.name}</h3>
                    <StatusPill value={p.status} />
                  </div>
                  {p.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>}
                  <div className="mt-4 flex items-center gap-3">
                    <ProgressBar value={progress} tone={progress > 70 ? "lime" : "blue"} />
                    <span className="w-12 text-right text-sm font-bold">{scoped.length ? `${progress}%` : "—"}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <span className="text-sm text-muted-foreground">
                      {p.deadline ? `Due ${formatDate(p.deadline)}` : "No deadline"} · {scoped.length} {scoped.length === 1 ? "task" : "tasks"}
                    </span>
                    {people.length > 0 && <AvatarGroup size={28} people={people.map((m) => ({ name: m.profile?.full_name, avatar_url: m.profile?.avatar_url }))} />}
                  </div>
                </div>
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
