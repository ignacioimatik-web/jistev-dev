"use client";

import { motion } from "framer-motion";
import { SectionWrapper, SectionHeading } from "@/components/section-wrapper";

const projects = [
  {
    title: "JazzOne Pipeline",
    desc: "Pipeline de música: frontend Next.js en Vercel + backend FastAPI/yt-dlp en NAS Synology vía Docker.",
    url: "https://github.com/ignacioimatik-web/jazzone-pipeline",
    bg: "/proj-bg/p1.jpg",
    tech: ["Next.js", "FastAPI", "yt-dlp", "Synology"],
  },
  {
    title: "ZBS Forcall",
    desc: "Gestión sanitaria del equipo de Atención Primaria de Forcall: guardias, libranzas, alertas y avisos con roles y RLS.",
    url: "https://github.com/ignacioimatik-web/ZBS-Forcall",
    bg: "/proj-bg/p2.jpg",
    tech: ["Next.js", "Supabase", "Auth + RLS"],
  },
  {
    title: "studioMo",
    desc: "Dashboard de monitor de sistema para Mac Studio + NAS Synology + UPS CyberPower, con charts en tiempo real.",
    url: "https://github.com/ignacioimatik-web/studioMo",
    bg: "/proj-bg/p3.jpg",
    tech: ["Next.js 16", "Recharts", "Tailwind"],
  },
  {
    title: "Escudo Digital",
    desc: "Operador de internet con protección digital en red. UI premium, protección de menores en 2 capas.",
    url: "https://github.com/ignacioimatik-web/escudo-digital-landing",
    bg: "/proj-bg/p4.jpg",
    tech: ["Next.js 16", "Tailwind 4", "Framer Motion"],
  },
  {
    title: "Huella Zero",
    desc: "App de privacidad digital: escáner de brechas, catálogo de servicios, checklist y dashboard.",
    url: "https://github.com/ignacioimatik-web/huellazero",
    bg: "/proj-bg/p5.jpg",
    tech: ["TypeScript", "Privacy", "Dashboard"],
  },
  {
    title: "ASP-10",
    desc: "Auditoría de Seguridad Pasiva para consultores presenciales: audita dominios y Android, aplica fixes e informes.",
    url: "https://github.com/ignacioimatik-web/ASP-10",
    bg: "/proj-bg/p6.jpg",
    tech: ["Next.js 16", "TypeScript", "Security"],
  },
  {
    title: "NovaTerm",
    desc: "Terminal SSH self-hosted estilo Termius: multi-ventana, SFTP y port forwarding sobre tu propia infraestructura.",
    url: "https://github.com/ignacioimatik-web/novaterm",
    bg: "/proj-bg/p7.jpg",
    tech: ["Next.js", "WebSocket", "SFTP", "SQLite"],
  },
  {
    title: "AstroLab",
    desc: "Pipeline IA de astrofotografía: denoising, eliminación de estrellas y deconvolución para cielo profundo.",
    url: "https://github.com/ignacioimatik-web/astrolab",
    bg: "/proj-bg/p8.jpg",
    tech: ["Python", "PyTorch", "Astropy", "MPS"],
  },
];

export function Projects() {
  return (
    <SectionWrapper id="proyectos">
      <SectionHeading label="proyectos" title="Trabajo reciente." />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {projects.map((p, i) => (
          <motion.a
            key={p.title}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            className="group relative flex min-h-[190px] flex-col justify-end overflow-hidden rounded-[14px] border border-zinc-800 bg-[#11161d] p-5 transition-all hover:-translate-y-0.5 hover:border-cyan-400/40"
          >
            <img
              src={p.bg}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-35 transition-opacity duration-300 group-hover:opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d10] via-[#0b0d10]/80 to-[#0b0d10]/30" />

            <span className="relative z-10 font-mono text-[11px] text-cyan-400">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="relative z-10 mt-2 text-base font-semibold">
              {p.title}
            </h3>
            <p className="relative z-10 mt-1.5 flex-1 text-[13px] leading-relaxed text-zinc-400">
              {p.desc}
            </p>
            <div className="relative z-10 mt-3 flex flex-wrap gap-1.5">
              {p.tech.map((t) => (
                <span
                  key={t}
                  className="rounded-[6px] border border-zinc-700 bg-white/[0.02] px-2 py-0.5 font-mono text-[10.5px] text-[#9fb0c3]"
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.a>
        ))}
      </div>
    </SectionWrapper>
  );
}