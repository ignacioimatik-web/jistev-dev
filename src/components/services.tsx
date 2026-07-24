"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { SectionWrapper, SectionHeading } from "@/components/section-wrapper";
import { services } from "@/lib/data";

function useAsyncVideo(ref: React.RefObject<HTMLVideoElement | null>, offset: number) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = () => { el.currentTime = offset; };
    el.addEventListener("loadedmetadata", handler, { once: true });
    return () => el.removeEventListener("loadedmetadata", handler);
  }, [ref, offset]);
}

function ServiceCard({
  icon,
  title,
  desc,
  price,
  index,
}: {
  icon: string;
  title: string;
  desc: string;
  price: string;
  index: number;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const offsets = [0, 7.5, 15, 22.5];
  useAsyncVideo(videoRef, offsets[index]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-zinc-700"
    >
      {/* Video background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        poster="/services-poster.jpg"
        className="absolute inset-0 h-full w-full object-cover opacity-30 transition-opacity group-hover:opacity-50"
      >
        <source src="/services-bg.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/85 via-zinc-950/65 to-zinc-950/85" />

      {/* Content */}
      <div className="relative z-10">
        <motion.span
          whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
          className="mb-4 block text-3xl"
        >
          {icon}
        </motion.span>
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="mb-4 text-sm leading-relaxed text-zinc-400">{desc}</p>
        <span className="text-sm font-medium text-violet-400">{price}</span>
      </div>
    </motion.div>
  );
}

export function Services() {
  return (
    <SectionWrapper id="servicios">
      <SectionHeading label="Servicios" title="Lo que puedo hacer por ti" />

      <div className="grid gap-6 sm:grid-cols-2">
        {services.map((s, i) => (
          <ServiceCard key={s.title} {...s} index={i} />
        ))}
      </div>
    </SectionWrapper>
  );
}
