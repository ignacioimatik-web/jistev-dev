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
      className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}