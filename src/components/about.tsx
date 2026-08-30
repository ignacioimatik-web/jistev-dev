"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { EASE_OUT } from "@/lib/motion";
import { SectionWrapper, SectionHeading } from "@/components/section-wrapper";
import { aboutHighlights } from "@/lib/data";

const highlights = [
  {
    img: "/about-zenit/fullstack.jpg",
    title: "Full-Stack por naturaleza",
    desc: "No solo maqueto  -  construyo sistemas completos. Frontend, backend, APIs, infraestructura.",
    tipTitle: "full-stack",
    tipBody: `Asumo el producto entero de punta a punta: interfaz, lógica de negocio, APIs, base de datos y despliegue. Me muevo entre capas con el mismo criterio, sin silos de equipo: si necesitas un dashboard, una API y un proceso batch, lo construyo y lo conecto yo mismo con una única fuente de verdad.`,
    tags: ["Next.js", "FastAPI", "PostgreSQL", "Docker", "REST"],
  },
  {
    img: "/about-zenit/delivery.jpg",
    title: "Delivery-focused",
    desc: "De la idea al MVP funcional en semanas. Código limpio, pragmático, sin sobreingeniería.",
    tipTitle: "delivery",
    tipBody: `Mi unidad de tiempo es la entrega, no el perfeccionismo. Un MVP funcional y validable en 1-2 semanas, con el que puedes enseñar la idea a usuarios reales. Despliego temprano, aunque sea pequeño: mejor un sistema simple en producción que una arquitectura elegante que nadie usa.`,
    tags: ["MVP", "2 semanas", "agile", "iteración"],
  },
  {
    img: "/about-zenit/ia.jpg",
    title: "IA en producción",
    desc: "No solo prompteo. Integro LLMs, RAG, automatizaciones y bots en productos reales.",
    tipTitle: "ia+prod",
    tipBody: `Integro LLMs y RAG dentro de productos reales que soportan tráfico real, no demos de laboratorio. Me ocupo del detalle que la demo no muestra: control de costes por llamada, límites y fallbacks cuando el modelo falla, y datos que quedan donde deben. IA que un negocio puede usar sin estar pendiente de que se rompa.`,
    tags: ["LLMs", "RAG", "LangChain", "Bots", "MLOps"],
  },
  {
    img: "/about-zenit/stack.jpg",
    title: "Stack moderno",
    desc: "Next.js, TypeScript, shadcn/ui, Framer Motion, Python, FastAPI, Docker.",
    tipTitle: "stack",
    tipBody: `Tecnologías actuales y mantenibles, elegidas porque tu producto debe durar y evolucionar, no porque estén de moda. Frontend con Next.js + TypeScript + Tailwind 4 + shadcn/ui y Framer Motion. Backend con Python/FastAPI o Node, y Docker para despliegues reproducibles. Un stack que escala contigo: cuando tu MVP crece te encuentras una base sólida, no un prototipo imposible de tocar.`,
    tags: ["Next.js", "TypeScript", "Tailwind", "shadcn/ui", "Python"],
  },
];

export function About() {
  return (
    <SectionWrapper id="about">
      <SectionHeading label="sobre-mi" title="De la idea al producto." />

      <div className="mb-12 max-w-2xl text-left">
        <p className="text-lg leading-relaxed text-zinc-400">
          Me muevo cómodo entre frontend y backend. Código limpio, decisiones
          pragmáticas y desde 2024 IA en cada proyecto.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {highlights.map((h, i) => (
          <motion.div
            key={h.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.35, ease: EASE_OUT }}
            className="group relative min-h-[220px] rounded-[14px] border border-line bg-card/60 transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-orange-500/50"
            data-title={h.tipTitle}
            data-body={h.tipBody}
            data-tags={h.tags.join(", ")}
          >
            <div className="absolute inset-0 overflow-hidden rounded-[14px]">
              <img
                src={h.img}
                alt={h.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-40 transition-opacity duration-300 group-hover:opacity-55"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/25" />
            </div>
            <div className="relative z-10 flex h-full min-h-[220px] flex-col justify-end p-6">
              <h3 className="mb-2 text-lg font-semibold">{h.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-400">{h.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tagline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.3, ease: EASE_OUT }}
        className="mx-auto mt-14 max-w-2xl rounded-xl border border-line bg-card/50 p-5 text-center"
      >
        <p className="text-sm leading-relaxed text-zinc-500">
          No pego APIs sin entender el negocio. No dirijo equipos sin saber
          escribir el código. No imagino productos que no pueda construir.
          Esa es la diferencia.
        </p>
      </motion.div>
    </SectionWrapper>
  );
}