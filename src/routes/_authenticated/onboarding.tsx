import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { Button, Card, Field, Input, ProgressBar, Textarea } from "@/components/pc/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: Onboarding,
});

const TEAM_SIZES = ["1", "2–5", "6–20", "21–50", "50+"];
const GOALS = ["Manage projects", "Manage a team", "Track clients", "Plan launches", "Organize operations"];

function Onboarding() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useSession();
  const [step, setStep] = useState(0);
  const first = ((user?.user_metadata?.['full_name'] as string | undefined) ?? user?.email ?? "").split(/[ @]/)[0];
  const [name, setName] = useState("");
  useEffect(() => {
    if (first && !name) setName(`${first.charAt(0).toUpperCase()}${first.slice(1)}'s Workspace`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [first]);
  const [description, setDescription] = useState("");
  const [teamSize, setTeamSize] = useState("2–5");
  const [goal, setGoal] = useState("Manage projects");
  const [saving, setSaving] = useState(false);

  async function finish() {
    if (!user) return;
    setSaving(true);
    const { data: ws, error } = await supabase
      .from("workspaces")
      .insert({
        name: name.trim() || "My Workspace",
        description,
        team_size: teamSize,
        main_goal: goal,
        created_by: user.id,
      })
      .select()
      .single();
    if (error || !ws) {
      setSaving(false);
      toast.error(`Could not create the workspace. ${error?.message ?? "Try again."}`);
      return;
    }
    const { error: mErr } = await supabase
      .from("workspace_members")
      .insert({ workspace_id: ws.id, user_id: user.id, role: "owner", status: "active" });
    if (mErr) {
      setSaving(false);
      toast.error(mErr.message);
      return;
    }
    await supabase.from("activity_logs").insert({
      workspace_id: ws.id,
      actor_id: user.id,
      action: "created the workspace",
      target: ws.name,
    });
    await qc.invalidateQueries();
    toast.success("Workspace created");
    navigate({ to: "/app", replace: true });
  }

  const steps = [
    {
      title: "Name your workspace",
      valid: name.trim().length > 1,
      body: (
        <div className="space-y-5">
          <Field label="Workspace name" hint="You can change this later in Settings.">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Studio" autoFocus />
          </Field>
        </div>
      ),
    },
    {
      title: "What will you use it for?",
      valid: true,
      body: (
        <Field label="Short description" hint="Optional. Teammates see this on the workspace.">
          <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Client websites and monthly marketing campaigns" />
        </Field>
      ),
    },
    {
      title: "How many people are on your team?",
      valid: true,
      body: (
        <div className="flex flex-wrap gap-3">
          {TEAM_SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setTeamSize(s)}
              className={cn(
                "rounded-[14px] ink-2 px-5 py-3 text-sm font-black transition-transform",
                teamSize === s ? "bg-primary text-primary-foreground shadow-hard-sm" : "bg-card hover:-translate-y-0.5",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "What is your main goal?",
      valid: true,
      body: (
        <div className="grid gap-3 sm:grid-cols-2">
          {GOALS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGoal(g)}
              className={cn(
                "rounded-[16px] ink-2 px-4 py-4 text-left text-sm font-black transition-transform",
                goal === g ? "bg-lime shadow-hard-sm" : "bg-card hover:-translate-y-0.5",
              )}
            >
              {g}
            </button>
          ))}
        </div>
      ),
    },
  ];

  const current = steps[step]!;

  return (
    <div className="dotted-bg flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-2xl p-8">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Step {step + 1} of {steps.length}</span>
        </div>
        <ProgressBar value={((step + 1) / steps.length) * 100} className="mt-5" />
        <h1 className="display mt-6 text-3xl uppercase sm:text-4xl">{current.title}</h1>
        <div className="mt-7">{current.body}</div>
        <div className="mt-9 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button size="lg" disabled={!current.valid} onClick={() => setStep((s) => s + 1)}>
              Continue
            </Button>
          ) : (
            <Button size="lg" variant="lime" loading={saving} onClick={finish}>
              Create workspace
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
