import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, Button, Card, Field, Input } from "@/components/pc/primitives";
import { useWorkspaceCtx } from "@/components/app/workspace-context";

export const Route = createFileRoute("/_authenticated/app/settings/profile")({ component: ProfileSettings });

function ProfileSettings() {
  const { profile, userId } = useWorkspaceCtx();
  const qc = useQueryClient();
  const [name, setName] = useState(profile?.full_name ?? "");
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: name }).eq("id", userId);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    await qc.invalidateQueries();
    toast.success("Profile updated.");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="display text-4xl uppercase sm:text-5xl">Profile</h1>
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Avatar name={name || profile?.email} src={profile?.avatar_url} size={64} />
          <div className="min-w-0">
            <div className="truncate text-sm font-black">{profile?.email}</div>
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Signed in</div>
          </div>
        </div>
        <form onSubmit={save} className="mt-6 space-y-4">
          <Field label="Full name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
        </form>
      </Card>
    </div>
  );
}
