import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/marketing/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SYNEXIS — Project Management Platform for Modern Teams" },
      {
        name: "description",
        content:
          "SYNEXIS helps teams plan projects, manage tasks, hit deadlines and collaborate in one powerful workspace — with Kanban boards, timelines, analytics and an AI project assistant.",
      },
      { property: "og:title", content: "SYNEXIS — Project Management Platform for Modern Teams" },
      {
        property: "og:description",
        content:
          "Plan, track and deliver every project with your team in one workspace — Kanban, timelines, analytics and AI insights.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});
