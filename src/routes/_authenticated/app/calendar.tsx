import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { addDays, addMonths, addWeeks, startOfWeek, startOfMonth, endOfMonth, endOfWeek, eachDayOfInterval, format, isSameMonth } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button, PageHeader, Select, Skeleton, EmptyState } from "@/components/pc/primitives";
import { useWorkspaceCtx } from "@/components/app/workspace-context";
import { TaskDetails } from "@/components/app/TaskDetails";
import { useTasks, useProjects, useMembers, type Task } from "@/lib/pc/data";
import { dateKey, isOverdue } from "@/lib/pc/workspace-tools";
import { pageMeta } from "@/lib/pc/page-meta";
import { cn } from "@/lib/utils";
export const Route = createFileRoute("/_authenticated/app/calendar")({ head: () => pageMeta("Calendar", "Task deadlines in month and week views for your workspace."), component: Page });
function Page() {
  const { workspace } = useWorkspaceCtx();
  const { data: tasks = [], isLoading, error } = useTasks(workspace.id);
  const { data: projects = [] } = useProjects(workspace.id);
  const { data: members = [] } = useMembers(workspace.id);
  const [cursor, setCursor] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");
  const [project, setProject] = useState(""); const [assignee, setAssignee] = useState("");
  const [selected, setSelected] = useState<Task | null>(null);
  const start = startOfWeek(view === "month" ? startOfMonth(cursor) : cursor, { weekStartsOn: 1 });
  const end = view === "month" ? endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 }) : addDays(start, 6);
  const days = eachDayOfInterval({ start, end });
  const filtered = tasks.filter(t => t.due_date && (!project || t.project_id === project) && (!assignee || (assignee === "unassigned" ? !t.assignee_id : t.assignee_id === assignee)));
  const today = dateKey(new Date());
  const shift = (n: number) => setCursor(view === "month" ? addMonths(cursor, n) : addWeeks(cursor, n));
  return <div className="space-y-6"><PageHeader title="Calendar" description={view === "month" ? format(cursor, "MMMM yyyy") : `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`} actions={<><Button variant="outline" size="iconSm" aria-label={`Previous ${view}`} title={`Previous ${view}`} onClick={() => shift(-1)}><ChevronLeft /></Button><Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>Today</Button><Button variant="outline" size="iconSm" aria-label={`Next ${view}`} title={`Next ${view}`} onClick={() => shift(1)}><ChevronRight /></Button></>} />
    <div className="flex flex-wrap gap-3"><div role="group" aria-label="Calendar view" className="flex gap-1">{(["month", "week"] as const).map(v => <Button key={v} size="sm" variant={view === v ? "ink" : "outline"} aria-pressed={view === v} onClick={() => setView(v)}>{v === "month" ? "Month" : "Week"}</Button>)}</div><Select aria-label="Filter by project" className="sm:w-52" value={project} onChange={e => setProject(e.target.value)}><option value="">All projects</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</Select><Select aria-label="Filter by assignee" className="sm:w-52" value={assignee} onChange={e => setAssignee(e.target.value)}><option value="">All assignees</option><option value="unassigned">Unassigned</option>{members.filter(m => m.user_id).map(m => <option key={m.id} value={m.user_id ?? ""}>{m.profile?.full_name ?? m.invited_email ?? "Member"}</option>)}</Select></div>
    {error ? <p role="alert" className="text-destructive">Could not load deadlines. Please refresh.</p> : isLoading ? <Skeleton className="h-96" /> : <><div className="grid grid-cols-1 overflow-hidden rounded-lg border-2 border-foreground bg-card md:grid-cols-7">{days.map(day => {
      const key = dateKey(day); const items = filtered.filter(t => t.due_date === key);
      return <section key={key} aria-label={format(day, "EEEE MMMM d")} className={cn("min-w-0 border-b border-foreground/15 p-2 md:min-h-32 md:border-r", view === "week" && "md:min-h-96", view === "month" && !isSameMonth(day, cursor) && "hidden bg-muted/50 md:block")}><h2 className={cn("mb-2 inline-flex min-h-8 items-center gap-1 rounded-md px-2 text-xs font-bold", today === key && "bg-primary text-primary-foreground")}><span className="md:hidden">{format(day, "EEE")}</span><span className="hidden md:inline">{format(day, "EEE")}</span> {format(day, "d")}</h2><ul className="space-y-2">{items.map(t => <li key={t.id}><Button variant="ghost" className={cn("h-auto min-h-10 w-full justify-start whitespace-normal rounded-md border border-foreground/20 px-2 py-2 text-left text-xs", t.status === "done" ? "bg-lime text-lime-foreground" : isOverdue(t, today) ? "border-destructive text-destructive" : "bg-background")} onClick={() => setSelected(t)}><span className="min-w-0 break-words">{t.title}{isOverdue(t, today) && <span className="block text-[10px]">Overdue</span>}</span></Button></li>)}</ul></section>;
    })}</div>{!filtered.length && <EmptyState bare icon={CalendarDays} title="No scheduled tasks" sub="No task deadlines match these filters." />}</>}
    {selected && <TaskDetails key={selected.id} task={selected} onClose={() => setSelected(null)} />}
  </div>;
}
