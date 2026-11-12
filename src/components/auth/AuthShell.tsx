import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Card, Sticker } from "@/components/pc/primitives";

export function AuthShell({
  eyebrow,
  title,
  sub,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="dotted-bg flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link to="/" className="mb-8 flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-[14px] ink bg-foreground text-background shadow-hard-sm">
          <span className="display text-lg">SX</span>
        </span>
        <span className="display text-sm leading-[0.85]">
          SYNEXIS
        </span>
      </Link>

      <Card className="w-full max-w-md p-7">
        <Sticker tone="lime" rotate={-3}>
          {eyebrow}
        </Sticker>
        <h1 className="display mt-5 text-4xl uppercase">{title}</h1>
        {sub && <p className="mt-2 text-sm font-semibold text-muted-foreground">{sub}</p>}
        <div className="mt-6">{children}</div>
      </Card>

      {footer && <div className="mt-6 text-sm font-bold">{footer}</div>}
    </div>
  );
}
