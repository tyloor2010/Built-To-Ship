import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/synexis-logo.png";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of service | SYNEXIS" },
      { name: "description", content: "The rules for using SYNEXIS." },
      { property: "og:title", content: "Terms of service | SYNEXIS" },
      { property: "og:description", content: "The rules for using SYNEXIS." },
    ],
  }),
  component: Page,
});

const SECTIONS = [["Using SYNEXIS", "You may use SYNEXIS to plan and manage work for yourself and your team. Keep your sign-in details private and do not use the service for anything unlawful."], ["Your content", "Projects, tasks and files you add stay yours. We store them only to run the service for you."], ["Plans", "The Free plan has no time limit. Paid plans are not on sale yet; we will publish their terms before they are."], ["Changes", "If these terms change, we will update this page and note the date below."]];

function Page() {
  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="" width={40} height={40} className="size-10" />
          <span className="display text-sm">SYNEXIS</span>
        </Link>
        <h1 className="display mt-10 text-4xl uppercase">Terms of service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated November 2026</p>
        <div className="mt-8 space-y-6">
          {SECTIONS.map(([h, p]) => (
            <section key={h}>
              <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-sans)" }}>{h}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p}</p>
            </section>
          ))}
        </div>
        <Link to="/" className="mt-10 inline-block text-sm font-semibold text-primary underline underline-offset-4">Back to home</Link>
      </div>
    </div>
  );
}
