"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionWrapper, SectionHeading } from "@/components/section-wrapper";
import { capabilities } from "@/lib/data";

export function Capabilities() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <SectionWrapper id="capacidades">
      <SectionHeading
        label="Capacidades"
        title="Lo que ofrezco como director técnico"
      />

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mx-auto mb-14 max-w-3xl text-center text-sm leading-relaxed text-zinc-400"
      >
        No vendo horas. Vendo capacidad de imaginar, liderar y construir.
        Desde la visión del producto hasta la última línea de código.
      </motion.p>

      <div className="mx-auto max-w-3xl space-y-4">
        {capabilities.map((cap, i) => {
          const isOpen = expanded === i;

          return (
            <motion.div
              key={cap.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`group overflow-hidden rounded-2xl border transition-all duration-300 ${
                isOpen
                  ? "border-violet-500/20 bg-zinc-900/60"
                  : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"
              }`}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : i)}
                className="w-full p-6 text-left"
              >
                <div className="flex items-start gap-4">
                  <span className="mt-0.5 shrink-0 text-2xl">{cap.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-baseline justify-between gap-4">
                      <h3 className="text-lg font-semibold">{cap.title}</h3>
                      <span className="shrink-0 text-xs text-zinc-600">
                        {isOpen ? "▲" : "▼"}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-violet-400/80">
                      {cap.tagline}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                      {cap.desc}
                    </p>
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="overflow-hidden border-t border-zinc-800"
                  >
                    <div className="space-y-2.5 p-6 pt-5">
                      {cap.details.map((detail) => (
                        <div
                          key={detail}
                          className="flex items-start gap-3 text-sm text-zinc-400"
                        >
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500/40" />
                          {detail}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Closing note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mx-auto mt-14 max-w-2xl rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 text-center"
      >
        <span className="mb-2 block text-lg">🎯</span>
        <p className="text-sm leading-relaxed text-zinc-400">
          Estas capacidades no son compartimentos estancos. La IA que desarrollo
          alimenta las automatizaciones que construyo. La arquitectura híbrida
          que diseño soporta los productos que lidero. Cada proyecto nuevo se
          beneficia de todo lo que aprendí en el anterior.
        </p>
      </motion.div>
    </SectionWrapper>
  );
}
