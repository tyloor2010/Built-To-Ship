import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarDays, LayoutGrid, List, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, Button, Card, Field, Input, PageHeader, Select, Skeleton, StatusPill, Textarea, formatDate, labelize } from "@/components/pc/primitives";
import { Modal } from "@/components/app/CreateProjectModal";
import { useWorkspaceCtx } from "@/components/app/workspace-context";
import { PRIORITIES, TASK_STATUSES, useMembers, useProjects, useTasks, type Task } from "@/lib/pc/data";
import { cn } from "@/lib/utils";

type Search = { new?: string };

export const Route = createFileRoute("/_authenticated/app/tasks")({
  validateSearch: (s: Record<string, unknown>): Search => (s["new"] ? { new: String(s["new"]) } : {}),
  head: () => ({ meta: [{ title: "My Tasks | SYNEXIS" }] }),
  component: TasksPage,
});

const HINTS: Record<string, string> = {
  backlog: "Ideas and work for later.",
  todo: "Ready to start.",
  in_progress: "Being worked on now.",
  review: "Waiting for a check.",
  done: "Finished work lands here.",
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function TasksPage() {
  const { workspace, userId, canWrite } = useWorkspaceCtx();
  const search = Route.useSearch();
  const qc = useQueryClient();
  const [view, setView] = useState<"board" | "list">("board");
  const [open, setOpen] = useState(search.new === "1");
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);
  const { data: tasks, isLoading } = useTasks(workspace.id);
  const { data: projects } = useProjects(workspace.id);
  const { data: members } = useMembers(workspace.id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assignee, setAssignee] = useState("");
  const [saving, setSaving] = useState(false);

  function openNew(col = "todo") {
    setStatus(col);
    setOpen(true);
  }

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("tasks").insert({
      workspace_id: workspace.id,
      project_id: projectId || null,
      title,
      description,
      status,
      priority,
      due_date: dueDate || null,
      assignee_id: assignee || null,
      created_by: userId,
    });
    if (error) {
      setSaving(false);
      toast.error(`Could not create the task. ${error.message}`);
      return;
    }
    await supabase.from("activity_logs").insert({ workspace_id: workspace.id, actor_id: userId, action: "created task", target: title, project_id: projectId || null });
    if (assignee && assignee !== userId) {
      await supabase.from("notifications").insert({ workspace_id: workspace.id, user_id: assignee, type: "task_assigned", title: "New task assigned", body: title });
    }
    await qc.invalidateQueries();
    setSaving(false);
    toast.success("Task created");
    setTitle("");
    setDescription("");
    setDueDate("");
    setOpen(false);
  }

  async function move(task: Task, next: string) {
    const { error } = await supabase.from("tasks").update({ status: next, completed_at: next === "done" ? new Date().toISOString() : null }).eq("id", task.id);
    if (error) {
      toast.error(`Could not move the task. ${error.message}`);
      return;
    }
    await supabase.from("activity_logs").insert({ workspace_id: workspace.id, actor_id: userId, action: `moved ${task.title} to`, target: labelize(next), project_id: task.project_id });
    await qc.invalidateQueries({ queryKey: ["tasks"] });
  }

  const list = tasks ?? [];

  function TaskCard({ t }: { t: Task }) {
    const person = (members ?? []).find((m) => m.user_id === t.assignee_id);
    const overdue = t.due_date && t.status !== "done" && t.due_date < today();
    const idx = TASK_STATUSES.indexOf(t.status as never);
    return (
      <Card
        draggable={canWrite}
        tabIndex={0}
        aria-label={`${t.title}. ${labelize(t.status)}. Use left and right arrow keys to move.`}
        onDragStart={() => setDragId(t.id)}
        onDragEnd={() => { setDragId(null); setOverCol(null); }}
        onKeyDown={(e) => {
          if (!canWrite) return;
          if (e.key === "ArrowRight" && idx < TASK_STATUSES.length - 1) { e.preventDefault(); void move(t, TASK_STATUSES[idx + 1]!); }
          if (e.key === "ArrowLeft" && idx > 0) { e.preventDefault(); void move(t, TASK_STATUSES[idx - 1]!); }
        }}
        className={cn("cursor-grab rounded-[14px] p-3 shadow-hard-sm focus-visible:outline-3 focus-visible:outline-primary active:cursor-grabbing", dragId === t.id && "opacity-50")}
      >
        <div className="text-sm font-bold leading-snug">{t.title}</div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <StatusPill value={t.priority} />
          <div className="flex items-center gap-2">
            {t.due_date && (
              <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", overdue ? "text-destructive" : "text-muted-foreground")}>
                <CalendarDays className="size-3.5" />
                {formatDate(t.due_date)}
              </span>
            )}
            {person && <Avatar name={person.profile?.full_name} src={person.profile?.avatar_url} size={24} />}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Modal open={open} onClose={() => setOpen(false)} title="New task">
        <form onSubmit={createTask} className="space-y-4">
          <Field label="Title"><Input required autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Design pricing page" /></Field>
          <Field label="Description"><Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Status">
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>{TASK_STATUSES.map((s) => <option key={s} value={s}>{labelize(s)}</option>)}</Select>
            </Field>
            <Field label="Priority">
              <Select value={priority} onChange={(e) => setPriority(e.target.value)}>{PRIORITIES.map((s) => <option key={s} value={s}>{labelize(s)}</option>)}</Select>
            </Field>
            <Field label="Project">
              <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                <option value="">No project</option>
                {(projects ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </Field>
            <Field label="Assignee">
              <Select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                <option value="">Unassigned</option>
                {(members ?? []).filter((m) => m.user_id).map((m) => <option key={m.id} value={m.user_id!}>{m.profile?.full_name ?? m.invited_email}</option>)}
              </Select>
            </Field>
            <Field label="Due date"><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Create task</Button>
          </div>
        </form>
      </Modal>

      <PageHeader
        title="My Tasks"
        description="Drag cards between columns, or focus a card and use the arrow keys."
        actions={
          <>
            <div role="radiogroup" aria-label="View" className="flex rounded-[14px] border-2 border-foreground bg-card p-0.5">
              {([["board", "Board", LayoutGrid], ["list", "List", List]] as const).map(([v, l, I]) => (
                <button key={v} role="radio" aria-checked={view === v} onClick={() => setView(v)}
                  className={cn("inline-flex h-9 items-center gap-1.5 rounded-[11px] px-3 text-sm font-bold transition-colors duration-150", view === v ? "bg-foreground text-background" : "hover:bg-muted")}>
                  <I className="size-4" /> {l}
                </button>
              ))}
            </div>
            {canWrite && <Button size="sm" onClick={() => openNew()}><Plus /> New task</Button>}
          </>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">{TASK_STATUSES.map((s) => <Skeleton key={s} className="h-80" />)}</div>
      ) : view === "board" ? (
        <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          <div className="grid min-w-[900px] grid-cols-[repeat(5,minmax(0,1fr))] xl:min-w-0 gap-3">
            {TASK_STATUSES.map((col) => {
              const items = list.filter((t) => t.status === col);
              return (
                <section key={col} aria-label={labelize(col)}
                  onDragOver={(e) => { e.preventDefault(); setOverCol(col); }}
                  onDragLeave={() => setOverCol((c) => (c === col ? null : c))}
                  onDrop={() => { const t = list.find((x) => x.id === dragId); if (t && t.status !== col) void move(t, col); setDragId(null); setOverCol(null); }}
                  className={cn("flex min-h-[420px] flex-col rounded-[18px] border-2 border-foreground p-3 transition-colors duration-150",
                    overCol === col && dragId ? "border-dashed bg-accent" : "bg-card/60")}>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-bold">{labelize(col)}</span>
                    <span className="rounded-full border-2 border-foreground bg-background px-2 text-xs font-bold">{items.length}</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    {items.map((t) => <TaskCard key={t.id} t={t} />)}
                    {!items.length && <p className="rounded-[12px] border-2 border-dashed border-foreground/25 p-3 text-xs text-muted-foreground">{HINTS[col]}</p>}
                  </div>
                  {canWrite && (
                    <button onClick={() => openNew(col)} className="mt-3 inline-flex min-h-10 items-center justify-center gap-1.5 rounded-[12px] text-sm font-semibold text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground">
                      <Plus className="size-4" /> Add task
                    </button>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      ) : (
        <Card className="p-4">
          {!list.length && <p className="p-4 text-sm text-muted-foreground">No tasks yet. Use New task to add the first one.</p>}
          <ul className="divide-y-2 divide-foreground/10">
            {list.map((t) => (
              <li key={t.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
                <span className="truncate text-sm font-bold">{t.title}</span>
                <div className="flex items-center gap-2">
                  <span className={cn("hidden text-xs font-semibold sm:inline", t.due_date && t.status !== "done" && t.due_date < today() ? "text-destructive" : "text-muted-foreground")}>{t.due_date ? formatDate(t.due_date) : "No date"}</span>
                  <StatusPill value={t.priority} />
                  <Select aria-label="Status" className="h-10 w-36" value={t.status} onChange={(e) => void move(t, e.target.value)}>
                    {TASK_STATUSES.map((s) => <option key={s} value={s}>{labelize(s)}</option>)}
                  </Select>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
