import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, Card, PageHeader } from "@/components/pc/primitives";
import { useWorkspaceCtx } from "@/components/app/workspace-context";
import { useTasks } from "@/lib/pc/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/app/calendar")({
  head: () => ({ meta: [{ title: "Calendar | SYNEXIS" }] }),
  component: Page,
});

const pad = (n: number) => String(n).padStart(2, "0");

function Page() {
  const { workspace } = useWorkspaceCtx();
  const { data: tasks } = useTasks(workspace.id);
  const [cursor, setCursor] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const y = cursor.getFullYear(), m = cursor.getMonth();
  const first = (new Date(y, m, 1).getDay() + 6) % 7;
  const days = new Date(y, m + 1, 0).getDate();
  const todayKey = new Date().toISOString().slice(0, 10);
  const byDay = useMemo(() => {
    const map: Record<string, typeof tasks> = {};
    for (const t of tasks ?? []) if (t.due_date) (map[t.due_date] ??= []).push(t);
    return map;
  }, [tasks]);
  const cells = Array.from({ length: Math.ceil((first + days) / 7) * 7 }, (_, i) => i - first + 1);
  const scheduled = (tasks ?? []).filter((t) => t.due_date?.startsWith(`${y}-${pad(m + 1)}`)).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description={scheduled ? `${scheduled} ${scheduled === 1 ? "task is" : "tasks are"} due this month.` : "Tasks with a due date appear on the day they are due."}
        actions={
          <div className="flex items-center gap-2">
            <Button size="iconSm" variant="outline" aria-label="Previous month" onClick={() => setCursor(new Date(y, m - 1, 1))}><ChevronLeft /></Button>
            <span className="min-w-36 text-center text-sm font-bold">{cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</span>
            <Button size="iconSm" variant="outline" aria-label="Next month" onClick={() => setCursor(new Date(y, m + 1, 1))}><ChevronRight /></Button>
          </div>
        }
      />
      <Card className="overflow-x-auto p-0">
        <div className="grid min-w-[700px] grid-cols-7">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="border-b-2 border-foreground px-3 py-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground">{d}</div>
          ))}
          {cells.map((d, i) => {
            const key = `${y}-${pad(m + 1)}-${pad(d)}`;
            const inMonth = d >= 1 && d <= days;
            const items = inMonth ? byDay[key] ?? [] : [];
            return (
              <div key={i} className={cn("min-h-28 border-b border-r border-foreground/15 p-2", !inMonth && "bg-muted/50")}>
                {inMonth && (
                  <>
                    <span className={cn("grid size-7 place-items-center rounded-full text-xs font-bold", key === todayKey && "bg-primary text-primary-foreground")}>{d}</span>
                    <ul className="mt-1 space-y-1">
                      {items.slice(0, 3).map((t) => (
                        <li key={t.id} className={cn("truncate rounded-[8px] border-2 border-foreground px-1.5 py-0.5 text-xs font-semibold", t.status === "done" ? "bg-lime line-through" : "bg-card")}>{t.title}</li>
                      ))}
                      {items.length > 3 && <li className="text-xs text-muted-foreground">+{items.length - 3} more</li>}
                    </ul>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
