import { createFileRoute } from "@tanstack/react-router";
import { Card, EmptyState } from "@/components/pc/primitives";

export const Route = createFileRoute("/_authenticated/app/reports")({
  component: Page,
});

function Page() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <h1 className="display text-3xl uppercase sm:text-5xl">Reports</h1>
      <Card className="p-8">
        <EmptyState emoji="📄" title="Reports is warming up." sub="Exportable weekly summaries land here once you log activity." />
      </Card>
    </div>
  );
}
