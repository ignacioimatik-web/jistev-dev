"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionWrapper, SectionHeading } from "@/components/section-wrapper";
import { EASE_OUT } from "@/lib/motion";

const concepts = [
  {
    icon: "🎵", title: "JazzOne Pipeline", tagline: "Tu música, sin suscripciones, sin esfuerzo",
    idea: "Pipeline de música: pega una URL de YouTube y el backend descarga, organiza e inyecta la música en tu biblioteca personal. Frontend Next.js en Vercel + backend FastAPI/yt-dlp en NAS Synology vía Docker. Arquitectura híbrida cloud + on-prem.",
    domains: ["Next.js", "FastAPI", "yt-dlp", "Synology"], repo: "https://github.com/ignacioimatik-web/jazzone-pipeline",
    bg: "/proj-bg/p1.jpg",
    ring: "border-rose-500/30",
  },
  {
    icon: "🏥", title: "ZBS Forcall", tagline: "Gestión sanitaria para atención primaria rural",
    idea: "Plataforma web de gestión del equipo de Atención Primaria de Forcall (Castellón): guardias, libranzas, doblas, reuniones, alertas y avisos del personal médico y de enfermería. Autenticación segura con Supabase Auth y Row Level Security por rol.",
    domains: ["Next.js", "Supabase", "Auth + RLS"], repo: "https://github.com/ignacioimatik-web/ZBS-Forcall",
    bg: "/proj-bg/p2.jpg",
    ring: "border-violet-500/30",
  },
  {
    icon: "📊", title: "studioMo", tagline: "El dashboard que toda oficina en casa debería tener",
    idea: "Dashboard de monitor de sistema para Mac Studio + Synology NAS + UPS CyberPower. CPU, RAM, discos, red, procesos, RAID y batería centralizados en gráficos en tiempo real. La herramienta que cualquier creador con infraestructura en casa necesita para dormir tranquilo.",
    domains: ["Next.js 16", "Recharts", "Tailwind"], repo: "https://github.com/ignacioimatik-web/studioMo",
    bg: "/proj-bg/p3.jpg",
    ring: "border-cyan-500/30",
  },
  {
    icon: "🛡️", title: "Escudo Digital Familiar", tagline: "Protección infantil en 2 capas",
    idea: "Operador de internet con protección digital integrada. Protección de menores en 2 capas: DNS de protección + control parental, con configurador guiado paso a paso para cualquier familia, adaptado a cada dispositivo y a la edad de los hijos. UI premium.",
    domains: ["Next.js 16", "Tailwind 4", "Framer Motion"], repo: "https://github.com/ignacioimatik-web/escudo-digital-landing",
    bg: "/proj-bg/p4.jpg",
    ring: "border-sky-500/30",
  },
  {
    icon: "🛡️", title: "HuellaZero", tagline: "Recuperar tu huella digital",
    idea: "App de privacidad digital: escáner de brechas, catálogo de servicios, checklist y dashboard. Escanea tu exposición online y automatiza el borrado con métodos progresivos, con una puntuación de privacidad para que cualquiera recupere el control de sus datos.",
    domains: ["TypeScript", "Privacy", "Dashboard"], repo: "https://github.com/ignacioimatik-web/huellazero",
    bg: "/proj-bg/p5.jpg",
    ring: "border-emerald-500/30",
  },
  {
    icon: "🔐", title: "ASP-10", tagline: "Auditoría de seguridad pasiva para consultores",
    idea: "Herramienta profesional de auditoría de seguridad para intervenciones presenciales. Conecta el MacBook, audita dominios web y dispositivos Android, aplica fixes con un clic y genera presupuestos e informes profesionales.",
    domains: ["Next.js 16", "TypeScript", "Security"], repo: "https://github.com/ignacioimatik-web/ASP-10",
    bg: "/proj-bg/p6.jpg",
    ring: "border-red-500/30",
  },
  {
    icon: "🖥️", title: "NovaTerm", tagline: "Terminal SSH self-hosted, estilo Termius",
    idea: "Terminal SSH self-hosted, sin nube ajena. Multi-ventana con túnel WebSocket, SFTP integrado y port forwarding (local, remoto, SOCKS5). Tus hosts, claves y sesiones viven en tu propia infraestructura, con layout persistente.",
    domains: ["Next.js", "WebSocket", "SFTP", "SQLite"], repo: "https://github.com/ignacioimatik-web/novaterm",
    bg: "/proj-bg/p7.jpg",
    ring: "border-blue-500/30",
  },
  {
    icon: "🔭", title: "AstroLab", tagline: "El RC-Astro casero",
    idea: "Pipeline IA de astrofotografía: denoising, eliminación de estrellas y deconvolución para cielo profundo. Pensado para el flujo del aficionado (Nikon D610 + NexStar 6 SE, cielos Bortle 2-3). 25 subs + denoise IA superan a 100 subs crudos: el procesado gana a 4× más tiempo de integración.",
    domains: ["Python", "PyTorch", "Astropy", "MPS"], repo: "https://github.com/ignacioimatik-web/astrolab",
    bg: "/proj-bg/p8.jpg",
    ring: "border-amber-500/30",
  },
];

export function Concepts() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <SectionWrapper id="conceptos">
      <SectionHeading label="conceptos" title="Ideas que he concebido y liderado." />

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.1, ease: EASE_OUT }}
        className="mx-auto mb-14 max-w-3xl text-center text-sm leading-relaxed text-zinc-400"
      >
        No construyo proyectos porque sí. Cada idea nace de un problema real que
        identifico, un concepto original que diseño y un sistema que lidero hasta
        que funciona. Esto es lo que he imaginado.
      </motion.p>

      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {concepts.map((c, i) => {
          const isOpen = active === i;
          return (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 6) * 0.05, duration: 0.35, ease: EASE_OUT }}
              layout
              onClick={() => setActive(isOpen ? null : i)}
              className={`group relative min-h-[210px] cursor-pointer overflow-hidden rounded-[14px] border p-5 transition-[transform,border-color] duration-200 ${
                isOpen ? c.ring : "border-zinc-800 hover:border-zinc-600"
              }`}
            >
              <img
                src={c.bg}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-25 transition-opacity duration-300 group-hover:opacity-35"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d10] via-[#0b0d10]/85 to-[#0b0d10]/60" />
              <div className="relative z-10">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {c.domains.map((d) => (
                      <span
                        key={d}
                        className="rounded-full border border-zinc-700/60 bg-zinc-800/40 px-2 py-0.5 font-mono text-[10px] text-zinc-500"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
                <h3 className="mb-0.5 text-base font-bold tracking-tight text-zinc-100">
                  {c.title}
                </h3>
                <p className="font-mono text-xs font-medium text-cyan-400">
                  {"$ "}
                  {c.tagline}
                </p>
                <p
                  className={`mt-3 text-sm leading-relaxed transition-[color] duration-200 ${
                    isOpen ? "text-zinc-300" : "line-clamp-3 text-zinc-500"
                  }`}
                >
                  {c.idea}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-zinc-600 transition-colors group-hover:text-zinc-500">
                    {isOpen ? "▲ contraer" : "▼ leer más"}
                  </span>
                  {isOpen && (
                    <a
                      href={c.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-[6px] border border-zinc-700 px-3 py-1 font-mono text-[11px] text-zinc-300 transition-colors hover:border-cyan-400 hover:text-cyan-400"
                    >
                      repo ↗
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}