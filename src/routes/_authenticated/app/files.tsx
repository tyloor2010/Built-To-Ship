import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/pc/primitives";
import { WorkspaceFiles } from "@/components/app/WorkspaceFiles";
import { pageMeta } from "@/lib/pc/page-meta";
export const Route = createFileRoute("/_authenticated/app/files")({ head: () => pageMeta("Files", "Manage attachments across your workspace projects."), component: Page });
function Page() { return <div className="space-y-6"><PageHeader title="Files" description="Attachments across your workspace." /><WorkspaceFiles /></div>; }
