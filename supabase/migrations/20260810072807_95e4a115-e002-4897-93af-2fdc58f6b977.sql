
-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  job_title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_emoji TEXT DEFAULT '🚀',
  team_size TEXT,
  main_goal TEXT,
  timezone TEXT DEFAULT 'UTC',
  plan TEXT NOT NULL DEFAULT 'free',
  created_by UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspaces TO authenticated;
GRANT ALL ON public.workspaces TO service_role;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

CREATE TYPE public.member_role AS ENUM ('owner','admin','member','viewer');

CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  invited_email TEXT,
  role public.member_role NOT NULL DEFAULT 'member',
  status TEXT NOT NULL DEFAULT 'active',
  availability TEXT NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX workspace_members_unique ON public.workspace_members(workspace_id, user_id) WHERE user_id IS NOT NULL;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_members TO authenticated;
GRANT ALL ON public.workspace_members TO service_role;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- helpers
CREATE OR REPLACE FUNCTION public.is_workspace_member(_workspace_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.workspace_members m
    WHERE m.workspace_id = _workspace_id AND m.user_id = auth.uid() AND m.status = 'active');
$$;

CREATE OR REPLACE FUNCTION public.workspace_role(_workspace_id UUID)
RETURNS public.member_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.role FROM public.workspace_members m
    WHERE m.workspace_id = _workspace_id AND m.user_id = auth.uid() AND m.status = 'active' LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.can_write(_workspace_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.workspace_role(_workspace_id) IN ('owner','admin','member');
$$;

CREATE OR REPLACE FUNCTION public.is_workspace_admin(_workspace_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.workspace_role(_workspace_id) IN ('owner','admin');
$$;

-- profiles policies
CREATE POLICY "profiles self read" ON public.profiles FOR SELECT TO authenticated USING (
  id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.workspace_members a JOIN public.workspace_members b ON a.workspace_id = b.workspace_id
    WHERE a.user_id = auth.uid() AND b.user_id = public.profiles.id
  )
);
CREATE POLICY "profiles self insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- workspaces policies
CREATE POLICY "workspaces read" ON public.workspaces FOR SELECT TO authenticated USING (public.is_workspace_member(id) OR created_by = auth.uid());
CREATE POLICY "workspaces insert" ON public.workspaces FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "workspaces update" ON public.workspaces FOR UPDATE TO authenticated USING (public.is_workspace_admin(id)) WITH CHECK (public.is_workspace_admin(id));
CREATE POLICY "workspaces delete" ON public.workspaces FOR DELETE TO authenticated USING (public.workspace_role(id) = 'owner');

-- members policies
CREATE POLICY "members read" ON public.workspace_members FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_workspace_member(workspace_id));
CREATE POLICY "members insert" ON public.workspace_members FOR INSERT TO authenticated WITH CHECK (
  public.is_workspace_admin(workspace_id) OR EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.created_by = auth.uid())
);
CREATE POLICY "members update" ON public.workspace_members FOR UPDATE TO authenticated USING (public.is_workspace_admin(workspace_id) OR user_id = auth.uid());
CREATE POLICY "members delete" ON public.workspace_members FOR DELETE TO authenticated USING (public.is_workspace_admin(workspace_id));

-- projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#1557FF',
  status TEXT NOT NULL DEFAULT 'planning',
  health TEXT NOT NULL DEFAULT 'on_track',
  template TEXT,
  start_date DATE,
  deadline DATE,
  owner_id UUID REFERENCES auth.users ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects read" ON public.projects FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));
CREATE POLICY "projects write" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.can_write(workspace_id) AND created_by = auth.uid());
CREATE POLICY "projects update" ON public.projects FOR UPDATE TO authenticated USING (public.can_write(workspace_id)) WITH CHECK (public.can_write(workspace_id));
CREATE POLICY "projects delete" ON public.projects FOR DELETE TO authenticated USING (public.is_workspace_admin(workspace_id) OR owner_id = auth.uid());

CREATE TABLE public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX project_members_unique ON public.project_members(project_id, user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_members TO authenticated;
GRANT ALL ON public.project_members TO service_role;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pmembers read" ON public.project_members FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));
CREATE POLICY "pmembers write" ON public.project_members FOR ALL TO authenticated USING (public.can_write(workspace_id)) WITH CHECK (public.can_write(workspace_id));

-- tasks
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'medium',
  due_date DATE,
  assignee_id UUID REFERENCES auth.users ON DELETE SET NULL,
  labels TEXT[] NOT NULL DEFAULT '{}',
  position DOUBLE PRECISION NOT NULL DEFAULT 1000,
  completed_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks read" ON public.tasks FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));
CREATE POLICY "tasks insert" ON public.tasks FOR INSERT TO authenticated WITH CHECK (public.can_write(workspace_id) AND created_by = auth.uid());
CREATE POLICY "tasks update" ON public.tasks FOR UPDATE TO authenticated USING (public.can_write(workspace_id)) WITH CHECK (public.can_write(workspace_id));
CREATE POLICY "tasks delete" ON public.tasks FOR DELETE TO authenticated USING (public.can_write(workspace_id));

CREATE TABLE public.subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tasks ON DELETE CASCADE,
  title TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subtasks TO authenticated;
GRANT ALL ON public.subtasks TO service_role;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subtasks read" ON public.subtasks FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));
CREATE POLICY "subtasks write" ON public.subtasks FOR ALL TO authenticated USING (public.can_write(workspace_id)) WITH CHECK (public.can_write(workspace_id));

CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO authenticated;
GRANT ALL ON public.comments TO service_role;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments read" ON public.comments FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));
CREATE POLICY "comments insert" ON public.comments FOR INSERT TO authenticated WITH CHECK (public.can_write(workspace_id) AND author_id = auth.uid());
CREATE POLICY "comments update" ON public.comments FOR UPDATE TO authenticated USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
CREATE POLICY "comments delete" ON public.comments FOR DELETE TO authenticated USING (author_id = auth.uid() OR public.is_workspace_admin(workspace_id));

CREATE TABLE public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects ON DELETE SET NULL,
  task_id UUID REFERENCES public.tasks ON DELETE CASCADE,
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT NOT NULL DEFAULT 0,
  folder TEXT NOT NULL DEFAULT 'General',
  uploaded_by UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.files TO authenticated;
GRANT ALL ON public.files TO service_role;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "files read" ON public.files FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));
CREATE POLICY "files insert" ON public.files FOR INSERT TO authenticated WITH CHECK (public.can_write(workspace_id) AND uploaded_by = auth.uid());
CREATE POLICY "files delete" ON public.files FOR DELETE TO authenticated USING (uploaded_by = auth.uid() OR public.is_workspace_admin(workspace_id));

CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  action TEXT NOT NULL,
  target TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
GRANT ALL ON public.activity_logs TO service_role;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activity read" ON public.activity_logs FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));
CREATE POLICY "activity insert" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (public.is_workspace_member(workspace_id) AND actor_id = auth.uid());

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'update',
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif read" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notif insert" ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.is_workspace_member(workspace_id));
CREATE POLICY "notif update" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "notif delete" ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

-- updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER t_profiles_u BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_workspaces_u BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_projects_u BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_tasks_u BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- new user profile
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)), NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE INDEX idx_tasks_ws ON public.tasks(workspace_id);
CREATE INDEX idx_tasks_project ON public.tasks(project_id);
CREATE INDEX idx_projects_ws ON public.projects(workspace_id);
CREATE INDEX idx_activity_ws ON public.activity_logs(workspace_id, created_at DESC);
