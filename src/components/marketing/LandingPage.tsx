import logo from "@/assets/synexis-logo.png";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  CalendarDays,
  Check,
  FolderKanban,
  LineChart,
  ListChecks,
  Users,
} from "lucide-react";
import { Badge, Button, Card, Sticker } from "@/components/pc/primitives";
import { AppPreview } from "@/components/marketing/AppPreview";

const FEATURES = [
  { n: "01", t: "PROJECTS", d: "Everything stays organized in one place.", icon: FolderKanban, tone: "bg-primary text-primary-foreground" },
  { n: "02", t: "TASKS", d: "Know exactly what needs to happen next.", icon: ListChecks, tone: "bg-card" },
  { n: "03", t: "TEAM", d: "See who's doing what and keep everyone aligned.", icon: Users, tone: "bg-lime text-lime-foreground" },
  { n: "04", t: "TIMELINE", d: "Never lose track of important deadlines.", icon: CalendarDays, tone: "bg-card" },
  { n: "05", t: "ANALYTICS", d: "Turn project activity into useful insights.", icon: LineChart, tone: "bg-grape text-grape-foreground" },
  { n: "06", t: "AI COMMANDER", d: "Ask your workspace questions and get instant answers.", icon: Bot, tone: "bg-tangerine text-tangerine-foreground" },
];

const STEPS = [
  { n: "01", t: "CREATE", d: "Create your workspace and projects." },
  { n: "02", t: "ORGANIZE", d: "Assign tasks, deadlines and responsibilities." },
  { n: "03", t: "SHIP", d: "Track progress and get everything across the finish line." },
];

