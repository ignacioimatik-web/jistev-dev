import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "jistev | Full-Stack Developer & AI Automation",
  description:
    "Ignacio Estevez (jistev) — Desarrollo web full-stack, automatizaciones con IA, bots y herramientas a medida. MVP en 2 semanas.",
  keywords: [
    "desarrollador full-stack",
    "next.js",
    "ia",
    "automatización",
    "mvp",
    "python",
    "typescript",
    "jistev",
  ],
  openGraph: {
    title: "jistev | Full-Stack Developer & AI Automation",
    description:
      "Convierto ideas en productos digitales. Next.js, IA, automatizaciones.",
    url: "https://jistev-dev.vercel.app",
    siteName: "jistev.dev",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "jistev | Full-Stack Developer & AI Automation",
    description:
      "Convierto ideas en productos digitales. Next.js, IA, automatizaciones.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}