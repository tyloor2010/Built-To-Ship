import logo from "@/assets/synexis-logo.png";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Bot,
  CalendarDays,
  FileText,
  FolderKanban,
  Gauge,
  HelpCircle,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  PieChart,
  Search,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, Badge, Button } from "@/components/pc/primitives";
import { useWorkspaceCtx } from "@/components/app/workspace-context";
import { useNotifications } from "@/lib/pc/data";
import { CommandPalette } from "@/components/app/CommandPalette";
import { cn } from "@/lib/utils";

const MAIN = [
  { to: "/app", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/app/projects", label: "Projects", icon: FolderKanban },
  { to: "/app/tasks", label: "My Tasks", icon: ListChecks },
  { to: "/app/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/app/team", label: "Team", icon: Users },
  { to: "/app/files", label: "Files", icon: FileText },
] as const;

const INSIGHTS = [
  { to: "/app/analytics", label: "Analytics", icon: PieChart },
  { to: "/app/reports", label: "Reports", icon: Gauge },
  { to: "/app/ai", label: "AI Commander", icon: Bot },
] as const;

const MOBILE = [
  { to: "/app", label: "Home", icon: LayoutDashboard, exact: true },
  { to: "/app/projects", label: "Projects", icon: FolderKanban },
  { to: "/app/tasks", label: "Tasks", icon: ListChecks },
  { to: "/app/ai", label: "AI", icon: Bot },
  { to: "/app/settings/profile", label: "You", icon: Settings },
] as const;

function useActive() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (to: string, exact?: boolean) => (exact ? pathname === to : pathname === to || pathname.startsWith(to + "/"));
}

function NavItem({
  to,
  label,
  icon: Icon,
  active,
  badge,
  onClick,
}: {
  to: string;
  label: string;
  icon: typeof Bell;
  active: boolean;
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-bold transition-colors",
        active ? "ink-2 bg-primary text-primary-foreground shadow-hard-sm" : "text-foreground/70 hover:bg-muted",
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{label}</span>
      {!!badge && badge > 0 && (
        <span className="ml-auto grid min-w-5 place-items-center rounded-full ink-2 bg-lime px-1 text-[10px] font-black text-lime-foreground">
          {badge}
        </span>
      )}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { workspace, profile, userId, role } = useWorkspaceCtx();
  const isActive = useActive();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { data: notifications } = useNotifications(userId);
  const unread = (notifications ?? []).filter((n) => !n.read).length;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  const sidebar = (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-4">
      <Link to="/app" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
        <img src={logo} alt="SYNEXIS logo" width={44} height={44} className="size-10 shrink-0 object-contain" />
        <span className="display text-xs leading-[0.85]">
          SYNEXIS
        </span>
      </Link>

      <div className="rounded-[16px] ink-2 bg-card p-3 shadow-hard-sm">
        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Workspace</div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xl">{workspace.logo_emoji ?? "🚀"}</span>
          <span className="truncate text-sm font-black">{workspace.name}</span>
        </div>
        <Badge tone="blue" className="mt-2">
          {role}
        </Badge>
      </div>

      <nav className="space-y-1">
        <div className="px-3 pb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Main</div>
        {MAIN.map((i) => (
          <NavItem
            key={i.to}
            to={i.to}
            label={i.label}
            icon={i.icon}
            active={isActive(i.to, "exact" in i ? i.exact : false)}
            onClick={() => setMobileOpen(false)}
          />
        ))}
      </nav>

      <nav className="space-y-1">
        <div className="px-3 pb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Insights</div>
        {INSIGHTS.map((i) => (
          <NavItem key={i.to} to={i.to} label={i.label} icon={i.icon} active={isActive(i.to)} onClick={() => setMobileOpen(false)} />
        ))}
      </nav>

      <nav className="mt-auto space-y-1">
        <NavItem
          to="/app/notifications"
          label="Notifications"
          icon={Bell}
          active={isActive("/app/notifications")}
          {...(unread ? { badge: unread } : {})}
          onClick={() => setMobileOpen(false)}
        />
        <NavItem to="/app/settings/profile" label="Settings" icon={Settings} active={isActive("/app/settings")} onClick={() => setMobileOpen(false)} />
        <NavItem to="/app/help" label="Help" icon={HelpCircle} active={isActive("/app/help")} onClick={() => setMobileOpen(false)} />
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />

      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r-3 border-foreground bg-sidebar lg:block">
        {sidebar}
      </aside>

      {/* mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 border-r-3 border-foreground bg-sidebar">
            <button
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 grid size-9 place-items-center rounded-[12px] ink-2 bg-card"
            >
              <X className="size-4" />
            </button>
            {sidebar}
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        {/* top bar */}
        <header className="sticky top-0 z-30 border-b-3 border-foreground bg-background/95 backdrop-blur">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5 sm:px-5">
            <button
              aria-label="Open menu"
              className="grid size-10 place-items-center rounded-[12px] ink-2 bg-card lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-4" />
            </button>

            <button
              onClick={() => setPaletteOpen(true)}
              className="flex min-w-0 items-center gap-2 rounded-[14px] ink-2 bg-card px-3 py-2.5 text-left text-sm font-semibold text-muted-foreground hover:bg-muted"
            >
              <Search className="size-4 shrink-0" />
              <span className="truncate">Search projects, tasks, people…</span>
              <kbd className="ml-auto hidden shrink-0 rounded-[8px] ink-2 bg-background px-1.5 py-0.5 text-[10px] font-black sm:block">
                ⌘K
              </kbd>
            </button>

            <div className="flex items-center gap-2">
              <Link
                to="/app/notifications"
                aria-label="Notifications"
                className="relative grid size-10 place-items-center rounded-[12px] ink-2 bg-card hover:bg-muted"
              >
                <Bell className="size-4" />
                {unread > 0 && <span className="absolute -right-1 -top-1 size-3.5 rounded-full ink-2 bg-lime" />}
              </Link>
              <Link to="/app/settings/profile" aria-label="Your profile">
                <Avatar name={profile?.full_name ?? profile?.email} src={profile?.avatar_url} size={40} />
              </Link>
              <Button variant="ghost" size="iconSm" aria-label="Sign out" onClick={signOut} className="hidden sm:inline-flex">
                <LogOut className="size-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="px-3 pb-28 pt-5 sm:px-5 lg:pb-10">{children}</main>
      </div>

      {/* mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t-3 border-foreground bg-background lg:hidden">
        <div className="grid grid-cols-5">
          {MOBILE.map((i) => {
            const active = isActive(i.to, "exact" in i ? i.exact : false);
            return (
              <Link
                key={i.to}
                to={i.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[10px] font-black uppercase tracking-wider",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <i.icon className="size-5" />
                {i.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
