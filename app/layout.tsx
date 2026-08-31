import type { Metadata, Viewport } from "next";
import { Work_Sans, Plus_Jakarta_Sans, JetBrains_Mono, Fredoka } from "next/font/google";
import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import "./globals.css";

// Tipografía principal: UI, botones y controles.
const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Tipografía display: títulos, descripciones y encabezados.
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Tipografía de títulos display (reemplazo moderno de Fredoka One).
const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["600", "700"],
});

// Mono (números de reloj/temporizador y código).
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://gosession.vercel.app"),
  title: {
    default: "Go Sesión — Reserva tu sesión para hacer lo que quieras o recibir recomendaciones",
    template: "%s · Go Sesión",
  },
  description:
    "Reserva tu espacio personal por sesiones. Elige una categoría, personaliza tiempos y recomendaciones por categoría y actividad (mínimo, recomendado y máximo), o deja que Go te sugiera el siguiente paso según tu energía. ¿Qué esperas? Ingresa Ya!!.",
  openGraph: {
    type: "website",
    title: "Go Sesión — Reserva tu sesión para hacer lo que quieras o recibir recomendaciones",
    description:
      "Reserva tu espacio personal por sesiones. Personaliza tiempos y recomendaciones por categoría y actividad, o deja que Go te sugiera el siguiente paso según tu energía.",
    siteName: "Go Sesión",
    images: [
      {
        url: "/icons/512",
        width: 512,
        height: 512,
        alt: "Go Sesión — Reserva tu sesión",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Go Sesión — Reserva tu sesión para hacer lo que quieras o recibir recomendaciones",
    description:
      "Reserva tu espacio personal por sesiones. Cero parálisis, solo fluir.",
    images: ["/icons/512"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Go Sesión",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#d4e6f1" },
    { media: "(prefers-color-scheme: dark)", color: "#161617" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${workSans.variable} ${plusJakartaSans.variable} ${fredoka.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          themes={["celeste", "verde", "humo", "rosa", "blanco", "dark"]}
          disableTransitionOnChange
        >
          <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </ThemeProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
