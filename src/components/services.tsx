"use client";

import { motion } from "framer-motion";
import { SectionWrapper, SectionHeading } from "@/components/section-wrapper";

const services = [
  {
    icon: "⚡",
    title: "MVP Factory",
    desc: "De idea a producto funcional en 1-2 semanas. Web apps, dashboards, prototipos full-stack.",
    price: "desde 1.000€",
  },
  {
    icon: "🤖",
    title: "Automatización con IA",
    desc: "Chatbots, GPTs custom, RAG sobre documentos, automatización de procesos con inteligencia artificial.",
    price: "desde 500€",
  },
  {
    icon: "🔄",
    title: "Automation Tools",
    desc: "Scripts Python, scraping, pipelines de datos, integración de APIs, reporting automático.",
    price: "desde 300€",
  },
  {
    icon: "💬",
    title: "Bots & APIs",
    desc: "Bots para Telegram/WhatsApp, APIs REST, webhooks, sistemas de notificaciones inteligentes.",
    price: "desde 400€",
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
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="rounded-[14px] border border-zinc-800 bg-[#11161d] p-6 transition-all hover:-translate-y-0.5 hover:border-violet-500/50"
          >
            <span className="mb-4 block text-3xl">{s.icon}</span>
            <h3 className="mb-2 text-lg font-semibold">{s.title}</h3>
            <p className="mb-4 flex-1 text-sm leading-relaxed text-zinc-400">
              {s.desc}
            </p>
            <span className="font-mono text-sm font-medium text-cyan-400">
              {s.price}
            </span>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}