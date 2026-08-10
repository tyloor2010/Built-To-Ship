import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  job_title: string | null;
};

export type Workspace = {
  id: string;
  name: string;
  description: string | null;
  logo_emoji: string | null;
  team_size: string | null;
  main_goal: string | null;
  timezone: string | null;
  plan: string;
  created_by: string;
};

export type Member = {
  id: string;
  workspace_id: string;
  user_id: string | null;
  invited_email: string | null;
  role: "owner" | "admin" | "member" | "viewer";
  status: string;
  availability: string;
  profile?: Profile | null;
};

export type Project = {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  color: string;
  status: string;
  health: string;
  template: string | null;
  start_date: string | null;
  deadline: string | null;
  owner_id: string | null;
  created_at: string;
};

export type Task = {
  id: string;
  workspace_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  assignee_id: string | null;
  labels: string[];
  position: number;
  completed_at: string | null;
  created_at: string;
};

export const TASK_STATUSES = ["backlog", "todo", "in_progress", "review", "done"] as const;
export const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export const PROJECT_STATUSES = ["planning", "active", "at_risk", "completed", "archived"] as const;

export const PROJECT_TEMPLATES = [
  "Website Launch",
  "Product Development",
  "Marketing Campaign",
  "Research Project",
  "Client Project",
  "Custom",
];

/* ------------ workspace bootstrap ------------ */

export function useMyWorkspace(userId?: string) {
  return useQuery({
    queryKey: ["workspace", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data: memberships, error } = await supabase
        .from("workspace_members")
        .select("workspace_id, role, workspaces(*)")
        .eq("user_id", userId!)
        .eq("status", "active")
        .order("created_at", { ascending: true });
      if (error) throw error;
      const first = memberships?.[0];
      if (!first) return null;
      return {
        workspace: first.workspaces as unknown as Workspace,
        role: first.role as Member["role"],
      };
    },
  });
}

export function useProfile(userId?: string) {
  return useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId!).maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });
}

/* ------------ members ------------ */

export function useMembers(workspaceId?: string) {
  return useQuery({
    queryKey: ["members", workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workspace_members")
        .select("*")
        .eq("workspace_id", workspaceId!)
        .order("created_at");
      if (error) throw error;
      const ids = (data ?? []).map((m) => m.user_id).filter(Boolean) as string[];
      let profiles: Profile[] = [];
      if (ids.length) {
        const { data: p } = await supabase.from("profiles").select("*").in("id", ids);
        profiles = (p ?? []) as Profile[];
      }
      return (data ?? []).map((m) => ({
        ...m,
        profile: profiles.find((p) => p.id === m.user_id) ?? null,
      })) as Member[];
    },
  });
}

/* ------------ projects ------------ */

export function useProjects(workspaceId?: string) {
  return useQuery({
    queryKey: ["projects", workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("workspace_id", workspaceId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Project[];
    },
  });
}

export function useProject(projectId?: string) {
  return useQuery({
    queryKey: ["project", projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").eq("id", projectId!).maybeSingle();
      if (error) throw error;
      return data as Project | null;
    },
  });
}

/* ------------ tasks ------------ */

export function useTasks(workspaceId?: string, projectId?: string) {
  return useQuery({
    queryKey: ["tasks", workspaceId, projectId ?? "all"],
    enabled: !!workspaceId,
    queryFn: async () => {
      let q = supabase.from("tasks").select("*").eq("workspace_id", workspaceId!);
      if (projectId) q = q.eq("project_id", projectId);
      const { data, error } = await q.order("position");
      if (error) throw error;
      return (data ?? []) as Task[];
    },
  });
}

/* ------------ activity + notifications ------------ */

export type Activity = {
  id: string;
  actor_id: string;
  action: string;
  target: string | null;
  created_at: string;
  project_id: string | null;
};

export function useActivity(workspaceId?: string, projectId?: string, limit = 20) {
  return useQuery({
    queryKey: ["activity", workspaceId, projectId ?? "all", limit],
    enabled: !!workspaceId,
    queryFn: async () => {
      let q = supabase.from("activity_logs").select("*").eq("workspace_id", workspaceId!);
      if (projectId) q = q.eq("project_id", projectId);
      const { data, error } = await q.order("created_at", { ascending: false }).limit(limit);
      if (error) throw error;
      return (data ?? []) as Activity[];
    },
  });
}

export async function logActivity(input: {
  workspace_id: string;
  actor_id: string;
  action: string;
  target?: string | null;
  project_id?: string | null;
  task_id?: string | null;
}) {
  await supabase.from("activity_logs").insert(input);
}

export type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
};

export function useNotifications(userId?: string) {
  return useQuery({
    queryKey: ["notifications", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as Notification[];
    },
  });
}

export function useMarkNotificationRead(userId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | "all") => {
      let q = supabase.from("notifications").update({ read: true }).eq("user_id", userId!);
      if (id !== "all") q = q.eq("id", id);
      const { error } = await q;
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications", userId] }),
  });
}

export async function notify(input: {
  workspace_id: string;
  user_id: string;
  type: string;
  title: string;
  body?: string | null;
  link?: string | null;
}) {
  await supabase.from("notifications").insert(input);
}

/* ------------ files ------------ */

export type FileRow = {
  id: string;
  name: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number;
  folder: string;
  project_id: string | null;
  uploaded_by: string;
  created_at: string;
};

export function useFiles(workspaceId?: string, projectId?: string) {
  return useQuery({
    queryKey: ["files", workspaceId, projectId ?? "all"],
    enabled: !!workspaceId,
    queryFn: async () => {
      let q = supabase.from("files").select("*").eq("workspace_id", workspaceId!);
      if (projectId) q = q.eq("project_id", projectId);
      const { data, error } = await q.order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as FileRow[];
    },
  });
}

/* ------------ derived ------------ */

export function projectProgress(tasks: Task[], projectId: string) {
  const scoped = tasks.filter((t) => t.project_id === projectId);
  if (!scoped.length) return 0;
  return Math.round((scoped.filter((t) => t.status === "done").length / scoped.length) * 100);
}
