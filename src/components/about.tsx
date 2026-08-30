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
    tipBody: `Asumo el producto entero de punta a punta: interfaz, lógica de negocio, APIs, base de datos y despliegue. Trabajo por igual en frontend y backend, sin delegar lo esencial a terceros.
Me muevo entre capas con el mismo criterio: el contrato de la API, el modelo de datos y el diseño de la UI se piensan como un solo sistema. Eso elimina los típicos silos de equipo y acelera el ciclo idea→producción.
En la práctica eso significa que si tu proyecto necesita un dashboard web, una API pública y un proceso batch, lo construyo y lo conecto yo mismo, con una única fuente de verdad y un despliegue reproducible.`,
    tags: ["Next.js", "FastAPI", "PostgreSQL", "Docker", "REST"],
  },
  {
    img: "/about-zenit/delivery.jpg",
    title: "Delivery-focused",
    desc: "De la idea al MVP funcional en semanas. Código limpio, pragmático, sin sobreingeniería.",
    tipTitle: "delivery",
    tipBody: `Mi unidad de tiempo es la entrega, no el perfeccionismo. Un MVP funcional y validable en 1-2 semanas, con el que puedes enseñar la idea a usuarios reales y recoger feedback de inmediato.
Empiezo por el núcleo que genera valor y despliego temprano, aunque sea pequeño: mejor un sistema simple funcionando en producción que una arquitectura elegante que nadie usa.
Cada iteración añade lo que la realidad te pide (no lo que yo imagino). Decisiones pragmáticas y código limpio, recortando sobreingeniería y todo lo que no aporta a tus objetivos medibles.`,
    tags: ["MVP", "2 semanas", "agile", "iteración"],
  },
  {
    img: "/about-zenit/ia.jpg",
    title: "IA en producción",
    desc: "No solo prompteo. Integro LLMs, RAG, automatizaciones y bots en productos reales.",
    tipTitle: "ia+prod",
    tipBody: `La IA no es aquí un prompt de laboratorio ni una demo: la integro dentro de productos reales que soportan tráfico real.
Integro modelos de lenguaje (GPT y open-source), RAG sobre tus propios documentos, automatización de procesos, y bots para Telegram/WhatsApp que funcionan 24/7.
Me ocupo del detalle que la demo no muestra: control de costes por llamada, límites y fallbacks cuando el modelo falla, latencia, y datos que quedan donde deben. Es decir, IA que un negocio puede usar sin estar pendiente de que se rompa.`,
    tags: ["LLMs", "RAG", "LangChain", "Bots", "MLOps"],
  },
  {
    img: "/about-zenit/stack.jpg",
    title: "Stack moderno",
    desc: "Next.js, TypeScript, shadcn/ui, Framer Motion, Python, FastAPI, Docker.",
    tipTitle: "stack",
    tipBody: `Tecnologías actuales y mantenibles, elegidas porque tu producto debe durar y evolucionar, no porque estén de moda.
Frontend con Next.js + TypeScript + Tailwind 4 + shadcn/ui y animaciones con Framer Motion. Backend con Python/FastAPI o Node, y Docker para que el despliegue sea reproducible en cualquier entorno.
Es un stack que escala contigo: cuando tu MVP crece no te encuentras con un prototipo imposible de tocar, sino con una base sólida y documentada que un equipo futuro puede mantener.`,
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
            className="group relative min-h-[220px] rounded-[14px] border border-zinc-800 bg-zinc-900/40 transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-violet-500/50"
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
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d10] via-[#0b0d10]/70 to-[#0b0d10]/25" />
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
        className="mx-auto mt-14 max-w-2xl rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 text-center"
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