import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, Button, Card, Field, Input, PageHeader } from "@/components/pc/primitives";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { useWorkspaceCtx } from "@/components/app/workspace-context";

export const Route = createFileRoute("/_authenticated/app/settings/profile")({
  head: () => ({ meta: [{ title: "Settings | SYNEXIS" }] }),
  component: SettingsPage,
});

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <Card id={id} className="grid gap-6 p-6 md:grid-cols-[240px_minmax(0,1fr)]">
      <div>
        <h2 className="text-base font-bold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="max-w-lg">{children}</div>
    </Card>
  );
}

function SettingsPage() {
  const { profile, userId, workspace, isAdmin } = useWorkspaceCtx();
  const qc = useQueryClient();
  const [name, setName] = useState(profile?.full_name ?? "");
  const [wsName, setWsName] = useState(workspace.name);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  useEffect(() => { if (profile?.full_name) setName(profile.full_name); }, [profile?.full_name]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setBusy("profile");
    const { error } = await supabase.from("profiles").update({ full_name: name.trim() }).eq("id", userId);
    setBusy(null);
    if (error) return void toast.error(`Could not save your profile. ${error.message}`);
    await qc.invalidateQueries();
    toast.success("Profile saved");
  }

  async function saveWorkspace(e: React.FormEvent) {
    e.preventDefault();
    if (wsName.trim().length < 2) return void toast.error("Workspace name needs at least 2 characters.");
    setBusy("ws");
    const { error } = await supabase.from("workspaces").update({ name: wsName.trim() }).eq("id", workspace.id);
    setBusy(null);
    if (error) return void toast.error(`Could not rename the workspace. ${error.message}`);
    await qc.invalidateQueries();
    toast.success("Workspace renamed");
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) return void toast.error("Use at least 8 characters for your password.");
    if (pw !== pw2) return void toast.error("The two passwords do not match.");
    setBusy("pw");
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(null);
    if (error) return void toast.error(`Could not change your password. ${error.message}`);
    setPw(""); setPw2("");
    toast.success("Password changed");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your profile, workspace and account." />

      <Section id="profile" title="Profile" description="How you appear to teammates.">
        <form onSubmit={saveProfile} className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar name={name || profile?.email} src={profile?.avatar_url} size={56} />
            <p className="text-sm text-muted-foreground">Your photo comes from your Google account when you sign in with Google.</p>
          </div>
          <Field label="Full name"><Input required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Email" hint="Your sign-in email cannot be changed here."><Input value={profile?.email ?? ""} readOnly disabled /></Field>
          <Button type="submit" loading={busy === "profile"}>Save profile</Button>
        </form>
      </Section>

      <Section id="workspace" title="Workspace" description={isAdmin ? "The name everyone in the workspace sees." : "Only owners and admins can change this."}>
        <form onSubmit={saveWorkspace} className="space-y-4">
          <Field label="Workspace name"><Input required disabled={!isAdmin} value={wsName} onChange={(e) => setWsName(e.target.value)} /></Field>
          {isAdmin && <Button type="submit" loading={busy === "ws"}>Save workspace</Button>}
        </form>
      </Section>

      <Section id="account" title="Account" description="Change the password you use to sign in.">
        <form onSubmit={savePassword} className="space-y-4">
          <Field label="New password" hint="At least 8 characters."><PasswordInput autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} /></Field>
          <Field label="Confirm new password"><PasswordInput autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} /></Field>
          <Button type="submit" loading={busy === "pw"} disabled={!pw}>Change password</Button>
        </form>
      </Section>
    </div>
  );
}
