import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Go Sesión-Reserva tu espacio y haz que cada momento cuente.",
    short_name: "Go Sesión",
    description:
      "Reserva tu espacio de enfoque: elige una actividad, inicia el cronómetro y avanza sin fricción.",
    start_url: "/app/home",
    display: "standalone",
    background_color: "#fafaf9",
    theme_color: "#6366f1",
    orientation: "portrait",
    lang: "es",
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png" },
      { src: "/icons/512", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/512-maskable",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
