import type { Task } from "./data";
import { format } from "date-fns";

export const dateKey = (date: Date) => format(date, "yyyy-MM-dd");
export function isOverdue(task: Pick<Task, "status" | "due_date">, day: string) {
  return task.status !== "done" && !!task.due_date && task.due_date < day;
}
export function canDeleteFile(uploader: string, userId: string, role: string) {
  return uploader === userId || role === "owner";
}
export function reportTasks(tasks: Task[], start: string, end: string) {
  const inRange = (value: string | null) => !!value && value.slice(0, 10) >= start && value.slice(0, 10) <= end;
  return {
    created: tasks.filter(t => inRange(t.created_at)),
    completed: tasks.filter(t => t.status === "done" && inRange(t.completed_at)),
    overdue: tasks.filter(t => isOverdue(t, end) && !!t.due_date && t.due_date >= start),
  };
}
export function csvCell(value: string | number) {
  const text = String(value);
  const safe = /^[=+@\-\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}