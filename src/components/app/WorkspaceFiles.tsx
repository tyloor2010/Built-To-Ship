import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileText, FileImage, FileArchive, FileAudio, FileVideo, Upload, Trash2, Download } from "lucide-react";
import { Button, EmptyState, Input, Select, Skeleton, formatDate, Field } from "@/components/pc/primitives";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useWorkspaceCtx } from "./workspace-context";
import { useFiles, useMembers, useProjects, type FileRow } from "@/lib/pc/data";
import { supabase } from "@/integrations/supabase/client";
import { canDeleteFile } from "@/lib/pc/workspace-tools";
const BUCKET = "workspace-files";
export function fileSize(b: number) { return b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`; }
function fileIcon(type: string | null) { return type?.startsWith("image/") ? FileImage : type?.startsWith("audio/") ? FileAudio : type?.startsWith("video/") ? FileVideo : /zip|compressed/.test(type ?? "") ? FileArchive : FileText; }
export function WorkspaceFiles({ projectId }: { projectId?: string }) {
  const { workspace, userId, role, canWrite } = useWorkspaceCtx(); const qc = useQueryClient();
  const { data: files = [], isLoading, error } = useFiles(workspace.id, projectId);
  const { data: projects = [] } = useProjects(workspace.id); const { data: members = [] } = useMembers(workspace.id);
  const [search, setSearch] = useState(""); const [open, setOpen] = useState(false); const [name, setName] = useState("");
  const [project, setProject] = useState(projectId ?? ""); const [file, setFile] = useState<File | null>(null); const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<FileRow | null>(null); const input = useRef<HTMLInputElement>(null);
  async function upload(e: React.FormEvent) {
    e.preventDefault(); if (!file || !canWrite) return; setBusy(true);
    const path = `${workspace.id}/${userId}/${crypto.randomUUID()}/${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    try {
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type || "application/octet-stream" }); if (uploadError) throw uploadError;
      const { error: rowError } = await supabase.from("files").insert({ workspace_id: workspace.id, project_id: project || null, name: name.trim() || file.name, storage_path: path, mime_type: file.type || null, size_bytes: file.size, uploaded_by: userId });
      if (rowError) { await supabase.storage.from(BUCKET).remove([path]); throw rowError; }
      await qc.invalidateQueries({ queryKey: ["files", workspace.id] }); setOpen(false); setFile(null); setName(""); toast.success("File uploaded");
    } catch { toast.error("Could not upload the file. Please try again."); } finally { setBusy(false); }
  }
  async function download(f: FileRow) {
    const { data, error: e } = await supabase.storage.from(BUCKET).download(f.storage_path);
    if (e || !data) { toast.error("Could not download this file."); return; }
    const url = URL.createObjectURL(data); const a = document.createElement("a"); a.href = url; a.download = f.name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function remove() {
    if (!deleting || !canDeleteFile(deleting.uploaded_by, userId, role)) return; setBusy(true);
    try {
      const { error: storageError } = await supabase.storage.from(BUCKET).remove([deleting.storage_path]); if (storageError) throw storageError;
      const { error: rowError } = await supabase.from("files").delete().eq("id", deleting.id).eq("workspace_id", workspace.id); if (rowError) throw rowError;
      await qc.invalidateQueries({ queryKey: ["files", workspace.id] }); setDeleting(null); toast.success("File deleted");
    } catch { toast.error("Could not finish deleting this file. Try again."); } finally { setBusy(false); }
  }
  const visible = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
  return <div className="space-y-5"><div className="flex flex-wrap items-center gap-3"><Input aria-label="Search files" placeholder="Search files" value={search} onChange={e => setSearch(e.target.value)} className="sm:max-w-sm" />{canWrite && <Button size="sm" onClick={() => setOpen(true)}><Upload /> Upload file</Button>}</div>
    {error ? <p role="alert" className="text-destructive">Could not load files. Please refresh.</p> : isLoading ? <Skeleton className="h-40" /> : !visible.length ? <EmptyState bare icon={FileText} title={files.length ? "No matching files" : "No files yet"} sub={files.length ? "Try another search." : "Your workspace has no attachments."} /> : <ul className="divide-y border-y-2 border-foreground/15">{visible.map(f => { const Icon = fileIcon(f.mime_type); const person = members.find(m => m.user_id === f.uploaded_by); return <li key={f.id} className="flex min-w-0 flex-wrap items-center gap-3 py-4"><Icon className="size-6 shrink-0 text-primary" /><div className="min-w-0 flex-1 basis-40"><p className="break-words text-sm font-bold">{f.name}</p><p className="mt-1 text-xs text-muted-foreground">{projects.find(p => p.id === f.project_id)?.name ?? "Workspace"} · {fileSize(f.size_bytes)} · {f.mime_type ?? "File"}</p><p className="mt-1 text-xs text-muted-foreground">{person?.profile?.full_name ?? "Workspace member"} · {formatDate(f.created_at)}</p></div><Button variant="outline" size="iconSm" title={`Download ${f.name}`} aria-label={`Download ${f.name}`} onClick={() => void download(f)}><Download /></Button>{canDeleteFile(f.uploaded_by, userId, role) && <Button variant="ghost" size="iconSm" title={`Delete ${f.name}`} aria-label={`Delete ${f.name}`} onClick={() => setDeleting(f)}><Trash2 /></Button>}</li>; })}</ul>}
    <Dialog open={open} onOpenChange={v => { if (!busy) setOpen(v); }}><DialogContent className="border-2 border-foreground bg-background"><DialogTitle>Upload file</DialogTitle><DialogDescription>{projectId ? "Attach a file to this project." : "Add an attachment to this workspace."}</DialogDescription><form onSubmit={upload} className="space-y-4"><Field label="File"><input ref={input} type="file" required className="w-full text-sm" onChange={e => { const f = e.target.files?.[0] ?? null; setFile(f); setName(f?.name ?? ""); }} /></Field><Field label="Name"><Input required value={name} onChange={e => setName(e.target.value)} /></Field>{!projectId && <Field label="Project"><Select value={project} onChange={e => setProject(e.target.value)}><option value="">Workspace attachment</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></Field>}<Button loading={busy} disabled={!file || !name.trim()} type="submit"><Upload /> Upload</Button></form></DialogContent></Dialog>
    <Dialog open={!!deleting} onOpenChange={v => { if (!v && !busy) setDeleting(null); }}><DialogContent className="border-2 border-foreground bg-background"><DialogTitle>Delete file?</DialogTitle><DialogDescription>{deleting?.name} will be permanently removed.</DialogDescription><div className="flex justify-end gap-2"><Button variant="outline" disabled={busy} onClick={() => setDeleting(null)}>Cancel</Button><Button variant="danger" loading={busy} onClick={() => void remove()}>Delete</Button></div></DialogContent></Dialog>
  </div>;
}
