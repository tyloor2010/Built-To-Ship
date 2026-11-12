import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button, Field, Input } from "@/components/pc/primitives";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password | SYNEXIS" },
      { name: "description", content: "Request a password reset link for your SYNEXIS account." },
      { property: "og:title", content: "Reset your password | SYNEXIS" },
      { property: "og:description", content: "Request a password reset link." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(`Could not send the link. ${error.message}`);
      return;
    }
    setSent(true);
    return;
  }

  return (
    <AuthShell
            title={sent ? "Check your email" : "Reset your password"}
      sub={sent ? `If an account exists for ${email}, a reset link is on its way.` : "Enter your account email and we will send you a reset link."}
      footer={
        <Link to="/login" className="text-primary underline decoration-2 underline-offset-4">
          Back to sign in
        </Link>
      }
    >
      {!sent && (
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Email">
            <Input type="email" required autoFocus autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          </Field>
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
