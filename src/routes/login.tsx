import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { FieldError, GoogleButton, OrDivider } from "@/components/auth/GoogleButton";
import { Button, Field, Input } from "@/components/pc/primitives";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in | SYNEXIS" },
      { name: "description", content: "Sign in to your SYNEXIS workspace." },
      { property: "og:title", content: "Sign in | SYNEXIS" },
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
  const [gLoading, setGLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/app", replace: true });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(
        /invalid login/i.test(error.message)
          ? "That email and password don't match. Check them and try again."
          : /not confirmed/i.test(error.message)
            ? "Confirm your email first. Check your inbox for the link we sent."
            : error.message,
      );
      return;
    }
    navigate({ to: "/app", replace: true });
  }

  async function google() {
    setGLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      setGLoading(false);
      setError("Google sign-in did not finish. Try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/app", replace: true });
  }

  return (
    <AuthShell
      title="Sign in"
      sub="Use your work email or Google account."
      footer={<span>No account? <Link to="/signup" className="text-primary underline decoration-2 underline-offset-4">Create one</Link></span>}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate={false}>
        <Field label="Email">
          <Input type="email" required autoFocus autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" aria-invalid={!!error} />
        </Field>
        <Field label="Password">
          <PasswordInput required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!error} aria-describedby="login-error" />
        </Field>
        <FieldError id="login-error">{error}</FieldError>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={loading}>Sign in</Button>
      </form>
      <OrDivider />
      <GoogleButton onClick={google} loading={gLoading} />
    </AuthShell>
  );
}
