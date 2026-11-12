import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/marketing/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SYNEXIS | Project management for small teams" },
      { name: "description", content: "SYNEXIS keeps projects, tasks and deadlines in one shared workspace, with a task board, calendar and analytics. Free plan, no card required." },
      { property: "og:title", content: "SYNEXIS | Project management for small teams" },
      { property: "og:description", content: "Projects, tasks and deadlines in one shared workspace. Free plan, no card required." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://synexis.lovable.app/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://synexis.lovable.app/og-image.jpg" },
    ],
  }),
  component: LandingPage,
});
