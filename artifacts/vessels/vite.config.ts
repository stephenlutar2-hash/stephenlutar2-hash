import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { createPwaPlugin } from "../../lib/platform/src/pwa-config";
import { compression } from "vite-plugin-compression2";

const rawPort = process.env.PORT || "3000";
const port = Number(rawPort);
const basePath = "/vessels/";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    createPwaPlugin({ name: "Vessels", shortName: "Vessels", description: "Maritime Intelligence", themeColor: "#0a0e17" }),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
    ...(process.env.NODE_ENV === "production"
      ? [
          compression({ algorithm: "gzip", exclude: [/\.(br|gz)$/] }),
          compression({ algorithm: "brotliCompress", exclude: [/\.(br|gz)$/] }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-react": ["react", "react-dom"],
            "vendor-motion": ["framer-motion"],
          },
        },
      },
    },
    server: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
    preview: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
    },
  });
  