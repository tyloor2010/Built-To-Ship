CREATE TABLE public.ai_request_slots (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.ai_request_slots TO authenticated;
GRANT ALL ON public.ai_request_slots TO service_role;
ALTER TABLE public.ai_request_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own AI request slots" ON public.ai_request_slots FOR SELECT TO authenticated USING (user_id = auth.uid() AND is_workspace_member(workspace_id));
CREATE INDEX ai_request_slots_user_time ON public.ai_request_slots(user_id,created_at);
CREATE FUNCTION public.claim_ai_request(_workspace_id uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF auth.uid() IS NULL OR NOT is_workspace_member(_workspace_id) THEN RAISE EXCEPTION 'Forbidden'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 0));
 IF (SELECT count(*) FROM ai_request_slots WHERE user_id = auth.uid() AND created_at > now() - interval '1 minute') >= 6 THEN RETURN false; END IF;
 INSERT INTO ai_request_slots(user_id, workspace_id) VALUES(auth.uid(), _workspace_id);
 RETURN true;
END; $$;
REVOKE ALL ON FUNCTION public.claim_ai_request(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_ai_request(uuid) TO authenticated;