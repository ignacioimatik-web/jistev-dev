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
  title: "Jistev | Desarrollo Full-Stack & Automatización con IA",
  description:
    "Construyo herramientas web, automatizaciones y soluciones con IA para hacer crecer tu negocio. MVP rápido, código limpio, resultados reales.",
  openGraph: {
    title: "Jistev | Desarrollo Full-Stack & Automatización con IA",
    description:
      "Construyo herramientas web, automatizaciones y soluciones con IA.",
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
      <body>{children}</body>
    </html>
  );
}
