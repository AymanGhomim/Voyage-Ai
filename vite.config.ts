import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    // TanStack Router file-based routing (must come before tanstackStart)
    TanStackRouterVite({ autoCodeSplitting: true }),
    // TanStack Start SSR plugin
    tanstackStart({
      server: { entry: "server" },
    }),
    // React transform
    react(),
    // Tailwind v4 vite plugin
    tailwindcss(),
    // @ path alias from tsconfig
    tsConfigPaths(),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
