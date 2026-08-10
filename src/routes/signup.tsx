import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button, Field, Input } from "@/components/pc/primitives";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your workspace — Project Command" },
      { name: "description", content: "Create a free Project Command workspace and start shipping." },
      { property: "og:title", content: "Create your workspace — Project Command" },
      { property: "og:description", content: "Create a free workspace and start shipping." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.session) {
      navigate({ to: "/onboarding", replace: true });
      return;
    }
    setSent(true);
    return;
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error("Google sign-in failed. Try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/onboarding", replace: true });
    return;
  }

  if (sent) {
    return (
      <AuthShell eyebrow="Almost there" title="Check your email." sub={`We sent a confirmation link to ${email}. Click it to activate your workspace.`}>
        <Button asChild variant="outline" className="w-full">
          <Link to="/login">Back to sign in</Link>
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Free forever plan"
      title="Start free."
      sub="Create your workspace in under a minute."
      footer={
        <span>
          Already have an account?{" "}
          <Link to="/login" className="text-primary underline decoration-2 underline-offset-4">
            Sign in
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Full name">
          <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Rivera" />
        </Field>
        <Field label="Work email">
          <Input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@team.com" />
        </Field>
        <Field label="Password" hint="At least 6 characters.">
          <Input type="password" required minLength={6} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </Field>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Creating…" : "Create workspace →"}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-[2px] flex-1 bg-foreground/20" />
        <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">or</span>
        <span className="h-[2px] flex-1 bg-foreground/20" />
      </div>

      <Button type="button" variant="outline" size="lg" className="w-full" onClick={google}>
        Continue with Google
      </Button>
    </AuthShell>
  );
}
