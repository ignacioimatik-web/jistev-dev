import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-zinc-950 text-zinc-100">
        {children}
      </body>
    </html>
  );
}