const PLANS = [
  {
    name: "FREE",
    price: "$0",
    per: "forever",
    blurb: "For individuals and small projects.",
    features: ["1 workspace", "Unlimited tasks", "3 projects", "Basic analytics"],
    tone: "bg-card",
    popular: false,
  },
  {
    name: "PRO",
    price: "$5",
    per: "/ user / month",
    blurb: "For growing teams.",
    features: ["Unlimited projects", "Kanban + calendar", "AI Commander", "Files & comments"],
    tone: "bg-primary text-primary-foreground",
    popular: true,
  },
  {
    name: "TEAM",
    price: "$15",
    per: "/ user / month",
    blurb: "For serious organizations.",
    features: ["Roles & permissions", "Advanced analytics", "Audit activity log", "Priority support"],
    tone: "bg-card",
    popular: false,
  },
];

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b-3 border-foreground bg-background/90 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <img src={logo} alt="SYNEXIS logo" width={44} height={44} className="size-11 shrink-0 object-contain" />
          <span className="display truncate text-sm leading-[0.85]">
            SYNEXIS
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-bold lg:flex">
          <a href="#features" className="hover:text-primary">Features</a>
          <a href="#how" className="hover:text-primary">How it works</a>
          <a href="#solutions" className="hover:text-primary">Solutions</a>
          <a href="#pricing" className="hover:text-primary">Pricing</a>
        </nav>
        <div className="flex items-center gap-2 justify-self-end">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/signup">Start free →</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />

      {/* HERO */}
      <section className="dotted-bg relative overflow-hidden border-b-3 border-foreground">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 md:pt-20">
          <div className="mx-auto max-w-4xl text-center">
            <Sticker tone="lime" rotate={-4}>BUILT TO SHIP</Sticker>
            <h1 className="display mt-6 text-[clamp(2.75rem,9vw,7rem)] uppercase">
              Run projects.
              <br />
              Ship <span className="text-primary">faster.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base font-semibold text-muted-foreground sm:text-lg">
              One powerful workspace for projects, teams, tasks, deadlines and everything you need to turn
              ideas into shipped work.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/signup">Start free →</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#how">See how it works</a>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {["No credit card", "Free workspace", "Built for modern teams"].map((t) => (
                <Badge key={t} tone="paper" className="gap-1">
                  <Check className="size-3" /> {t}
                </Badge>
              ))}
            </div>
          </div>

          <div className="relative mx-auto mt-14 max-w-6xl">
            <div className="pointer-events-none absolute -left-6 top-10 hidden -rotate-12 lg:block">
              <Sticker tone="blue" rotate={-14}>Real product</Sticker>
            </div>
            <div className="pointer-events-none absolute -right-4 -top-6 hidden lg:block">
              <StarBurst />
            </div>
            <div className="pointer-events-none absolute -bottom-6 left-1/4 hidden rotate-6 lg:block">
              <Sticker tone="orange" rotate={8}>Drag. Drop. Done.</Sticker>
            </div>
            <AppPreview />
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden border-b-3 border-foreground bg-foreground py-3 text-background">
        <div className="animate-marquee flex w-max gap-8 whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="flex gap-8 text-sm font-black uppercase tracking-[0.3em]">
              {["Projects", "Tasks", "Kanban", "Timelines", "Files", "Analytics", "AI Commander", "Team workload"].map(
                (w) => (
                  <span key={w} className="flex items-center gap-8">
                    {w} <span className="text-lime">✦</span>
                  </span>
                ),
              )}
            </span>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" className="border-b-3 border-foreground py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Sticker tone="blue">FEATURES</Sticker>
          <h2 className="display mt-5 max-w-4xl text-[clamp(2rem,6vw,4.5rem)] uppercase">
            Everything your team needs to <span className="text-primary">ship.</span>
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.n} hoverable className={`p-6 ${f.tone}`}>
                <div className="flex items-start justify-between">
                  <span className="display text-4xl opacity-80">{f.n}</span>
                  <span className="grid size-12 place-items-center rounded-[14px] ink-2 bg-background text-foreground">
                    <f.icon className="size-6" />
                  </span>
                </div>
                <h3 className="display mt-6 text-3xl uppercase">{f.t}</h3>
                <p className="mt-2 text-sm font-semibold opacity-80">{f.d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="grid-bg border-b-3 border-foreground py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Sticker tone="lime">HOW IT WORKS</Sticker>
          <h2 className="display mt-5 text-[clamp(2rem,6vw,4.5rem)] uppercase">Three moves to shipped.</h2>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative">
                <Card className="h-full bg-card p-8">
                  <span className="display text-[5rem] leading-none text-primary">{s.n}</span>
                  <h3 className="display mt-2 text-4xl uppercase">{s.t}</h3>
                  <p className="mt-3 text-sm font-semibold text-muted-foreground">{s.d}</p>
                </Card>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="absolute -right-5 top-1/2 hidden size-8 -translate-y-1/2 lg:block" strokeWidth={3} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTIONS */}
      <section id="solutions" className="border-b-3 border-foreground py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Sticker tone="grape">SOLUTIONS</Sticker>
          <h2 className="display mt-5 text-[clamp(2rem,6vw,4.5rem)] uppercase">Built for teams that ship.</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              ["Product teams", "Roadmaps, sprints and release plans in one command center.", "🛠️"],
              ["Agencies", "Client projects, deadlines and deliverables without the chaos.", "🎯"],
              ["Marketing", "Campaign launches with owners, assets and timelines.", "📣"],
              ["Operations", "Recurring work, workload balance and reporting.", "⚙️"],
            ].map(([t, d, e]) => (
              <Card key={t} hoverable className="p-6">
                <div className="grid size-14 place-items-center rounded-[16px] ink-2 bg-lime text-2xl shadow-hard-sm">
                  {e}
                </div>
                <h3 className="display mt-5 text-2xl uppercase">{t}</h3>
                <p className="mt-2 text-sm font-semibold text-muted-foreground">{d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="dotted-bg border-b-3 border-foreground py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Sticker tone="lime">PRICING</Sticker>
          <h2 className="display mt-5 text-[clamp(2rem,6vw,4.5rem)] uppercase">Simple, honest pricing.</h2>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {PLANS.map((p) => (
              <Card key={p.name} className={`relative p-8 ${p.tone} ${p.popular ? "lg:-translate-y-3" : ""}`}>
                {p.popular && (
                  <span className="absolute -top-4 right-6">
                    <Sticker tone="lime" rotate={6}>Most popular</Sticker>
                  </span>
                )}
                <h3 className="display text-3xl uppercase">{p.name}</h3>
                <p className="mt-1 text-sm font-semibold opacity-80">{p.blurb}</p>
                <div className="mt-6 flex items-end gap-2">
                  <span className="display text-6xl">{p.price}</span>
                  <span className="pb-2 text-xs font-black uppercase tracking-widest opacity-70">{p.per}</span>
                </div>
                <ul className="mt-6 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm font-bold">
                      <Check className="size-4" strokeWidth={3} /> {f}
                    </li>
                  ))}
                </ul>
                <Button asChild variant={p.popular ? "lime" : "primary"} className="mt-8 w-full">
                  <Link to="/signup">Start free →</Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Card className="relative overflow-hidden bg-foreground p-10 text-background sm:p-16">
            <h2 className="display text-[clamp(2rem,7vw,5rem)] uppercase">
              Stop managing. <span className="text-lime">Start shipping.</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm font-semibold opacity-80">
              Create your free workspace in under a minute. No credit card, no setup call, no nonsense.
            </p>
            <Button asChild variant="lime" size="lg" className="mt-8">
              <Link to="/signup">Create your workspace →</Link>
            </Button>
          </Card>
        </div>
      </section>

      <footer className="border-t-3 border-foreground py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span className="display text-sm leading-[0.9]">
            SYNEXIS
          </span>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Run projects. Align teams. Ship faster.
          </p>
        </div>
      </footer>
    </div>
  );
}

function StarBurst() {
  return (
    <svg width="110" height="110" viewBox="0 0 100 100" aria-hidden="true">
      <path
        d="M50 2 58 32 88 22 68 48 96 62 64 66 72 96 50 74 28 96 36 66 4 62 32 48 12 22 42 32Z"
        fill="var(--lime)"
        stroke="var(--foreground)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
