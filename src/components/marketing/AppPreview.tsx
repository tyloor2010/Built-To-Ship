import { Avatar, AvatarGroup, Badge, Card, ProgressBar } from "@/components/pc/primitives";

const COLUMNS = [
  {
    title: "TODO",
    tone: "bg-card",
    cards: [
      { t: "Design pricing page", p: "HIGH", a: "Maya Chen", d: "Aug 21" },
      { t: "Write launch copy", p: "MED", a: "Alex Rivera", d: "Aug 23" },
    ],
  },
  {
    title: "IN PROGRESS",
    tone: "bg-primary/10",
    cards: [
      { t: "Homepage hero build", p: "URGENT", a: "Sam Ortiz", d: "Aug 19" },
      { t: "API integration", p: "HIGH", a: "Mike Duval", d: "Aug 22" },
    ],
  },
  {
    title: "REVIEW",
    tone: "bg-lime/25",
    cards: [{ t: "Onboarding flow QA", p: "MED", a: "Sarah Kim", d: "Aug 20" }],
  },
];

export function AppPreview() {
  return (
    <Card className="overflow-hidden p-0 shadow-hard-lg">
      {/* top bar */}
      <div className="flex items-center gap-2 border-b-3 border-foreground bg-muted px-4 py-2.5">
        <span className="size-3 rounded-full ink-2 bg-destructive" />
        <span className="size-3 rounded-full ink-2 bg-tangerine" />
        <span className="size-3 rounded-full ink-2 bg-lime" />
        <span className="ml-3 truncate text-[11px] font-black uppercase tracking-widest text-muted-foreground">
          projectcommand.app / workspace / website redesign
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[190px_minmax(0,1fr)]">
        {/* sidebar */}
        <aside className="hidden border-r-3 border-foreground bg-sidebar p-3 md:block">
          <div className="display text-[11px] leading-[0.9]">
            PROJECT
            <br />
            COMMAND
          </div>
          <div className="mt-4 space-y-1.5">
            {["Overview", "Projects", "My Tasks", "Calendar", "Team"].map((i, idx) => (
              <div
                key={i}
                className={`rounded-[10px] px-2.5 py-1.5 text-[12px] font-bold ${
                  idx === 1 ? "ink-2 bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {i}
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-[12px] ink-2 bg-lime p-2.5">
            <div className="text-[10px] font-black uppercase tracking-widest">Sprint health</div>
            <div className="display text-2xl">84%</div>
          </div>
        </aside>

        {/* content */}
        <div className="min-w-0 p-4 sm:p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <h3 className="display truncate text-2xl uppercase sm:text-3xl">Website Redesign</h3>
              <p className="truncate text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Due Aug 24 · 12 tasks · 5 members
              </p>
            </div>
            <AvatarGroup
              size={28}
              people={[{ name: "Maya Chen" }, { name: "Sam Ortiz" }, { name: "Mike Duval" }, { name: "Sarah Kim" }]}
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              ["PROGRESS", "78%", "bg-card"],
              ["OPEN TASKS", "12", "bg-primary text-primary-foreground"],
              ["HEALTH", "ON TRACK", "bg-lime text-lime-foreground"],
            ].map(([l, v, tone]) => (
              <div key={l} className={`rounded-[14px] ink-2 p-3 ${tone}`}>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-75">{l}</div>
                <div className="display text-xl">{v}</div>
              </div>
            ))}
          </div>

          <ProgressBar value={78} className="mt-3" />

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title} className={`rounded-[16px] ink-2 p-2.5 ${col.tone}`}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest">{col.title}</span>
                  <span className="rounded-full ink-2 bg-background px-1.5 text-[10px] font-black">
                    {col.cards.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {col.cards.map((c) => (
                    <div key={c.t} className="rounded-[12px] ink-2 bg-card p-2.5 shadow-hard-sm">
                      <div className="text-[12px] font-bold leading-tight">{c.t}</div>
                      <div className="mt-2 flex items-center justify-between">
                        <Badge tone={c.p === "URGENT" ? "red" : c.p === "HIGH" ? "orange" : "blue"}>{c.p}</Badge>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-muted-foreground">{c.d}</span>
                          <Avatar name={c.a} size={20} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
