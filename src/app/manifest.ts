import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Anistreamz",
    short_name: "Anistreamz",
    description: "Anistreamz is a Best anime streaming web interface.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    orientation: "portrait-primary",
    categories: ["entertainment", "video"],
    lang: "en",
    icons: [
      { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
    ],
    screenshots: [
      { src: "/screenshot1.png", sizes: "1280x720", type: "image/png", form_factor: "wide" },
      { src: "/screenshot2.png", sizes: "1280x720", type: "image/png", form_factor: "wide" },
      { src: "/screenshot3.png", sizes: "1280x720", type: "image/png", form_factor: "wide" },
      { src: "/screenshot4.png", sizes: "1280x720", type: "image/png", form_factor: "wide" },
    ],
  };
}
