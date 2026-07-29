"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionWrapper, SectionHeading } from "@/components/section-wrapper";
import { concepts } from "@/lib/data";

export function Concepts() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <SectionWrapper id="conceptos">
      <SectionHeading
        label="Conceptos"
        title="Ideas que he concebido y liderado"
      />

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mx-auto mb-14 max-w-3xl text-center text-sm leading-relaxed text-zinc-400"
      >
        No construyo proyectos porque sí. Cada idea nace de un problema real que
        identifico, un concepto original que diseño y un sistema que lidero hasta
        que funciona. Esto es lo que he imaginado.
      </motion.p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {concepts.map((c, i) => {
          const isOpen = active === i;

          return (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 6) * 0.06, duration: 0.4 }}
              layout
              className={`group relative cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300 ${
                isOpen
                  ? "border-violet-500/30 bg-zinc-900 shadow-lg shadow-violet-600/5"
                  : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/60"
              }`}
              onClick={() => setActive(isOpen ? null : i)}
            >
              {/* Gradient accent */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${c.gradient} transition-opacity duration-300 ${
                  isOpen ? "opacity-100" : "opacity-50 group-hover:opacity-80"
                }`}
              />

              {/* Content */}
              <div className="relative z-10 p-5">
                {/* Header */}
                <div className="mb-3 flex items-start justify-between">
                  <span className="text-2xl">{c.icon}</span>
                  {/* Domains */}
                  <div className="flex flex-wrap gap-1.5">
                    {c.domains.map((d) => (
                      <span
                        key={d}
                        className="rounded-full bg-zinc-800/70 px-2 py-0.5 text-[10px] text-zinc-500"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Title & tagline */}
                <h3 className="mb-1 text-base font-bold tracking-tight text-zinc-100">
                  {c.title}
                </h3>
                <p className="text-xs font-medium text-violet-400/80">
                  {c.tagline}
                </p>

                {/* Description (always visible) */}
                <p
                  className={`mt-3 text-sm leading-relaxed transition-all duration-300 ${
                    isOpen
                      ? "text-zinc-300"
                      : "line-clamp-3 text-zinc-500"
                  }`}
                >
                  {c.idea}
                </p>

                {/* Expand indicator */}
                <div className="mt-3 text-[10px] text-zinc-600 transition-colors group-hover:text-zinc-500">
                  {isOpen ? "▲ contraer" : "▼ leer más"}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
