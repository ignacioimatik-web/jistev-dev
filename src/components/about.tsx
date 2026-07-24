"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { SectionWrapper, SectionHeading } from "@/components/section-wrapper";

const highlights = [
  {
    icon: "🧠",
    title: "Full-Stack por naturaleza",
    desc: "No solo maqueto — construyo sistemas completos. Frontend, backend, APIs, infraestructura. Si tiene que funcionar, me encargo.",
  },
  {
    icon: "🎯",
    title: "Delivery-focused",
    desc: "De la idea al MVP funcional en semanas. Código limpio, decisiones pragmáticas, sin sobreingeniería.",
  },
  {
    icon: "🤖",
    title: "IA en producción",
    desc: "No solo prompteo. Integro LLMs, RAG, automatizaciones y bots en productos reales que resuelven problemas.",
  },
  {
    icon: "🔧",
    title: "Stack moderno",
    desc: "Next.js, TypeScript, shadcn/ui, Framer Motion, Python, FastAPI, Docker — herramientas modernas para resultados sólidos.",
  },
];

/** Desplaza el tiempo de inicio del video para que las 4 cards no estén sincronizadas */
function useAsyncVideo(ref: React.RefObject<HTMLVideoElement | null>, offset: number) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = () => {
      el.currentTime = offset;
    };
    el.addEventListener("loadedmetadata", handler, { once: true });
    return () => el.removeEventListener("loadedmetadata", handler);
  }, [ref, offset]);
}

function HighlightCard({
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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const offsets = [0, 7.5, 15, 22.5]; // ~30s clip dividido en 4
  useAsyncVideo(videoRef, offsets[index]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 transition-all hover:border-zinc-700"
    >
      {/* Video background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        poster="/about-poster.jpg"
        className="absolute inset-0 h-full w-full object-cover opacity-40 transition-opacity group-hover:opacity-60"
      >
        <source src="/about-bg.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/80 via-zinc-950/60 to-zinc-950/80" />

      {/* Content */}
      <div className="relative z-10">
        <span className="mb-3 block text-2xl">{icon}</span>
        <h3 className="mb-2 font-semibold">{title}</h3>
        <p className="text-sm leading-relaxed text-zinc-400">{desc}</p>
      </div>
    </motion.div>
  );
}

export function About() {
  return (
    <SectionWrapper id="about">
      <SectionHeading label="Sobre mí" title="Ignacio Estevez — jistev" />

      <div className="mx-auto mb-12 max-w-2xl text-center">
        <p className="text-lg leading-relaxed text-zinc-400">
          Soy desarrollador full-stack especializado en construir productos
          digitales desde cero. Me muevo cómodo entre el frontend y el backend,
          y desde 2024 integro IA en cada proyecto que toco.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {highlights.map((h, i) => (
          <HighlightCard key={h.title} {...h} index={i} />
        ))}
      </div>
    </SectionWrapper>
  );
}
