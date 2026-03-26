import { VitePWA } from "vite-plugin-pwa";

export interface PwaAppConfig {
  name: string;
  shortName: string;
  description?: string;
  themeColor?: string;
  backgroundColor?: string;
}

export function createPwaPlugin(config: PwaAppConfig) {
  return VitePWA({
    registerType: "autoUpdate",
    includeAssets: ["favicon.ico", "apple-touch-icon.png"],
    workbox: {
      globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: "CacheFirst",
          options: {
            cacheName: "google-fonts-cache",
            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: "CacheFirst",
          options: {
            cacheName: "gstatic-fonts-cache",
            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          urlPattern: /\/api\/.*/i,
          handler: "NetworkFirst",
          options: {
            cacheName: "api-cache",
            expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
            networkTimeoutSeconds: 10,
          },
        },
      ],
      navigateFallback: "index.html",
      navigateFallbackDenylist: [/^\/api/],
    },
    manifest: {
      name: `${config.name} — SZL Holdings`,
      short_name: config.shortName,
      description: config.description || `${config.name} by SZL Holdings`,
      theme_color: config.themeColor || "#0a0a0f",
      background_color: config.backgroundColor || "#0a0a0f",
      display: "standalone",
      orientation: "any",
      scope: "/",
      start_url: "/",
      icons: [
        { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
        { src: "pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
    },
  });
}
