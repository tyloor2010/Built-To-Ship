import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { FieldError, GoogleButton, OrDivider } from "@/components/auth/GoogleButton";
import { Button, Field, Input } from "@/components/pc/primitives";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create an account | SYNEXIS" },
      { name: "description", content: "Create a free SYNEXIS account and set up your team's workspace." },
      { property: "og:title", content: "Create an account | SYNEXIS" },
      { property: "og:description", content: "Create a free account and set up your team's workspace." },
    ],
  }),
  component: SignupPage,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const errs = {
    name: name.trim().length < 2 ? "Enter your name." : null,
    email: !EMAIL_RE.test(email) ? "Enter a valid email address." : null,
    password: password.length < 8 ? "Use at least 8 characters." : null,
  };
  const show = (k: keyof typeof errs) => (touched[k] ? errs[k] : null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    if (errs.name || errs.email || errs.password) return;
    setError(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin, data: { full_name: name.trim() } },
    });
    setLoading(false);
    if (error) {
      setError(/registered/i.test(error.message) ? "An account with this email already exists. Sign in instead." : error.message);
      return;
    }
    if (data.session) return void navigate({ to: "/onboarding", replace: true });
    setSent(true);
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
    navigate({ to: "/onboarding", replace: true });
  }

  if (sent) {
    return (
      <AuthShell title="Check your email" sub={`We sent a confirmation link to ${email}. Open it to finish creating your account.`}>
        <Button asChild variant="outline" className="w-full"><Link to="/login">Back to sign in</Link></Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create an account"
      sub="The Free plan has no time limit and needs no card."
      footer={<span>Already have an account? <Link to="/login" className="text-primary underline decoration-2 underline-offset-4">Sign in</Link></span>}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label="Full name">
          <Input autoFocus autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, name: true }))} aria-invalid={!!show("name")} aria-describedby="e-name" />
          <FieldError id="e-name">{show("name")}</FieldError>
        </Field>
        <Field label="Work email">
          <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, email: true }))} placeholder="you@company.com" aria-invalid={!!show("email")} aria-describedby="e-email" />
          <FieldError id="e-email">{show("email")}</FieldError>
        </Field>
        <Field label="Password" hint={show("password") ? undefined : "At least 8 characters."}>
          <PasswordInput autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, password: true }))} aria-invalid={!!show("password")} aria-describedby="e-pw" />
          <FieldError id="e-pw">{show("password")}</FieldError>
        </Field>
        <FieldError id="e-form">{error}</FieldError>
        <Button type="submit" size="lg" className="w-full" loading={loading}>Create account</Button>
        <p className="text-xs text-muted-foreground">
          By creating an account you agree to the <Link to="/terms" className="underline underline-offset-4">Terms</Link> and <Link to="/privacy" className="underline underline-offset-4">Privacy policy</Link>.
        </p>
      </form>
      <OrDivider />
      <GoogleButton onClick={google} loading={gLoading} />
    </AuthShell>
  );
}
