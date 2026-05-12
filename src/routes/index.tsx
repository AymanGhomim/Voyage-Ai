import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/components/voyage/Landing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Voyage AI — Plan dream trips together with AI" },
      { name: "description", content: "A cinematic, collaborative workspace for travel. Co-design itineraries with friends, powered by AI that thinks like a local." },
      { property: "og:title", content: "Voyage AI — Plan dream trips together with AI" },
      { property: "og:description", content: "A cinematic, collaborative workspace for travel, powered by AI." },
    ],
  }),
  component: Landing,
});
