import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { Button, Card, EmptyState, PageHeader, Skeleton, formatDate } from "@/components/pc/primitives";
import { useWorkspaceCtx } from "@/components/app/workspace-context";
import { useFiles, useProjects } from "@/lib/pc/data";

export const Route = createFileRoute("/_authenticated/app/files")({
  head: () => ({ meta: [{ title: "Files | SYNEXIS" }] }),
  component: Page,
});

function size(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

function Page() {
  const { workspace } = useWorkspaceCtx();
  const { data: files, isLoading } = useFiles(workspace.id);
  const { data: projects } = useProjects(workspace.id);
  return (
    <div className="space-y-6">
      <PageHeader title="Files" description="Every file attached to projects in this workspace." />
      {isLoading ? <Skeleton className="h-40" /> : !files?.length ? (
        <EmptyState icon={FileText} title="No files yet" sub="Files attached to a project are collected here."
          action={<Button asChild variant="outline"><Link to="/app/projects">Open projects</Link></Button>} />
      ) : (
        <Card className="divide-y-2 divide-foreground/10 p-2">
          {files.map((f) => (
            <div key={f.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-3">
              <FileText className="size-5" />
              <div className="min-w-0">
                <div className="truncate text-sm font-bold">{f.name}</div>
                <div className="text-xs text-muted-foreground">{projects?.find((p) => p.id === f.project_id)?.name ?? "No project"} · {size(f.size_bytes)}</div>
              </div>
              <span className="text-xs text-muted-foreground">{formatDate(f.created_at)}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
