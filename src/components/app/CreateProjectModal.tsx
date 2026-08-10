import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button, Card, Field, Input, Select, Textarea } from "@/components/pc/primitives";
import { useWorkspaceCtx } from "@/components/app/workspace-context";
import { PROJECT_STATUSES, PROJECT_TEMPLATES, labelize } from "@/lib/pc/data";

const COLORS = ["#1557FF", "#B8FF00", "#8B5CF6", "#FF7A29", "#EF4444", "#080B12"];

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <Card
        role="dialog"
        aria-label={title}
        className={`animate-rise relative max-h-[92vh] w-full overflow-y-auto rounded-b-none p-6 sm:rounded-[22px] ${wide ? "sm:max-w-3xl" : "sm:max-w-lg"}`}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="display text-2xl uppercase">{title}</h2>
          <Button variant="ghost" size="iconSm" onClick={onClose} aria-label="Close">
            ✕
          </Button>
        </div>
        {children}
      </Card>
    </div>
  );
}

export function CreateProjectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { workspace, userId } = useWorkspaceCtx();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLORS[0]!);
  const [status, setStatus] = useState("planning");
  const [template, setTemplate] = useState(PROJECT_TEMPLATES[0]!);
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data, error } = await supabase
      .from("projects")
      .insert({
        workspace_id: workspace.id,
        name,
        description,
        color,
        status,
        template,
        start_date: startDate || null,
        deadline: deadline || null,
        owner_id: userId,
        created_by: userId,
      })
      .select()
      .single();
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await supabase.from("activity_logs").insert({
      workspace_id: workspace.id,
      actor_id: userId,
      project_id: data.id,
      action: "created a new project",
      target: name,
    });
    await qc.invalidateQueries();
    toast.success("Project created.");
    setName("");
    setDescription("");
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="New project" wide>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Project name" className="sm:col-span-2">
          <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Website Redesign" />
        </Field>
        <Field label="Description" className="sm:col-span-2">
          <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Marketing website redesign for Q4." />
        </Field>
        <Field label="Template">
          <Select value={template} onChange={(e) => setTemplate(e.target.value)}>
            {PROJECT_TEMPLATES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </Field>
        <Field label="Status">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {labelize(s)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Start date">
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </Field>
        <Field label="Deadline">
          <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <span className="text-[11px] font-black uppercase tracking-widest">Project color</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Color ${c}`}
                onClick={() => setColor(c)}
                style={{ background: c }}
                className={`size-10 rounded-[12px] ink-2 ${color === c ? "shadow-hard-sm" : ""}`}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Creating…" : "Create project →"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
