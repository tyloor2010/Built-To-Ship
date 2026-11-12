import logo from "@/assets/synexis-logo.png";
import { Link } from "@tanstack/react-router";
import { BarChart3, CalendarDays, Check, FolderKanban, ListChecks, Search, Users } from "lucide-react";
import { Button, Card } from "@/components/pc/primitives";
import { AppPreview } from "@/components/marketing/AppPreview";

const FEATURES = [
  { t: "Projects", d: "Group tasks, deadlines and people for each piece of work, with progress you can see at a glance.", icon: FolderKanban },
  { t: "Task board", d: "Five clear stages from Backlog to Done. Drag a card, or use the keyboard, to move it.", icon: ListChecks },
  { t: "Calendar", d: "Every task with a due date on one month view, so nothing slips past its day.", icon: CalendarDays },
  { t: "Team", d: "See who is in the workspace and what each person is assigned.", icon: Users },
  { t: "Analytics", d: "Tasks completed per week, by project and by person.", icon: BarChart3 },
  { t: "Quick search", d: "Press Ctrl K to jump to any project, task, person or page.", icon: Search },
];

const STEPS = [
  { n: "1", t: "Create a workspace", d: "Sign up and name your workspace. It takes about a minute." },
  { n: "2", t: "Add projects and tasks", d: "Break the work into tasks, set due dates and assign owners." },
  { n: "3", t: "Track progress", d: "Move tasks across the board and watch each project fill up." },
];

