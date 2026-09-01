import type { Metadata, Viewport } from "next";
import { Work_Sans, Poppins, Inter, JetBrains_Mono } from "next/font/google";
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

// Display / headlines: Poppins 700.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["700"],
});

// Subheadings (600) y body (400): Inter.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Mono (números de reloj/temporizador y código).
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://gosession.vercel.app"),
  title: {
    default: "Go Sesión: Un espacio para mejorar tu productividad sin fricción",
    template: "%s · Go Sesión",
  },
  description:
    "Go: tu espacio personal para iniciar a tu ritmo. Organiza tus actividades, crea nuevos hábitos y personaliza tus sesiones según tu ánimo, energía y tiempo",
  openGraph: {
    type: "website",
    title: "Go Sesión: Un Espacio Para Empezar Tus Planes Sin Fricción",
    description:
      "Go: tu aliado para empezar a hacer lo que quieras fácilmente. Reserva sesiones, planifica tu día y deja que Go te sugiera el siguiente paso según tu energía, sin culpa ni bloqueos.",
    siteName: "Go Sesión",
    images: [
      {
        url: "/icons/512",
        width: 512,
        height: 512,
        alt: "Go Sesión, un espacio para ti sin fricción",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Go Sesión: Un Espacio Para Empezar Tus Planes facilmente",
    description:
      "Go: tu aliado para empezar a hacer lo que quieras fácilmente. Reserva sesiones, planifica tu día y deja que Go te sugiera el siguiente paso.",
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
      className={`${workSans.variable} ${poppins.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
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
