import type { MetadataRoute } from "next";

/* Installs as a standalone app. One manifest colour only (paper); the light/dark pair lives in
   <meta name="theme-color"> (app/layout.tsx), which the app updates when the user picks a theme. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Mandi Calendar",
    short_name: "Mandi",
    description: "What is growing near you, month by month, for every state in India.",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F4EFE4",
    theme_color: "#F4EFE4",
    categories: ["food", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
