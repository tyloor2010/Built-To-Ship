import logo from "@/assets/synexis-logo.png";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  CalendarDays,
  FileText,
  FolderKanban,
  HelpCircle,
  User,
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
import { Avatar } from "@/components/pc/primitives";
import { useWorkspaceCtx } from "@/components/app/workspace-context";
import { useNotifications } from "@/lib/pc/data";
import { CommandPalette } from "@/components/app/CommandPalette";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
] as const;

const MOBILE = [
  { to: "/app", label: "Home", icon: LayoutDashboard, exact: true },
  { to: "/app/projects", label: "Projects", icon: FolderKanban },
  { to: "/app/tasks", label: "Tasks", icon: ListChecks },
  { to: "/app/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/app/settings/profile", label: "Settings", icon: Settings },
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
        "flex min-h-11 items-center gap-3 rounded-[14px] border-2 px-3 text-sm font-bold transition-colors duration-150",
        active ? "border-foreground bg-primary text-primary-foreground" : "border-transparent text-foreground/75 hover:bg-muted",
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
  const [isMac, setIsMac] = useState(true);
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent));
  }, []);

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
          <span className="truncate text-sm font-black">{workspace.name}</span>
        </div>
        <span className="mt-1 block text-xs text-muted-foreground">{role.charAt(0).toUpperCase() + role.slice(1)}</span>
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
          <div role="dialog" aria-label="Menu" className="absolute inset-y-0 left-0 w-72 border-r-3 border-foreground bg-sidebar">
            <button
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 grid size-11 place-items-center rounded-[12px] ink-2 bg-card"
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
              className="grid size-11 place-items-center rounded-[12px] ink-2 bg-card lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-4" />
            </button>

            <button
              onClick={() => setPaletteOpen(true)}
              aria-label="Search"
              className="flex min-h-11 min-w-0 max-w-xl items-center gap-2 rounded-[14px] ink-2 bg-card px-3 text-left text-sm font-semibold text-muted-foreground hover:bg-muted"
            >
              <Search className="size-4 shrink-0" />
              <span className="truncate">Search projects, tasks, people</span>
              <kbd className="ml-auto hidden shrink-0 rounded-[8px] ink-2 bg-background px-1.5 py-0.5 text-[11px] font-bold sm:block">
                {isMac ? "⌘K" : "Ctrl K"}
              </kbd>
            </button>

            <div className="flex items-center gap-2">
              <Link
                to="/app/notifications"
                aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
                className="relative grid size-11 place-items-center rounded-[12px] ink-2 bg-card hover:bg-muted"
              >
                <Bell className="size-4" />
                {unread > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full ink-2 bg-lime px-1 text-[11px] font-black text-lime-foreground">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger aria-label="Account menu" className="rounded-full focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary">
                  <Avatar name={profile?.full_name ?? profile?.email} src={profile?.avatar_url} size={44} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-[14px] border-2 border-foreground p-1 shadow-hard-sm">
                  <DropdownMenuLabel className="font-normal">
                    <div className="truncate text-sm font-bold">{profile?.full_name ?? "Your account"}</div>
                    <div className="truncate text-xs text-muted-foreground">{profile?.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => navigate({ to: "/app/settings/profile", hash: "profile" })}>
                    <User className="size-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => navigate({ to: "/app/settings/profile" })}>
                    <Settings className="size-4" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => void signOut()}>
                    <LogOut className="size-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="px-4 pb-28 pt-6 sm:px-6 lg:pb-12 xl:px-8"><div className="page">{children}</div></main>
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
                  "flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-bold",
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
