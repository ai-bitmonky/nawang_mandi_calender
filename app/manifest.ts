import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mandi Calendar",
    short_name: "Mandi",
    description: "What is growing near you, month by month, for every state in India.",
    start_url: "/",
    display: "standalone",
    background_color: "#F4EFE4",
    theme_color: "#F4EFE4",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
