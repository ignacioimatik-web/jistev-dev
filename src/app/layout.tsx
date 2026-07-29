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
  title: "jistev | Imagino, lidero y construyo",
  description:
    "Ignacio Estevez (jistev) — Director técnico y desarrollador full-stack. Concibo la idea, lidero el proyecto y escribo el código.",
  keywords: [
    "director técnico",
    "desarrollador full-stack",
    "next.js",
    "ia",
    "automatización",
    "producto digital",
    "jistev",
    "ignacio estevez",
    "arquitecto de soluciones",
  ],
  openGraph: {
    title: "jistev | Imagino, lidero y construyo",
    description:
      "Director técnico y desarrollador full-stack. Concibo la idea, lidero el proyecto y escribo el código.",
    url: "https://jistev-dev.vercel.app",
    siteName: "jistev.dev",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "jistev | Imagino, lidero y construyo",
    description:
      "Director técnico y desarrollador full-stack. Concibo la idea, lidero el proyecto y escribo el código.",
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
