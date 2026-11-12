import { createFileRoute } from "@tanstack/react-router";
import { Card, EmptyState } from "@/components/pc/primitives";

export const Route = createFileRoute("/_authenticated/app/ai")({ component: AiPage });

function AiPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="display text-3xl uppercase sm:text-5xl">AI Commander</h1>
      <Card className="p-8">
        <EmptyState emoji="🤖" title="Assistant coming online." sub="Ask for project summaries, risk checks and next steps here." />
      </Card>
    </div>
  );
}
