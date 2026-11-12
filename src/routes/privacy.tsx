import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/synexis-logo.png";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy policy | SYNEXIS" },
      { name: "description", content: "How SYNEXIS handles your data." },
      { property: "og:title", content: "Privacy policy | SYNEXIS" },
      { property: "og:description", content: "How SYNEXIS handles your data." },
    ],
  }),
  component: Page,
});

const SECTIONS = [["What we collect", "Your name, email address and the work you add, such as projects, tasks and comments."], ["How we use it", "Only to run SYNEXIS: signing you in, showing your workspace to its members and sending notifications you need."], ["Sharing", "We do not sell your data. Members of your workspace can see the work shared in it."], ["Your choices", "You can change your name and password in Settings at any time."]];

function Page() {
  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="" width={40} height={40} className="size-10" />
          <span className="display text-sm">SYNEXIS</span>
        </Link>
        <h1 className="display mt-10 text-4xl uppercase">Privacy policy</h1>
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
