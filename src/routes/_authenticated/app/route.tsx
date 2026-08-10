import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/app/AppShell";
import { WorkspaceProvider } from "@/components/app/workspace-context";
import { Skeleton } from "@/components/pc/primitives";
import { useSession } from "@/hooks/use-session";
import { useMyWorkspace, useProfile } from "@/lib/pc/data";

export const Route = createFileRoute("/_authenticated/app")({
  component: AppLayout,
});

function AppLayout() {
  const navigate = useNavigate();
  const { user } = useSession();
  const { data: profile } = useProfile(user?.id);
  const { data, isLoading, isSuccess } = useMyWorkspace(user?.id);

  useEffect(() => {
    if (isSuccess && !data) navigate({ to: "/onboarding", replace: true });
  }, [isSuccess, data, navigate]);

  if (isLoading || !data || !user) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  return (
    <WorkspaceProvider
      value={{
        userId: user.id,
        profile: profile ?? null,
        workspace: data.workspace,
        role: data.role,
        canWrite: ["owner", "admin", "member"].includes(data.role),
        isAdmin: ["owner", "admin"].includes(data.role),
      }}
    >
      <AppShell>
        <Outlet />
      </AppShell>
    </WorkspaceProvider>
  );
}
