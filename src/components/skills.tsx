"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionWrapper, SectionHeading } from "@/components/section-wrapper";

const skills = [
  {
    name: "Next.js",
    icon: "▲",
    tags: "ZBS Forcall, studioMo, Escudo Digital, NovaTerm, ASP-10, JazzOne",
    body: "Mi framework principal de frontend. En casi todos mis proyectos: el dashboard médico de ZBS Forcall, el monitor studioMo, la plataforma Escudo Digital, el terminal NovaTerm, la auditoría ASP-10 y el frontend del pipeline JazzOne.",
  },
  {
    name: "Python",
    icon: "🐍",
    tags: "AstroLab, JazzOne backend, bots",
    body: "Mi lenguaje de backend y datos. Lo uso en AstroLab para el pipeline de astrofotografía (denoise, starless, deconvolución) y en el backend de servicios y automatizaciones.",
  },
  {
    name: "FastAPI",
    icon: "⚡",
    tags: "JazzOne Pipeline",
    body: "Backend moderno y rápido. Es el motor del pipeline JazzOne: 18 endpoints REST que sirven a la SPA desde el NAS Synology vía Docker.",
  },
  {
    name: "Node.js",
    icon: "🟢",
    tags: "studioMo, Novaterm",
    body: "JavaScript del lado servidor. Impulsa el colector de studioMo y la capa de tiempo real de NovaTerm.",
  },
  {
    name: "Docker",
    icon: "🐳",
    tags: "JazzOne Pipeline, Escudo Digital",
    body: "Contenedores para despliegue reproducible. Lleva el pipeline JazzOne al NAS Synology y las infraestructuras de Escudo Digital.",
  },
  {
    name: "OpenAI / GPT",
    icon: "🤖",
    tags: "Telegram AI Bot, RAG",
    body: "Modelos de lenguaje en productos reales. El bot de Telegram con GPT y los sistemas de respuesta contextual y RAG sobre documentos.",
  },
  {
    name: "RAG",
    icon: "📚",
    tags: "Chatbots, búsqueda contextual",
    body: "Recuperación aumentada sobre tus propios documentos: el modelo responde usando tu información, no solo su base general. Base de mis asistentes y bots.",
  },
  {
    name: "REST APIs",
    icon: "🔗",
    tags: "ZBS Forcall, JazzOne, iberia-meteo",
    body: "APIs limpias y documentadas. Conectan el backend de ZBS Forcall, el pipeline JazzOne y las fuentes de datos de iberia-meteo.",
  },
  {
    name: "PostgreSQL",
    icon: "🐘",
    tags: "ZBS Forcall, Supabase",
    body: "Base de datos relacional con Row Level Security. Gestiona el acceso por roles del sistema sanitario de ZBS Forcall.",
  },
  {
    name: "Vercel",
    icon: "▲",
    tags: "jistev.dev, studioMo, Escudo",
    body: "Mi plataforma de despliegue principal. Tu sitio jistev.dev, studioMo y Escudo Digital corren en Vercel con auto-deploy desde git.",
  },
];

const categories = [
  { key: "all", label: "Todo" },
  { key: "frontend", label: "Frontend" },
  { key: "backend", label: "Backend" },
  { key: "ai", label: "IA & Bots" },
  { key: "devops", label: "DevOps" },
  { key: "database", label: "DB" },
] as const;

type CategoryKey = (typeof categories)[number]["key"];

// mantener el filtrado por categoría del original: mapa tecnología -> categoría
const catMap: Record<string, CategoryKey> = {
  "Next.js": "frontend",
  Python: "backend",
  FastAPI: "backend",
  "Node.js": "backend",
  Docker: "devops",
  "OpenAI / GPT": "ai",
  RAG: "ai",
  "REST APIs": "backend",
  PostgreSQL: "database",
  Vercel: "devops",
};

export function Skills() {
  const [active, setActive] = useState<CategoryKey>("all");
  const filtered =
    active === "all" ? skills : skills.filter((s) => catMap[s.name] === active);

  return (
    <SectionWrapper id="skills">
      <SectionHeading label="stack" title="Tecnologías de uso diario." />

      {/* Filters */}
      <div className="mb-10 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActive(cat.key)}
            className={
              active === cat.key
                ? "rounded-full bg-orange-600 px-4 py-1.5 text-xs font-medium text-white"
                : "rounded-full bg-zinc-800/50 px-4 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
            }
          >
            {cat.label}
          </button>
        ))}
      </div>

      <motion.div layout className="flex flex-wrap gap-3">
        {filtered.map((skill) => (
          <motion.span
            key={skill.name}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="inline-flex cursor-pointer items-center gap-2 rounded-[10px] border border-zinc-800 bg-card px-4 py-2.5 font-mono text-sm text-[#b8c4d4] transition-colors hover:border-orange-500/50"
            data-title={skill.name}
            data-body={skill.body}
            data-tags={skill.tags}
          >
            <span className="text-orange-400">{skill.icon}</span>
            <span className="font-medium">{skill.name}</span>
          </motion.span>
        ))}
      </motion.div>
    </SectionWrapper>
  );
}