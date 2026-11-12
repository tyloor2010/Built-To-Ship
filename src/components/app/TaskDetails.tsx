import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button, Field, Input, Select, StatusPill, Textarea } from "@/components/pc/primitives";
import { useWorkspaceCtx } from "./workspace-context";
import { TASK_STATUSES, PRIORITIES, useMembers, useProjects, type Task } from "@/lib/pc/data";
import { supabase } from "@/integrations/supabase/client";

export function TaskDetails({ task, onClose }: { task: Task; onClose: () => void }) {
  const { workspace, userId, canWrite } = useWorkspaceCtx();
  const qc = useQueryClient();
  const { data: projects = [] } = useProjects(workspace.id);
  const { data: members = [] } = useMembers(workspace.id);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [due, setDue] = useState(task.due_date ?? "");
  const [assignee, setAssignee] = useState(task.assignee_id ?? "");
  const [saving, setSaving] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault(); if (!canWrite) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("tasks").update({ title: title.trim(), description, status, priority, due_date: due || null, assignee_id: assignee || null, completed_at: status === "done" ? task.completed_at ?? new Date().toISOString() : null }).eq("id", task.id).eq("workspace_id", workspace.id);
      if (error) throw error;
      const { error: activityError } = await supabase.from("activity_logs").insert({ workspace_id: workspace.id, actor_id: userId, task_id: task.id, project_id: task.project_id, action: "updated task", target: title.trim() });
      if (activityError) toast.error("Task saved, but its activity could not be recorded.");
      await qc.invalidateQueries({ queryKey: ["tasks"] });
      await qc.invalidateQueries({ queryKey: ["activity"] });
      toast.success("Task saved"); onClose();
    } catch { toast.error("Could not save the task. Your changes are still here."); }
    finally { setSaving(false); }
  }
  return <Dialog open onOpenChange={open => { if (!open && !saving) onClose(); }}><DialogContent className="max-h-[90dvh] overflow-y-auto border-2 border-foreground bg-background sm:max-w-lg"><DialogTitle>Task details</DialogTitle><DialogDescription>{projects.find(p => p.id === task.project_id)?.name ?? "No project"}</DialogDescription>
    <form onSubmit={save} className="space-y-4"><Field label="Title"><Input autoFocus required disabled={!canWrite} value={title} onChange={e => setTitle(e.target.value)} /></Field><Field label="Description"><Textarea rows={3} disabled={!canWrite} value={description} onChange={e => setDescription(e.target.value)} /></Field>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Status"><Select disabled={!canWrite} value={status} onChange={e => setStatus(e.target.value)}>{TASK_STATUSES.map(s => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}</Select></Field><Field label="Priority"><Select disabled={!canWrite} value={priority} onChange={e => setPriority(e.target.value)}>{PRIORITIES.map(s => <option key={s}>{s}</option>)}</Select></Field><Field label="Due date"><Input type="date" disabled={!canWrite} value={due} onChange={e => setDue(e.target.value)} /></Field><Field label="Assignee"><Select disabled={!canWrite} value={assignee} onChange={e => setAssignee(e.target.value)}><option value="">Unassigned</option>{members.filter(m => m.user_id).map(m => <option key={m.id} value={m.user_id ?? ""}>{m.profile?.full_name ?? m.invited_email ?? "Member"}</option>)}</Select></Field></div>
      <div className="flex justify-end gap-2"><StatusPill value={status} />{canWrite && <Button loading={saving} disabled={!title.trim()} type="submit">Save changes</Button>}</div>
    </form></DialogContent></Dialog>;
}