import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { cn } from "@/lib/utils";

/* ---------------- Button ---------------- */

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[14px] font-bold tracking-tight transition-[transform,box-shadow,background-color] duration-150 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-hard-none disabled:translate-x-0 disabled:translate-y-0 active:translate-x-[2px] active:translate-y-[2px] active:shadow-hard-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "ink-2 bg-primary text-primary-foreground shadow-hard-sm hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-hard",
        lime: "ink-2 bg-lime text-lime-foreground shadow-hard-sm hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-hard",
        ink: "ink-2 bg-foreground text-background shadow-hard-sm hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-hard",
        outline: "ink-2 bg-card text-foreground shadow-hard-sm hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-hard",
        danger: "ink-2 bg-destructive text-destructive-foreground shadow-hard-sm hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-hard",
        ghost: "border-2 border-transparent hover:bg-muted",
        link: "underline decoration-2 underline-offset-4 hover:text-primary",
      },
      size: {
        sm: "h-10 px-3.5 text-[13px] [&_svg]:size-4",
        md: "h-11 px-5 text-sm [&_svg]:size-4",
        lg: "h-14 px-7 text-base [&_svg]:size-5",
        icon: "size-11 [&_svg]:size-5",
        iconSm: "size-10 [&_svg]:size-4",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean | undefined;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, loading, disabled, children, ...props }, ref) => {
    if (asChild) {
      return <Slot ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props}>{children}</Slot>;
    }
    return (
      <button
        ref={ref}
        aria-busy={loading || undefined}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {loading && <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

/* ---------------- Card ---------------- */

export function Card({
  className,
  hoverable,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { hoverable?: boolean }) {
  return (
    <div
      className={cn(
        "ink rounded-[22px] bg-card shadow-hard",
        hoverable && "transition-transform duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-hard-lg",
        className,
      )}
      {...props}
    />
  );
}

/* ---------------- Badge / Sticker ---------------- */

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full ink-2 px-2.5 py-0.5 text-xs font-bold",
  {
    variants: {
      tone: {
        lime: "bg-lime text-lime-foreground",
        blue: "bg-primary text-primary-foreground",
        ink: "bg-foreground text-background",
        paper: "bg-card text-foreground",
        grape: "bg-grape text-grape-foreground",
        orange: "bg-tangerine text-tangerine-foreground",
        red: "bg-destructive text-destructive-foreground",
        muted: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { tone: "paper" },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export function Sticker({
  className,
  tone = "lime",
  rotate = -3,
  children,
}: {
  className?: string;
  tone?: "lime" | "blue" | "ink" | "grape" | "orange";
  rotate?: number;
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    lime: "bg-lime text-lime-foreground",
    blue: "bg-primary text-primary-foreground",
    ink: "bg-foreground text-background",
    grape: "bg-grape text-grape-foreground",
    orange: "bg-tangerine text-tangerine-foreground",
  };
  return (
    <span
      style={{ rotate: `${rotate}deg` }}
      className={cn(
        "inline-block ink rounded-[12px] px-3 py-1 text-xs font-black uppercase tracking-widest shadow-hard-sm",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ---------------- Progress ---------------- */

export function ProgressBar({
  value,
  className,
  tone = "blue",
}: {
  value: number;
  className?: string;
  tone?: "blue" | "lime" | "orange" | "red";
}) {
  const tones: Record<string, string> = {
    blue: "bg-primary",
    lime: "bg-lime",
    orange: "bg-tangerine",
    red: "bg-destructive",
  };
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-3 w-full overflow-hidden rounded-full ink-2 bg-muted", className)}
    >
      <div
        className={cn("h-full transition-[width] duration-500", tones[tone])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

/* ---------------- Avatar ---------------- */

const AVATAR_TONES = ["bg-primary text-primary-foreground", "bg-lime text-lime-foreground", "bg-grape text-grape-foreground", "bg-tangerine text-tangerine-foreground", "bg-foreground text-background"];

export function initialsOf(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

export function Avatar({
  name,
  src,
  size = 36,
  className,
  title,
}: {
  name?: string | null | undefined;
  src?: string | null | undefined;
  size?: number | undefined;
  className?: string | undefined;
  title?: string | undefined;
}) {
  const idx = (name ?? "?").charCodeAt(0) % AVATAR_TONES.length;
  const [broken, setBroken] = React.useState(false);
  return (
    <span
      title={title ?? name ?? undefined}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ink-2 font-black",
        AVATAR_TONES[idx],
        className,
      )}
    >
      {src && !broken ? (
        <img src={src} alt="" onError={() => setBroken(true)} className="h-full w-full object-cover" />
      ) : (
        initialsOf(name)
      )}
    </span>
  );
}

export function AvatarGroup({
  people,
  max = 4,
  size = 32,
}: {
  people: { name?: string | null | undefined; avatar_url?: string | null | undefined }[];
  max?: number;
  size?: number;
}) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <div className="flex items-center -space-x-2">
      {shown.map((p, i) => (
        <Avatar key={i} name={p.name} src={p.avatar_url} size={size} />
      ))}
      {rest > 0 && (
        <span
          style={{ width: size, height: size, fontSize: size * 0.34 }}
          className="inline-flex items-center justify-center rounded-full ink-2 bg-card font-black"
        >
          +{rest}
        </span>
      )}
    </div>
  );
}

/* ---------------- Status pill ---------------- */

export const STATUS_TONES: Record<string, "lime" | "blue" | "orange" | "red" | "muted" | "grape" | "ink"> = {
  planning: "grape",
  active: "blue",
  at_risk: "orange",
  completed: "lime",
  archived: "muted",
  on_track: "lime",
  off_track: "red",
  backlog: "muted",
  todo: "paper" as never,
  in_progress: "blue",
  review: "grape",
  done: "lime",
  low: "muted",
  medium: "blue",
  high: "orange",
  urgent: "red",
};

const LABELS: Record<string, string> = { todo: "To do", in_progress: "In progress", at_risk: "At risk", on_track: "On track", off_track: "Off track" };

export function labelize(value: string) {
  if (LABELS[value]) return LABELS[value]!;
  const t = value.replace(/_/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function relativeTime(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatDate(d: string | null | undefined) {
  if (!d) return "";
  return new Date(d.length === 10 ? d + "T00:00:00" : d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function StatusPill({ value, className }: { value: string; className?: string }) {
  const tone = STATUS_TONES[value] ?? "paper";
  return (
    <Badge tone={tone as never} className={className}>
      {labelize(value)}
    </Badge>
  );
}

/* ---------------- Inputs ---------------- */

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-12 w-full rounded-[14px] ink-2 bg-card px-4 text-sm font-semibold placeholder:font-medium placeholder:text-muted-foreground transition-shadow duration-150 focus:outline-none focus-visible:shadow-hard-sm aria-[invalid=true]:border-destructive",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-[14px] ink-2 bg-card px-4 py-3 text-sm font-semibold placeholder:font-medium placeholder:text-muted-foreground transition-shadow duration-150 focus:outline-none focus-visible:shadow-hard-sm aria-[invalid=true]:border-destructive",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-12 w-full rounded-[14px] ink-2 bg-card px-4 text-sm font-semibold focus:outline-none focus-visible:shadow-hard-sm",
        className,
      )}
      {...props}
    />
  ),
);
Select.displayName = "Select";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string | undefined;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-sm font-bold">{label}</span>
      {children}
      {hint && <span className="block text-xs font-medium text-muted-foreground">{hint}</span>}
    </label>
  );
}

/* ---------------- Layout helpers ---------------- */

export function SectionTitle({
  eyebrow,
  title,
  sub,
  className,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {eyebrow && <Sticker tone="lime">{eyebrow}</Sticker>}
      <h2 className="display text-4xl uppercase sm:text-5xl md:text-6xl">{title}</h2>
      {sub && <p className="max-w-2xl text-base font-medium text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function EmptyState({
  title,
  sub,
  action,
  icon: Icon,
  bare,
}: {
  title: string;
  sub?: string;
  action?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  bare?: boolean;
}) {
  const body = (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      {Icon && (
        <div className="grid size-12 place-items-center rounded-[14px] ink-2 bg-muted">
          <Icon className="size-5" />
        </div>
      )}
      <h3 className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-sans)", lineHeight: 1.2 }}>{title}</h3>
      {sub && <p className="max-w-sm text-sm text-muted-foreground">{sub}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
  return bare ? body : <Card>{body}</Card>;
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="display text-3xl uppercase sm:text-5xl">{title}</h1>
        {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-[14px] bg-muted", className)} />;
}

export function StatCard({
  label,
  value,
  hint,
  tone = "paper",
  icon,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: "paper" | "blue" | "lime" | "grape" | "orange";
  icon?: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    paper: "bg-card",
    blue: "bg-primary text-primary-foreground",
    lime: "bg-lime text-lime-foreground",
    grape: "bg-grape text-grape-foreground",
    orange: "bg-tangerine text-tangerine-foreground",
  };
  return (
    <Card hoverable className={cn("p-4 sm:p-5", tones[tone])}>
      <div className="flex items-start justify-between gap-3">
        <span className="text-[11px] font-black uppercase tracking-widest opacity-90">{label}</span>
        {icon}
      </div>
      <div className="display mt-3 text-3xl sm:text-5xl">{value}</div>
      {hint && <div className="mt-1 text-xs font-semibold opacity-80">{hint}</div>}
    </Card>
  );
}
