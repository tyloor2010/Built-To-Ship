import { createFileRoute } from "@tanstack/react-router";
import { Card, EmptyState } from "@/components/pc/primitives";

export const Route = createFileRoute("/_authenticated/app/calendar")({
  component: Page,
});

function Page() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <h1 className="display text-3xl uppercase sm:text-5xl">Calendar</h1>
      <Card className="p-8">
        <EmptyState emoji="🗓️" title="Calendar is warming up." sub="Task deadlines will show up here as your team schedules work." />
      </Card>
    </div>
  );
}
