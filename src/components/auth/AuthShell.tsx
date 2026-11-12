import logo from "@/assets/synexis-logo.png";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Card } from "@/components/pc/primitives";

export function AuthShell({
  eyebrow,
  title,
  sub,
  children,
  footer,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="dotted-bg flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link to="/" className="mb-8 flex items-center gap-3">
        <img src={logo} alt="SYNEXIS logo" width={44} height={44} className="size-11 shrink-0 object-contain" />
        <span className="display text-sm leading-[0.85]">
          SYNEXIS
        </span>
      </Link>

      <Card className="w-full max-w-md p-7">
        {eyebrow && <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{eyebrow}</p>}
        <h1 className="display mt-2 text-4xl uppercase">{title}</h1>
        {sub && <p className="mt-2 text-sm text-muted-foreground">{sub}</p>}
        <div className="mt-6">{children}</div>
      </Card>

      {footer && <div className="mt-6 text-sm font-semibold">{footer}</div>}
      <p className="mt-4 text-xs text-muted-foreground">
        <Link to="/terms" className="underline underline-offset-4 hover:text-foreground">Terms</Link>
        {" · "}
        <Link to="/privacy" className="underline underline-offset-4 hover:text-foreground">Privacy</Link>
      </p>
    </div>
  );
}
