import { useNavigate } from "@tanstack/react-router";
import { Bell, CalendarDays, FileText, FolderKanban, HelpCircle, LayoutDashboard, ListChecks, PieChart, Plus, Settings, Users } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useWorkspaceCtx } from "@/components/app/workspace-context";
import { useProjects, useTasks, useMembers } from "@/lib/pc/data";

const PAGES = [
  { to: "/app", label: "Overview", icon: LayoutDashboard },
  { to: "/app/projects", label: "Projects", icon: FolderKanban },
  { to: "/app/tasks", label: "My Tasks", icon: ListChecks },
  { to: "/app/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/app/team", label: "Team", icon: Users },
  { to: "/app/files", label: "Files", icon: FileText },
  { to: "/app/analytics", label: "Analytics", icon: PieChart },
  { to: "/app/notifications", label: "Notifications", icon: Bell },
  { to: "/app/settings/profile", label: "Settings", icon: Settings },
  { to: "/app/help", label: "Help", icon: HelpCircle },
];

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate();
  const { workspace } = useWorkspaceCtx();
  const { data: projects } = useProjects(workspace.id);
  const { data: tasks } = useTasks(workspace.id);
  const { data: members } = useMembers(workspace.id);

  function go(to: string, search?: Record<string, string>) {
    onOpenChange(false);
    navigate({ to, search: search as never });
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search projects, tasks, people and pages" />
      <CommandList>
        <CommandEmpty>No matches. Try a different word.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => go("/app/projects", { new: "1" })}>
            <Plus className="mr-2 size-4" /> Create project
          </CommandItem>
          <CommandItem onSelect={() => go("/app/tasks", { new: "1" })}>
            <ListChecks className="mr-2 size-4" /> Create task
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Pages">
          {PAGES.map((pg) => (
            <CommandItem key={pg.to} value={`page ${pg.label}`} onSelect={() => go(pg.to)}>
              <pg.icon className="mr-2 size-4" /> {pg.label}
            </CommandItem>
          ))}
        </CommandGroup>

        {!!projects?.length && (
          <CommandGroup heading="Projects">
            {projects.slice(0, 20).map((p) => (
              <CommandItem key={p.id} value={`project ${p.name}`} onSelect={() => go(`/app/projects/${p.id}`)}>
                <FolderKanban className="mr-2 size-4" /> {p.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {!!tasks?.length && (
          <CommandGroup heading="Tasks">
            {tasks.slice(0, 30).map((t) => (
              <CommandItem key={t.id} value={`task ${t.title}`} onSelect={() => go("/app/tasks")}>
                <ListChecks className="mr-2 size-4" /> {t.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {!!members?.length && (
          <CommandGroup heading="People">
            {members.slice(0, 20).map((m) => (
              <CommandItem
                key={m.id}
                value={`person ${m.profile?.full_name ?? m.invited_email ?? ""}`}
                onSelect={() => go("/app/team")}
              >
                <Users className="mr-2 size-4" /> {m.profile?.full_name ?? m.invited_email ?? "Member"}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
