"use client";

import { useEffect } from "react";

/**
 * Borde de error raíz (9A). Registra el error para diagnóstico
 * (punto de enganche futuro para Sentry) y ofrece reintentar.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO(sentry): reportar aquí cuando haya DSN.
    console.error("Error no capturado:", error);
  }, [error]);

  return (
    <html lang="es">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: 24,
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <p style={{ fontSize: 20, fontWeight: 600 }}>Algo salió mal.</p>
          <p style={{ color: "#666" }}>Inténtalo de nuevo o vuelve al inicio.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "10px 20px",
              borderRadius: 999,
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
