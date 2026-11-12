import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { startOfWeek, endOfWeek } from "date-fns";
import { Download, Printer, BarChart3 } from "lucide-react";
import { Button, PageHeader, Field, Input, EmptyState, Skeleton, StatCard } from "@/components/pc/primitives";
import { useWorkspaceCtx } from "@/components/app/workspace-context";
import { useTasks, useProjects, useMembers } from "@/lib/pc/data";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { dateKey, reportTasks, csvCell } from "@/lib/pc/workspace-tools";
import { pageMeta } from "@/lib/pc/page-meta";
export const Route = createFileRoute("/_authenticated/app/reports")({ head: () => pageMeta("Reports", "Weekly task and activity summaries, CSV export and printable reports."), component: Page });
function Page() {
  const { workspace } = useWorkspaceCtx();
  const [start, setStart] = useState(dateKey(startOfWeek(new Date(), { weekStartsOn: 1 })));
  const [end, setEnd] = useState(dateKey(endOfWeek(new Date(), { weekStartsOn: 1 })));
  const { data: tasks = [], isLoading, error } = useTasks(workspace.id);
  const { data: projects = [] } = useProjects(workspace.id); const { data: members = [] } = useMembers(workspace.id);
  const valid = !!start && !!end && start <= end;
  const activity = useQuery({ queryKey: ["report-activity", workspace.id, start, end], enabled: valid, queryFn: async () => {
    const rows: { id: string; actor_id: string; action: string; target: string | null; created_at: string }[] = [];
    for (let from = 0; ; from += 1000) {
      const { data, error: e } = await supabase.from("activity_logs").select("id,actor_id,action,target,created_at").eq("workspace_id", workspace.id).gte("created_at", `${start}T00:00:00Z`).lte("created_at", `${end}T23:59:59.999Z`).order("created_at").order("id").range(from, from + 999);
      if (e) throw e; rows.push(...(data ?? [])); if ((data?.length ?? 0) < 1000) break;
    } return rows;
  }});
  const summary = reportTasks(tasks, start, end);
  const totals = [["Completed", summary.completed.length], ["Created", summary.created.length], ["Overdue", summary.overdue.length], ["Activity", activity.data?.length ?? 0]] as const;
  const groups = (kind: "project" | "member") => {
    const ids = new Set<string>();
    [...summary.created, ...summary.completed, ...summary.overdue].forEach(t => ids.add((kind === "project" ? t.project_id : t.assignee_id) ?? "none"));
    if (kind === "member") activity.data?.forEach(a => ids.add(a.actor_id));
    return [...ids].map(id => ({ id, name: kind === "project" ? projects.find(p => p.id === id)?.name ?? "No project" : members.find(m => m.user_id === id)?.profile?.full_name ?? (id === "none" ? "Unassigned" : "Workspace member"), created: summary.created.filter(t => ((kind === "project" ? t.project_id : t.assignee_id) ?? "none") === id).length, completed: summary.completed.filter(t => ((kind === "project" ? t.project_id : t.assignee_id) ?? "none") === id).length, overdue: summary.overdue.filter(t => ((kind === "project" ? t.project_id : t.assignee_id) ?? "none") === id).length, activity: kind === "member" ? activity.data?.filter(a => a.actor_id === id).length ?? 0 : 0 }));
  };
  function exportCsv() {
    const rows: (string | number)[][] = [["SYNEXIS report", workspace.name, start, end], ["Section", "Name", "Completed", "Created", "Overdue", "Activity"], ["Summary", "Workspace", summary.completed.length, summary.created.length, summary.overdue.length, activity.data?.length ?? 0]];
    for (const kind of ["project", "member"] as const) for (const g of groups(kind)) rows.push([kind, g.name, g.completed, g.created, g.overdue, g.activity]);
    rows.push([], ["Activity time", "Member", "Action", "Target"]);
    activity.data?.forEach(a => rows.push([a.created_at, members.find(m => m.user_id === a.actor_id)?.profile?.full_name ?? "Workspace member", a.action, a.target ?? ""]));
    const blob = new Blob(["\ufeff", rows.map(r => r.map(csvCell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `synexis-report-${start}-${end}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function table(kind: "project" | "member") { const rows = groups(kind); return <section className="space-y-3"><h2 className="text-lg font-bold">By {kind}</h2>{!rows.length ? <p className="text-sm text-muted-foreground">No results in this range.</p> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b-2 border-foreground"><th className="p-3">{kind === "project" ? "Project" : "Assignee"}</th><th className="p-3">Completed</th><th className="p-3">Created</th><th className="p-3">Overdue</th>{kind === "member" && <th className="p-3">Activity</th>}</tr></thead><tbody>{rows.map(g => <tr key={g.id} className="border-b border-foreground/15"><th className="p-3 font-semibold">{g.name}</th><td className="p-3">{g.completed}</td><td className="p-3">{g.created}</td><td className="p-3">{g.overdue}</td>{kind === "member" && <td className="p-3">{g.activity}</td>}</tr>)}</tbody></table></div>}</section>; }
  const failed = error || activity.error; const loading = isLoading || activity.isLoading;
  return <div className="report-view space-y-6"><PageHeader title="Reports" description={`${workspace.name} · ${start} – ${end}`} actions={<div className="no-print flex gap-2"><Button size="sm" variant="outline" disabled={!valid || loading || !!failed} onClick={exportCsv}><Download /> CSV</Button><Button size="sm" variant="outline" disabled={!valid || loading || !!failed} onClick={() => window.print()}><Printer /> Print</Button></div>} /><div className="no-print flex flex-wrap gap-3"><Field label="From"><Input type="date" required value={start} max={end} onChange={e => setStart(e.target.value)} /></Field><Field label="To"><Input type="date" required value={end} min={start} onChange={e => setEnd(e.target.value)} /></Field></div>
    {!valid ? <p role="alert" className="text-destructive">Choose a valid date range.</p> : failed ? <p role="alert" className="text-destructive">Could not load the report. Please refresh.</p> : loading ? <Skeleton className="h-64" /> : <><div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{totals.map(([label, value]) => <StatCard key={label} label={label} value={value} tone={label === "Completed" ? "lime" : "paper"} />)}</div><p className="text-xs text-muted-foreground">Overdue counts open tasks due within this range before its final day. Member task counts use current assignees.</p>{table("project")}{table("member")}<section><h2 className="mb-3 text-lg font-bold">Activity</h2>{!activity.data?.length ? <EmptyState bare icon={BarChart3} title="No activity in this range" /> : <ul className="divide-y divide-foreground/15">{activity.data.map(a => <li key={a.id} className="py-3 text-sm"><b>{members.find(m => m.user_id === a.actor_id)?.profile?.full_name ?? "Workspace member"}</b> {a.action} {a.target}<span className="ml-2 text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span></li>)}</ul>}</section></>}
  </div>;
}
