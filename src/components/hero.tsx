"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const stats = [
  { n: "12+", l: "Proyectos entregados" },
  { n: "8", l: "Proyectos Open Source" },
  { n: "2 sem", l: "MVP funcional" },
  { n: "Full-Stack", l: "De principio a fin" },
];

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-20 text-center">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/hero-poster.jpg"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-zinc-950/70" />
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-transparent to-zinc-950/80" />

      {/* Content */}
      <div className="relative z-10 max-w-3xl">
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-950/60 px-4 py-1.5 text-xs text-zinc-400 backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Disponible para nuevos proyectos
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl"
        >
          Convierto ideas en{" "}
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
            productos digitales
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-zinc-400"
        >
          Desarrollo web full-stack, automatizaciones con IA y herramientas a
          medida. Construyo tu proyecto mientras tú te centras en lo que importa.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Button size="lg" asChild>
            <Link href="#contacto">Solicitar presupuesto</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="#proyectos">
              Ver proyectos <span className="ml-1">→</span>
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="relative z-10 mt-20 grid grid-cols-2 gap-8 sm:grid-cols-4"
      >
        {stats.map((s, i) => (
          <motion.div
            key={s.l}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
              {s.n}
            </div>
            <div className="mt-1 text-xs text-zinc-500">{s.l}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
