import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
