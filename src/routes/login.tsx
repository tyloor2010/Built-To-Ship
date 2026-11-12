import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button, Field, Input } from "@/components/pc/primitives";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — SYNEXIS" },
      { name: "description", content: "Sign in to your SYNEXIS workspace." },
      { property: "og:title", content: "Sign in — SYNEXIS" },
      { property: "og:description", content: "Sign in to your SYNEXIS workspace." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/app", replace: true });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back.");
    navigate({ to: "/app", replace: true });
    return;
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error("Google sign-in failed. Try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/app", replace: true });
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in."
      sub="Pick up right where your team left off."
      footer={
        <span>
          No account?{" "}
          <Link to="/signup" className="text-primary underline decoration-2 underline-offset-4">
            Start free →
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email">
          <Input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@team.com" />
        </Field>
        <Field label="Password">
          <Input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </Field>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs font-bold uppercase tracking-widest text-primary">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in →"}
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
