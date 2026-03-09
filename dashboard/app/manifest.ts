import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BarberX Dashboard",
    short_name: "BarberX",
    description: "Gestione appuntamenti e barbieri",
    start_url: "/calendario",
    display: "standalone",
    background_color: "#1C1C1C",
    theme_color: "#FA3D3B",
    orientation: "any",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
