"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { SectionWrapper, SectionHeading } from "@/components/section-wrapper";
import { aboutHighlights } from "@/lib/data";

/** Desplaza el tiempo de inicio del video para que las cards no estén sincronizadas */
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
  const offsets = [0, 10, 20];
  useAsyncVideo(videoRef, offsets[index]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.12, duration: 0.5 }}
      className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 transition-all hover:border-zinc-700"
    >
      {/* Video background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        poster="/about-poster.jpg"
        className="absolute inset-0 h-full w-full object-cover opacity-30 transition-opacity group-hover:opacity-50"
      >
        <source src="/about-bg.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/80 via-zinc-950/60 to-zinc-950/80" />

      {/* Content */}
      <div className="relative z-10">
        <span className="mb-4 block text-4xl">{icon}</span>
        <h3 className="mb-3 text-xl font-bold tracking-tight">{title}</h3>
        <p className="text-sm leading-relaxed text-zinc-400">{desc}</p>
      </div>
    </motion.div>
  );
}

export function About() {
  return (
    <SectionWrapper id="quien-soy">
      <SectionHeading label="Quién soy" title="Ignacio Estevez — jistev" />

      <div className="mx-auto mb-14 max-w-3xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-base leading-relaxed text-zinc-400"
        >
          Soy director técnico y desarrollador full-stack. Mi diferencial no es
          que sepa programar — es que soy igual de cómodo imaginando el concepto
          que liderando el proyecto que escribiendo el código. No hay brecha
          entre lo que concibo y lo que entrego.
        </motion.p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        {aboutHighlights.map((h, i) => (
          <HighlightCard key={h.title} {...h} index={i} />
        ))}
      </div>

      {/* Tagline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
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
