import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, Badge, Button, Card, EmptyState, Field, Input, Select, StatusPill, Textarea, labelize } from "@/components/pc/primitives";
import { Modal } from "@/components/app/CreateProjectModal";
import { useWorkspaceCtx } from "@/components/app/workspace-context";
import { PRIORITIES, TASK_STATUSES, useMembers, useProjects, useTasks, type Task } from "@/lib/pc/data";

type Search = { new?: string };

export const Route = createFileRoute("/_authenticated/app/tasks")({
  validateSearch: (s: Record<string, unknown>): Search => (s['new'] ? { new: String(s['new']) } : {}),
  component: TasksPage,
});

function TasksPage() {
  const { workspace, userId, canWrite } = useWorkspaceCtx();
  const search = Route.useSearch();
  const qc = useQueryClient();
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [open, setOpen] = useState(search.new === "1");
  const [dragId, setDragId] = useState<string | null>(null);
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

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
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
    if (error) { toast.error(error.message); return; }
    await supabase.from("activity_logs").insert({ workspace_id: workspace.id, actor_id: userId, action: "created task", target: title, project_id: projectId || null });
    if (assignee && assignee !== userId) {
      await supabase.from("notifications").insert({ workspace_id: workspace.id, user_id: assignee, type: "task_assigned", title: "New task assigned", body: title });
    }
    await qc.invalidateQueries();
    toast.success("Task created.");
    setTitle(""); setDescription(""); setOpen(false);
  }

  async function move(task: Task, next: string) {
    const { error } = await supabase.from("tasks").update({ status: next, completed_at: next === "done" ? new Date().toISOString() : null }).eq("id", task.id);
    if (error) { toast.error(error.message); return; }
    await supabase.from("activity_logs").insert({ workspace_id: workspace.id, actor_id: userId, action: `moved ${task.title} to`, target: labelize(next), project_id: task.project_id });
    await qc.invalidateQueries({ queryKey: ["tasks"] });
  }

  const list = tasks ?? [];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Modal open={open} onClose={() => setOpen(false)} title="New task">
        <form onSubmit={createTask} className="space-y-4">
          <Field label="Title"><Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Design pricing page" /></Field>
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
            <Button type="submit">Create task →</Button>
          </div>
        </form>
      </Modal>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="display text-3xl uppercase sm:text-5xl">My Tasks</h1>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">Drag cards between columns to update status.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setView(view === "kanban" ? "list" : "kanban")}>{view === "kanban" ? "List" : "Kanban"}</Button>
          {canWrite && <Button size="sm" onClick={() => setOpen(true)}>+ New Task</Button>}
        </div>
      </header>

      {!isLoading && !list.length && (
        <EmptyState emoji="✅" title="No tasks yet." sub="Add the first thing that needs to happen." action={canWrite ? <Button className="mt-2" onClick={() => setOpen(true)}>Create task →</Button> : undefined} />
      )}

      {view === "kanban" ? (
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
          {TASK_STATUSES.map((col) => (
            <div key={col}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { const t = list.find((x) => x.id === dragId); if (t && t.status !== col) void move(t, col); setDragId(null); }}
              className="rounded-[18px] ink-2 bg-card/60 p-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-widest">{labelize(col)}</span>
                <span className="rounded-full ink-2 bg-background px-2 text-[10px] font-black">{list.filter((t) => t.status === col).length}</span>
              </div>
              <div className="space-y-2">
                {list.filter((t) => t.status === col).map((t) => {
                  const person = (members ?? []).find((m) => m.user_id === t.assignee_id);
                  return (
                    <Card key={t.id} draggable onDragStart={() => setDragId(t.id)} className="cursor-grab p-3 active:cursor-grabbing">
                      <div className="text-sm font-bold leading-tight">{t.title}</div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <StatusPill value={t.priority} />
                        <div className="flex items-center gap-2">
                          {t.due_date && <span className="text-[10px] font-black text-muted-foreground">{t.due_date}</span>}
                          {person && <Avatar name={person.profile?.full_name} size={22} />}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="p-4">
          <ul className="divide-y-2 divide-foreground/10">
            {list.map((t) => (
              <li key={t.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
                <span className="truncate text-sm font-bold">{t.title}</span>
                <div className="flex items-center gap-2">
                  <Badge tone="paper">{t.due_date ?? "—"}</Badge>
                  <StatusPill value={t.priority} />
                  <Select className="h-9 w-40" value={t.status} onChange={(e) => void move(t, e.target.value)}>
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
