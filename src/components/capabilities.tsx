"use client";

import { motion } from "framer-motion";
import { SectionWrapper, SectionHeading } from "@/components/section-wrapper";
import { capabilities } from "@/lib/data";
import { useState } from "react";

const connectionLabels: Record<string, string> = {
  mvp: "⚡ MVP",
  automatizacion: "🤖 IA",
  ia: "🤖 IA",
  bots: "💬 Bots",
  seguridad: "🛡️ Seg.",
};

const philosophyCards = [
  {
    icon: "🧠",
    title: "Producto primero, tecnología después",
    desc: "No construyo por construir. Cada decisión técnica responde a un problema real del usuario. Menos framework, más producto.",
  },
  {
    icon: "🤖",
    title: "IA no es un add-on, es parte del ADN",
    desc: "Desde 2024 integro LLMs, RAG y automatización en cada producto que toco. No solo prompteo: construyo sistemas que aprenden.",
  },
  {
    icon: "🛡️",
    title: "Seguridad familiar como ecosistema",
    desc: "Escudo Digital, Sentinel y WARDEN comparten una visión: protección digital real para familias, sin comprometer la experiencia de uso.",
  },
];

function PhilosophyCard({
  icon,
  title,
  desc,
  index,
}: {
  icon: string;
  title: string;
  desc: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 transition-all hover:border-zinc-700"
    >
      <span className="mb-3 block text-2xl">{icon}</span>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-zinc-400">{desc}</p>
    </motion.div>
  );
}

function ServiceCard({
  cap,
  index,
  expanded,
  onToggle,
}: {
  cap: (typeof capabilities)[number];
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 transition-all hover:border-zinc-700"
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="flex w-full items-start gap-4 p-6 text-left"
      >
        <span className="mt-1 shrink-0 text-2xl">{cap.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-baseline justify-between gap-4">
            <h3 className="text-lg font-semibold">{cap.title}</h3>
            <span className="shrink-0 text-sm font-medium text-violet-400">
              {cap.price}
            </span>
          </div>

          {/* Conexiones */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {cap.connectsTo.map((c) => (
              <span
                key={c}
                className="rounded-full bg-zinc-800/60 px-2 py-0.5 text-[11px] text-zinc-500"
              >
                ← {connectionLabels[c] || c}
              </span>
            ))}
          </div>

          <p className="text-sm leading-relaxed text-zinc-300">
            {cap.approach}
          </p>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="overflow-hidden border-t border-zinc-800"
        >
          <div className="space-y-5 p-6 pt-5">
            <div>
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-violet-500">
                🎯 Ejemplo real
              </span>
              <p className="text-sm leading-relaxed text-zinc-400">
                {cap.example}
              </p>
              <span className="mt-1 block text-xs text-zinc-600">
                Proyecto: {cap.exampleProject}
              </span>
            </div>
            <div>
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-amber-500">
                💰 Por qué {cap.price}
              </span>
              <p className="text-sm leading-relaxed text-zinc-400">
                {cap.whyPrice}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {!expanded && (
        <div className="px-6 pb-4">
          <span className="text-xs text-zinc-600 transition-colors group-hover:text-zinc-500">
            ↓ Pulsa para ver ejemplo y detalle de precio
          </span>
        </div>
      )}
    </motion.div>
  );
}

export function Capabilities() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <SectionWrapper id="capacidades">
      <SectionHeading
        label="Capacidades"
        title="Cómo construyo productos que funcionan"
      />

      {/* Frase de entrada */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mx-auto mb-12 max-w-2xl text-center text-sm leading-relaxed text-zinc-400"
      >
        De la idea al código. Del código al deploy. Sin caos.
      </motion.p>

      {/* Filosofía — 3 cards */}
      <div className="mx-auto mb-14 grid max-w-3xl gap-4 sm:grid-cols-3">
        {philosophyCards.map((card, i) => (
          <PhilosophyCard key={card.title} {...card} index={i} />
        ))}
      </div>

      {/* Servicios expandibles */}
      <div className="mx-auto max-w-3xl space-y-4">
        {capabilities.map((cap, i) => (
          <ServiceCard
            key={cap.title}
            cap={cap}
            index={i}
            expanded={expandedIndex === i}
            onToggle={() =>
              setExpandedIndex(expandedIndex === i ? null : i)
            }
          />
        ))}
      </div>

      {/* Conexión final */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mx-auto mt-14 max-w-2xl rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 text-center"
      >
        <span className="mb-2 block text-lg">🧩</span>
        <p className="text-sm leading-relaxed text-zinc-400">
          Estas capacidades no funcionan en silos. La IA que desarrollo alimenta
          los bots y APIs que construyo. La seguridad familiar comparte motor
          con los MVPs que entrego. Cada proyecto nuevo se beneficia de lo que
          aprendí en el anterior — y eso se nota en la velocidad y calidad del
          resultado.
        </p>
      </motion.div>
    </SectionWrapper>
  );
}
