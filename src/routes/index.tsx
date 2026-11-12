import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/marketing/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SYNEXIS — Run projects. Ship faster." },
      {
        name: "description",
        content:
          "SYNEXIS is one bold workspace for projects, tasks, teams, timelines, files and an AI project assistant.",
      },
      { property: "og:title", content: "SYNEXIS — Run projects. Ship faster." },
      {
        property: "og:description",
        content: "One workspace for projects, tasks, teams, deadlines and AI insight.",
      },
    ],
  }),
  component: LandingPage,
});
