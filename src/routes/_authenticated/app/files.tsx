import { createFileRoute } from "@tanstack/react-router";
import { Card, EmptyState } from "@/components/pc/primitives";

export const Route = createFileRoute("/_authenticated/app/files")({
  component: Page,
});

function Page() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <h1 className="display text-4xl uppercase sm:text-5xl">Files</h1>
      <Card className="p-8">
        <EmptyState emoji="📎" title="Files is warming up." sub="Upload attachments from a project to see them collected here." />
      </Card>
    </div>
  );
}
