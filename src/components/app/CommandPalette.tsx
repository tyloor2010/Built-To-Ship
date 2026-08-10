import { useNavigate } from "@tanstack/react-router";
import { Bot, FolderKanban, ListChecks, PieChart, Plus, Settings, UserPlus, Users } from "lucide-react";
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
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => go("/app/projects", { new: "1" })}>
            <Plus className="mr-2 size-4" /> Create project
          </CommandItem>
          <CommandItem onSelect={() => go("/app/tasks", { new: "1" })}>
            <ListChecks className="mr-2 size-4" /> Create task
          </CommandItem>
          <CommandItem onSelect={() => go("/app/team", { invite: "1" })}>
            <UserPlus className="mr-2 size-4" /> Invite member
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => go("/app/projects")}>
            <FolderKanban className="mr-2 size-4" /> Projects
          </CommandItem>
          <CommandItem onSelect={() => go("/app/analytics")}>
            <PieChart className="mr-2 size-4" /> Analytics
          </CommandItem>
          <CommandItem onSelect={() => go("/app/ai")}>
            <Bot className="mr-2 size-4" /> AI Commander
          </CommandItem>
          <CommandItem onSelect={() => go("/app/team")}>
            <Users className="mr-2 size-4" /> Team
          </CommandItem>
          <CommandItem onSelect={() => go("/app/settings/profile")}>
            <Settings className="mr-2 size-4" /> Settings
          </CommandItem>
        </CommandGroup>

        {!!projects?.length && (
          <CommandGroup heading="Projects">
            {projects.slice(0, 6).map((p) => (
              <CommandItem key={p.id} value={`project ${p.name}`} onSelect={() => go(`/app/projects/${p.id}`)}>
                <FolderKanban className="mr-2 size-4" /> {p.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {!!tasks?.length && (
          <CommandGroup heading="Tasks">
            {tasks.slice(0, 6).map((t) => (
              <CommandItem key={t.id} value={`task ${t.title}`} onSelect={() => go("/app/tasks")}>
                <ListChecks className="mr-2 size-4" /> {t.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {!!members?.length && (
          <CommandGroup heading="People">
            {members.slice(0, 6).map((m) => (
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
