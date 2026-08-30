"use client";

import { motion } from "framer-motion";
import { SectionWrapper, SectionHeading } from "@/components/section-wrapper";
import { EASE_OUT } from "@/lib/motion";

const services = [
  {
    title: "MVP Factory",
    desc: "De idea a producto funcional en 1-2 semanas. Web apps, dashboards, prototipos full-stack.",
    price: "desde 1.000€",
    bg: "/svc-bg/mvp.jpg",
  },
  {
    title: "Automatización con IA",
    desc: "Chatbots, GPTs custom, RAG sobre documentos, automatización de procesos con inteligencia artificial.",
    price: "desde 500€",
    bg: "/svc-bg/ia.jpg",
  },
  {
    title: "Automation Tools",
    desc: "Scripts Python, scraping, pipelines de datos, integración de APIs, reporting automático.",
    price: "desde 300€",
    bg: "/svc-bg/tools.jpg",
  },
  {
    title: "Bots & APIs",
    desc: "Bots para Telegram/WhatsApp, APIs REST, webhooks, sistemas de notificaciones inteligentes.",
    price: "desde 400€",
    bg: "/svc-bg/bots.jpg",
  },
];

export function Services() {
  return (
    <SectionWrapper id="servicios">
      <SectionHeading label="servicios" title="Lo que puedo hacer por ti." />

      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.35, ease: EASE_OUT }}
            className="group relative min-h-[220px] overflow-hidden rounded-[14px] border border-line bg-card p-6 transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-orange-500/50"
          >
            <img
              src={s.bg}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-30 transition-opacity duration-300 group-hover:opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/65" />

            <div className="relative z-10 flex h-full min-h-[188px] flex-col justify-end">
              <h3 className="mb-2 text-lg font-semibold">{s.title}</h3>
              <p className="mb-4 flex-1 text-sm leading-relaxed text-zinc-400">
                {s.desc}
              </p>
              <span className="font-mono text-sm font-medium text-cyan-400">
                {s.price}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}