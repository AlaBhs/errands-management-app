import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import * as path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: "localhost",
      },
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — changes almost never
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // Data fetching + state
          "vendor-query": [
            "@tanstack/react-query",
            "@tanstack/react-query-devtools",
            "zustand",
            "axios",
          ],
          // UI primitives — single unified radix package
          "vendor-ui": [
            "radix-ui",
            "class-variance-authority",
            "clsx",
            "tailwind-merge",
            "sonner",
          ],
          // Icons — typically large
          "vendor-icons": [
            "lucide-react",
            "@hugeicons/react",
            "@hugeicons/core-free-icons",
          ],
          // Forms + validation
          "vendor-forms": ["react-hook-form", "@hookform/resolvers", "zod"],
        },
      },
    },
  },
});
