import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader } from "@/components/pc/primitives";

export const Route = createFileRoute("/_authenticated/app/help")({
  head: () => ({ meta: [{ title: "Help | SYNEXIS" }] }),
  component: Page,
});

const FAQ = [
  ["How do I create a project?", "Open Projects and choose New project. Give it a name, a color and an optional deadline."],
  ["How do I move a task?", "On My Tasks, drag a card to another column. With a keyboard, focus the card and press the left or right arrow key."],
  ["Where do deadlines show up?", "Tasks with a due date appear on the Calendar and on each project's Timeline tab."],
  ["How do I find something fast?", "Press Ctrl K (or ⌘K on a Mac) to search projects, tasks, people and pages."],
  ["How do I rename my workspace?", "Go to Settings and edit the name under Workspace. Only owners and admins can change it."],
];

function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Help" description="Answers to common questions about SYNEXIS." />
      <Card className="divide-y-2 divide-foreground/10 p-2">
        {FAQ.map(([q, a]) => (
          <details key={q} className="group p-4">
            <summary className="cursor-pointer list-none text-sm font-bold marker:hidden">{q}</summary>
            <p className="mt-2 text-sm text-muted-foreground">{a}</p>
          </details>
        ))}
      </Card>
    </div>
  );
}
