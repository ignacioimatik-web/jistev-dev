"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { EASE_OUT } from "@/lib/motion";

const stats = [
  { n: "12+", l: "Proyectos entregados" },
  { n: "8", l: "Open Source" },
  { n: "2 sem", l: "MVP funcional" },
  { n: "Full", l: "De casa al deploy" },
];

export function Hero() {
  return (
    <section className="relative flex min-h-[100dvh] flex-col overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/hero-poster-zenit.jpg"
        className="absolute inset-0 z-0 h-full w-full object-cover"
      >
        <source src="/hero-bg-zenit.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay para legibilidad */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/85 via-background/70 to-background/95" />

      {/* Accent glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-orange-600/8 blur-[140px]" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 pt-28 pb-14">
        <div className="grid items-center gap-10 md:grid-cols-[1.4fr_0.6fr]">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.35, ease: EASE_OUT }}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.02] px-4 py-1.5 font-mono text-xs text-zinc-400"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              $ status: onboard
              <span className="ml-1.5 text-cyan-400">·</span>
              <a
                href="https://digitalcode.es"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 transition-colors hover:text-orange-300"
              >
                digitalcode.es
              </a>
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4, ease: EASE_OUT }}
              className="mt-6 text-4xl font-bold leading-[1.06] tracking-tight sm:text-5xl md:text-[52px]"
            >
              Escribo código que{" "}
              <span className="text-orange-400">
                convierte ideas
                <br />
                en productos
              </span>.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4, ease: EASE_OUT }}
              className="mt-5 max-w-lg text-base leading-relaxed text-zinc-400"
            >
              Ignacio Estevez (jistev). Full-stack + IA. De la idea al MVP
              funcional en semanas, construyendo sistemas completos de
              principio a fin.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4, ease: EASE_OUT }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Link
                              href="/presupuesto"
                              className="pressable inline-flex items-center justify-center rounded-[10px] bg-orange-700 px-7 py-3.5 text-sm font-semibold text-white transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-orange-600 shadow-[0_8px_30px_-8px_rgba(249,115,22,0.5)]"
                            >
                              Solicitar presupuesto
                            </Link>
              <Link
                href="#conceptos"
                className="pressable inline-flex items-center justify-center rounded-[10px] border border-line px-7 py-3.5 text-sm font-semibold text-zinc-100 transition-colors hover:border-cyan-400 hover:text-cyan-400"
              >
                Ver proyectos →
              </Link>
            </motion.div>
          </div>

          {/* Code panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.4, ease: EASE_OUT }}
            className="hidden overflow-hidden rounded-[14px] border border-line bg-subtle font-mono text-xs leading-relaxed text-[#9fb0c3] md:block"
          >
            <div className="flex gap-1.5 border-b border-line bg-background px-3.5 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
            </div>
            <div className="space-y-0.5 p-4">
              <span className="text-zinc-600"># /dev/jistev</span>
              <br />
              <span className="text-orange-300">const</span> jistev = {"{"}
              <br />
              &nbsp;&nbsp;rol: <span className="text-cyan-300">"full-stack + ia"</span>,<br />
              &nbsp;&nbsp;stack: [<span className="text-cyan-300">"next"</span>,<span className="text-cyan-300">"ts"</span>,<span className="text-cyan-300">"python"</span>],<br />
              &nbsp;&nbsp;mvp: <span className="text-amber-300">14</span> <span className="text-zinc-600">// dias</span>,<br />
              &nbsp;&nbsp;entregas: <span className="text-amber-300">12</span>+,<br />
              &nbsp;&nbsp;iaProd: <span className="text-amber-300">true</span>,<br />
              {"};"}
              <br />
              <br />
              <span className="text-orange-300">if</span> (teInteresa) {"{"}
              <br />
              &nbsp;&nbsp;hablemos();
              <br />
              {"}"}
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4, ease: EASE_OUT }}
          className="mt-16 grid grid-cols-2 gap-5 border-t border-line pt-8 sm:grid-cols-4"
        >
          {stats.map((s) => (
            <div key={s.l} className="text-left">
              <div className="font-mono text-[28px] font-medium text-cyan-400">
                {s.n}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wider text-zinc-500">
                {s.l}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}