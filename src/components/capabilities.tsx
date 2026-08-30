"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Layers,
  BrainCircuit,
  Workflow,
  Globe,
  type LucideIcon,
} from "lucide-react";
import { EASE_OUT } from "@/lib/motion";
import { SectionWrapper, SectionHeading } from "@/components/section-wrapper";

// Iconos premium contextuales de lucide-react (en vez de emojis)
const capIcons: LucideIcon[] = [Target, Layers, BrainCircuit, Workflow, Globe];
const capIconSizes = ["h-5 w-5", "h-5 w-5", "h-5 w-5", "h-5 w-5", "h-5 w-5"];

const capabilities = [
  {
    title: "Dirección de Producto",
    tagline: "De la idea al roadmap",
    desc: "Defino la visión, priorizo las funcionalidades, y trazo el camino desde el concepto hasta el lanzamiento. Sin caos ni sobreingeniería: solo lo que hace falta para que el producto resuelva el problema real.",
    details: [
      "Definición de producto desde la necesidad real",
      "Roadmap priorizado por impacto",
      "Coordinación técnica integral (frontend, backend, IA, infra)",
      "Decisiones que equilibran velocidad, calidad y coste",
    ],
  },
  {
    title: "Arquitectura Full-Stack",
    tagline: "Diseño y ejecuto sistemas completos",
    desc: "Diseño la arquitectura y construyo cada capa. Frontend, backend, APIs, base de datos, despliegue. No hay 'eso lo hace otro' — entiendo y ejecuto todo el stack.",
    details: [
      "Frontend: Next.js, React, TypeScript, animaciones",
      "Backend: Python, FastAPI, Node.js, APIs REST",
      "Infraestructura: Docker, NAS, Vercel, túneles seguros",
      "Bases de datos: PostgreSQL, Supabase, SQLite, ChromaDB",
    ],
  },
  {
    title: "IA en Producción",
    tagline: "No demos. Sistemas que funcionan.",
    desc: "Integro LLMs, RAG, Whisper y automatización en productos reales. El reto no es conectar un modelo — es hacer que sea fiable, que no alucine cuando no debe, y que mejore con el uso.",
    details: [
      "LLMs: OpenAI, DeepSeek, Claude, modelos locales",
      "RAG sobre documentos con ChromaDB + embeddings NVIDIA",
      "Transcripción Whisper acelerada por Apple Silicon",
      "Control de alucinaciones, validación y testing de fiabilidad",
    ],
  },
  {
    title: "Automatización Inteligente",
    tagline: "Lo que se ejecuta solo, funciona siempre",
    desc: "Pipelines, scraping, bots, procesamiento de datos, integración de APIs. Herramientas que eliminan tareas repetitivas y funcionan sin supervisión 24/7.",
    details: [
      "Pipelines de datos: ingestión, transformación, enriquecimiento",
      "Bots para Telegram, WhatsApp, Slack con IA contextual",
      "Scraping multi-tienda con Playwright + análisis IA",
      "Servicios persistentes con logging, reintentos y monitoreo",
    ],
  },
  {
    title: "Ecosistemas Híbridos",
    tagline: "Cloud + on-prem, sin fricción",
    desc: "Diseño sistemas que cruzan la frontera entre cloud y tu propio hardware. Frontend en Vercel, backend en un NAS en casa, túneles Cloudflare para acceso seguro. Lo mejor de ambos mundos.",
    details: [
      "Arquitecturas cloud + NAS + Docker",
      "Túneles Cloudflare para acceso remoto seguro",
      "Backups, RAID, UPS monitoring",
      "CI/CD y despliegue automatizado",
    ],
  },
];

export function Capabilities() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <SectionWrapper id="capacidades">
      <SectionHeading label="capacidades" title="Lo que ofrezco como director técnico." />

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.1, ease: EASE_OUT }}
        className="mx-auto mb-14 max-w-3xl text-center text-sm leading-relaxed text-zinc-400"
      >
        No vendo horas. Vendo capacidad de imaginar, liderar y construir.
        Desde la visión del producto hasta la última línea de código.
      </motion.p>

      <div className="mx-auto max-w-3xl space-y-3.5">
        {capabilities.map((cap, i) => {
          const isOpen = expanded === i;

          return (
            <motion.div
              key={cap.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.35, ease: EASE_OUT }}
              className={`overflow-hidden rounded-[14px] border transition-colors duration-300 ${
                isOpen
                  ? "border-violet-500/30 bg-[#11161d]"
                  : "border-zinc-800 bg-[#11161d]/70 hover:border-zinc-700"
              }`}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : i)}
                className="w-full p-6 text-left"
              >
                <div className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-zinc-700/60 bg-zinc-800/40 text-violet-400">
                    {(() => {
                      const Icon = capIcons[i];
                      return <Icon className={capIconSizes[i]} strokeWidth={1.75} />;
                    })()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-baseline justify-between gap-4">
                      <h3 className="text-lg font-semibold">{cap.title}</h3>
                      <span className="shrink-0 font-mono text-xs text-zinc-600">
                        {isOpen ? "▲" : "▼"}
                      </span>
                    </div>
                    <p className="font-mono text-xs font-medium text-cyan-400">
                      {"$ "}
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
                    transition={{ duration: 0.28, ease: EASE_OUT }}
                    className="overflow-hidden border-t border-zinc-800"
                  >
                    <div className="space-y-2.5 p-6 pt-5">
                      {cap.details.map((detail) => (
                        <div
                          key={detail}
                          className="flex items-start gap-3 text-sm text-zinc-400"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400/50" />
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
        transition={{ duration: 0.4, delay: 0.3, ease: EASE_OUT }}
        className="mx-auto mt-14 max-w-2xl rounded-xl border border-zinc-800 bg-[#11161d]/70 p-5 text-center"
      >
        <span className="mb-2 flex items-center justify-center text-violet-400">
          <Target className="h-6 w-6" strokeWidth={1.75} />
        </span>
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