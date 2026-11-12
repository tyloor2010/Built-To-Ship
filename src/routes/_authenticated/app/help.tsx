import { createFileRoute } from "@tanstack/react-router";
import { Card, EmptyState } from "@/components/pc/primitives";

export const Route = createFileRoute("/_authenticated/app/help")({
  component: Page,
});

function Page() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <h1 className="display text-3xl uppercase sm:text-5xl">Help</h1>
      <Card className="p-8">
        <EmptyState emoji="💡" title="Help is warming up." sub="Docs, shortcuts and support. Press ⌘K anywhere to jump around." />
      </Card>
    </div>
  );
}