const PLANS = [
  { name: "Free", price: "$0", per: "no time limit", blurb: "For individuals and small projects.", features: ["1 workspace", "Up to 3 projects", "Unlimited tasks", "Basic analytics"], featured: false, available: true },
  { name: "Pro", price: "$5", per: "per user / month", blurb: "For growing teams.", features: ["Unlimited projects", "Board and calendar views", "Files on projects", "Full analytics"], featured: true, available: false },
  { name: "Team", price: "$15", per: "per user / month", blurb: "For larger organizations.", features: ["Roles and permissions", "Activity history", "Priority support", "Everything in Pro"], featured: false, available: false },
];

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b-3 border-foreground bg-background/95 backdrop-blur">
      <div className="mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:gap-8">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <img src={logo} alt="" width={40} height={40} className="size-10 shrink-0 object-contain" />
          <span className="display truncate text-sm">SYNEXIS</span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-6 text-sm font-semibold lg:flex">
          <a href="#features" className="hover:text-primary">Features</a>
          <a href="#how" className="hover:text-primary">How it works</a>
          <a href="#pricing" className="hover:text-primary">Pricing</a>
        </nav>
        <div className="flex items-center gap-2 justify-self-end">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex"><Link to="/login">Sign in</Link></Button>
          <Button asChild size="sm"><Link to="/signup">Start free</Link></Button>
        </div>
      </div>
    </header>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Nav />

      <main>
        <section className="dotted-bg border-b-3 border-foreground">
          <div className="mx-auto max-w-[1200px] px-4 pb-16 pt-14 sm:px-6 md:pt-20">
            <div className="max-w-3xl">
              <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Project management for small teams</p>
              <h1 className="display mt-4 text-[clamp(2.5rem,8vw,6rem)] uppercase">
                Run projects.<br />Align teams.<br /><span className="text-primary">Ship faster.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
                SYNEXIS keeps your projects, tasks and deadlines in one shared workspace, so everyone knows what is next and who owns it.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg"><Link to="/signup">Create a free workspace</Link></Button>
                <Button asChild size="lg" variant="outline"><a href="#how">How it works</a></Button>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">Free plan, no card required.</p>
            </div>
            <div className="mt-14">
              <AppPreview />
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-20 border-b-3 border-foreground py-20">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Features</p>
            <h2 className="display mt-3 max-w-3xl text-[clamp(2rem,5vw,3.5rem)] uppercase">What your team gets</h2>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f, i) => (
                <Card key={f.t} className={`p-6 ${i === 0 ? "bg-primary text-primary-foreground lg:col-span-2" : ""}`}>
                  <span className="grid size-11 place-items-center rounded-[12px] border-2 border-foreground bg-background text-foreground"><f.icon className="size-5" /></span>
                  <h3 className="mt-5 text-xl font-bold" style={{ fontFamily: "var(--font-sans)", lineHeight: 1.2 }}>{f.t}</h3>
                  <p className={`mt-2 max-w-md text-sm ${i === 0 ? "opacity-90" : "text-muted-foreground"}`}>{f.d}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="grid-bg scroll-mt-20 border-b-3 border-foreground py-20">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">How it works</p>
            <h2 className="display mt-3 text-[clamp(2rem,5vw,3.5rem)] uppercase">Three steps to start</h2>
            <ol className="mt-10 grid gap-5 lg:grid-cols-3">
              {STEPS.map((s) => (
                <li key={s.n}>
                  <Card className="h-full p-6">
                    <span className="grid size-11 place-items-center rounded-full border-2 border-foreground bg-lime font-black text-lime-foreground">{s.n}</span>
                    <h3 className="mt-5 text-xl font-bold" style={{ fontFamily: "var(--font-sans)", lineHeight: 1.2 }}>{s.t}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
                  </Card>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-20 border-b-3 border-foreground py-20">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Pricing</p>
            <h2 className="display mt-3 text-[clamp(2rem,5vw,3.5rem)] uppercase">Simple pricing</h2>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground">Start on Free today. Pro and Team are not on sale yet; you will be able to upgrade from inside the app when they launch.</p>
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {PLANS.map((p) => (
                <Card key={p.name} className={`flex flex-col p-7 ${p.featured ? "bg-primary text-primary-foreground" : ""}`}>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-sans)" }}>{p.name}</h3>
                    {!p.available && <span className="rounded-full border-2 border-current px-2.5 py-0.5 text-xs font-bold">Coming soon</span>}
                  </div>
                  <p className={`mt-1 text-sm ${p.featured ? "opacity-90" : "text-muted-foreground"}`}>{p.blurb}</p>
                  <div className="mt-6 flex items-end gap-2">
                    <span className="display text-5xl">{p.price}</span>
                    <span className={`pb-1.5 text-sm ${p.featured ? "opacity-90" : "text-muted-foreground"}`}>{p.per}</span>
                  </div>
                  <ul className="mt-6 flex-1 space-y-2">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm font-semibold"><Check className="size-4 shrink-0" strokeWidth={3} /> {f}</li>
                    ))}
                  </ul>
                  {p.available ? (
                    <Button asChild className="mt-8 w-full"><Link to="/signup">Start free</Link></Button>
                  ) : (
                    <Button asChild variant={p.featured ? "lime" : "outline"} className="mt-8 w-full"><Link to="/signup">Start on Free for now</Link></Button>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <Card className="bg-foreground p-8 text-background sm:p-12">
              <h2 className="display text-[clamp(2rem,5vw,3.5rem)] uppercase">Get your team on <span className="text-lime">one page</span></h2>
              <p className="mt-3 max-w-xl text-sm opacity-85">Create a workspace, add your first project and let the board keep everyone in step.</p>
              <Button asChild variant="lime" size="lg" className="mt-8"><Link to="/signup">Create a free workspace</Link></Button>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t-3 border-foreground py-10">
        <div className="mx-auto grid max-w-[1200px] gap-6 px-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="" width={32} height={32} className="size-8" />
            <div>
              <div className="display text-sm">SYNEXIS</div>
              <div className="text-xs text-muted-foreground">Run projects. Align teams. Ship faster.</div>
            </div>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
            <a href="#features" className="hover:text-primary">Features</a>
            <a href="#pricing" className="hover:text-primary">Pricing</a>
            <Link to="/terms" className="hover:text-primary">Terms</Link>
            <Link to="/privacy" className="hover:text-primary">Privacy</Link>
            <Link to="/login" className="hover:text-primary">Sign in</Link>
          </nav>
          <p className="text-xs text-muted-foreground sm:col-span-2">© 2026 SYNEXIS</p>
        </div>
      </footer>
    </div>
  );
}
