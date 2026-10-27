import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // URLs de la primera versión → nombres actuales de cada vista.
    // Next.js conserva los query params automáticamente.
    return [
      {
        source: "/app/session/recommend",
        destination: "/app/recomendaciones",
        permanent: true,
      },
      {
        source: "/app/session/new",
        destination: "/app/sesion/nueva",
        permanent: true,
      },
      {
        source: "/app/session",
        destination: "/app/sesion",
        permanent: true,
      },
      { source: "/app/home", destination: "/app/inicio", permanent: true },
      { source: "/app/routine", destination: "/app/personalizar", permanent: true },
      {
        source: "/app/subcategories",
        destination: "/app/actividades",
        permanent: true,
      },
      { source: "/app/history", destination: "/app/historial", permanent: true },
      { source: "/app/trash", destination: "/app/papelera", permanent: true },
      { source: "/app/account", destination: "/app/cuenta", permanent: true },
    ];
  },
  async headers() {
    // Cabeceras seguras no rompibles: la app no usa framing cross-origin,
    // ni cámara/micrófono/geolocalización (verificado por grep), y el
    // Referrer-Policy explícito iguala el default de los navegadores.
    // HSTS y CSP quedan fuera de esta fase por riesgo (local http / inline).
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
