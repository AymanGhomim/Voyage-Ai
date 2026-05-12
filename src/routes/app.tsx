import { createFileRoute, redirect } from "@tanstack/react-router";
import { Dashboard } from "@/components/voyage/Dashboard";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Voyage AI — Trip Workspace" },
      { name: "description", content: "Your collaborative trip workspace: itineraries, maps, AI suggestions, and live chat." },
    ],
  }),
  // Server-side guard (TanStack Start beforeLoad)
  beforeLoad: () => {
    // SSR guard is skipped (localStorage is client-only).
    // Client-side guard is handled inside Dashboard via useAuth.
  },
  component: Dashboard,
});
