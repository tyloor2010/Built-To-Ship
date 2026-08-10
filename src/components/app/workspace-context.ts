import { createContext, useContext } from "react";
import type { Member, Profile, Workspace } from "@/lib/pc/data";

export type WorkspaceCtx = {
  userId: string;
  profile: Profile | null;
  workspace: Workspace;
  role: Member["role"];
  canWrite: boolean;
  isAdmin: boolean;
};

const Ctx = createContext<WorkspaceCtx | null>(null);

export const WorkspaceProvider = Ctx.Provider;

export function useWorkspaceCtx() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useWorkspaceCtx must be used inside the app layout");
  return v;
}
