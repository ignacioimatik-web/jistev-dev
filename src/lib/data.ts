export interface Project {
  title: string;
  desc: string;
  tech: string[];
  url: string;
  repo?: string;
  featured?: boolean;
  category: "fullstack" | "ai" | "automation" | "ui";
}

export const projects: Project[] = [
  {
    title: "LEVO — MTB Routes",
    desc: "Planificación y construcción de rutas MTB/enduro con mapa 3D interactivo, perfiles altimétricos, datos meteorológicos en tiempo real (AEMET) y autenticación OAuth.",
    tech: ["Next.js", "TypeScript", "Mapbox", "AEMET API", "OAuth", "Zustand"],
    url: "https://levo-seven.vercel.app",
    repo: "https://github.com/ignacioimatik-web/levo",
    featured: true,
    category: "fullstack",
  },
  {
    title: "WARDEN — E-commerce 3D",
    desc: "Plataforma de e-commerce para escenografía BattleTech impresa en 3D. Catálogo técnico con diseño industrial premium, carrito y checkout.",
    tech: ["Next.js", "shadcn/ui", "Zustand", "Zod", "Supabase", "Tailwind"],
    url: "#",
    repo: "https://github.com/ignacioimatik-web/warden",
    featured: true,
    category: "fullstack",
  },
  {
    title: "CESTIA — Cesta Inteligente",
    desc: "App mobile-first que convierte recetas en listas de compra organizadas por secciones de supermercado. Multi-hogar, presupuestos y preferencias.",
    tech: ["Next.js", "TypeScript", "Tailwind", "LocalStorage", "PWA"],
    url: "#",
    repo: "https://github.com/ignacioimatik-web/CESTIA",
    featured: true,
    category: "fullstack",
  },
  {
    title: "JazzOne Pipeline",
    desc: "Pipeline de música con frontend Next.js + backend FastAPI con yt-dlp corriendo en NAS Synology via Docker. Arquitectura híbrida cloud + on-prem.",
    tech: ["Next.js", "FastAPI", "Docker", "yt-dlp", "NAS Synology"],
    url: "https://pipeline.jazzone.click",
    repo: "https://github.com/ignacioimatik-web/jazzone-pipeline",
    featured: true,
    category: "automation",
  },
  {
    title: "Tarjeta Roja",
    desc: "Gestor interactivo de campeonatos de cartas de fútbol. Crea cartas, construye plantillas híbridas y compite en torneos globales.",
    tech: ["Next.js 16", "Framer Motion", "Zustand", "Zod", "Lucide"],
    url: "#",
    repo: "https://github.com/ignacioimatik-web/tarjetaroja",
    featured: true,
    category: "ui",
  },
  {
    title: "Escudo Digital Familiar",
    desc: "Plataforma premium para protección digital de menores. DNS de protección + control parental en 2 capas. UI pulida con animaciones.",
    tech: ["Next.js", "shadcn/ui", "Framer Motion", "Tailwind", "Lucide"],
    url: "#",
    repo: "https://github.com/ignacioimatik-web/escudo-digital-familiar",
    featured: true,
    category: "fullstack",
  },
  {
    title: "Telegram AI Bot",
    desc: "Bot de Telegram con GPT-4o-mini. Respuestas contextuales, memoria de conversación y personalizable para cualquier negocio.",
    tech: ["Python", "python-telegram-bot", "OpenAI", "GPT-4o-mini", "Docker"],
    url: "#",
    repo: "https://github.com/ignacioimatik-web/telegram-ai-bot",
    featured: false,
    category: "ai",
  },
  {
    title: "moreres",
    desc: "Proyecto construido con Astro. Explora el potencial del framework moderno para sitios estáticos y contenido dinámico.",
    tech: ["Astro", "TypeScript", "Tailwind"],
    url: "#",
    repo: "https://github.com/ignacioimatik-web/moreres",
    featured: false,
    category: "ui",
  },
];

export interface Skill {
  name: string;
  category: "frontend" | "backend" | "ai" | "devops" | "database" | "design";
  icon: string;
}

export const skills: Skill[] = [
  { name: "Next.js", category: "frontend", icon: "▲" },
  { name: "React", category: "frontend", icon: "⚛" },
  { name: "TypeScript", category: "frontend", icon: "TS" },
  { name: "Tailwind CSS", category: "frontend", icon: "🌊" },
  { name: "Framer Motion", category: "frontend", icon: "🎬" },
  { name: "shadcn/ui", category: "frontend", icon: "🧩" },
  { name: "Astro", category: "frontend", icon: "🚀" },
  { name: "Zustand", category: "frontend", icon: "🐻" },
  { name: "Zod", category: "frontend", icon: "✅" },
  { name: "Python", category: "backend", icon: "🐍" },
  { name: "FastAPI", category: "backend", icon: "⚡" },
  { name: "Node.js", category: "backend", icon: "🟢" },
  { name: "REST APIs", category: "backend", icon: "🔗" },
  { name: "Supabase", category: "database", icon: "🔥" },
  { name: "PostgreSQL", category: "database", icon: "🐘" },
  { name: "Docker", category: "devops", icon: "🐳" },
  { name: "Vercel", category: "devops", icon: "▲" },
  { name: "OpenAI / GPT", category: "ai", icon: "🤖" },
  { name: "LangChain", category: "ai", icon: "⛓" },
  { name: "RAG Systems", category: "ai", icon: "📚" },
  { name: "Bot Dev", category: "ai", icon: "💬" },
];

export const services = [
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

export const faqs = [
  { q: "¿Cómo trabajamos?", a: "Hablamos, defines lo que necesitas, te doy un presupuesto y plazo realista. Entrego el proyecto funcionando. Sin vueltas ni sorpresas." },
  { q: "¿Cuánto tardas en construir un MVP?", a: "Depende del proyecto, pero en 1-2 semanas tienes una primera versión funcional que puedes mostrar y testear con usuarios reales." },
  { q: "¿Ofreces mantenimiento?", a: "Sí. Todos los proyectos incluyen 30 días de soporte post-entrega. Después podemos acordar un plan de mantenimiento continuo." },
  { q: "¿Trabajas con startups o con empresas tradicionales?", a: "Con ambas. Desde founders que necesitan su MVP ayer hasta empresas que quieren automatizar procesos manuales que les consumen horas." },
  { q: "¿Qué tecnologías usas?", a: "Principalmente Next.js + TypeScript + Tailwind para frontend, Python/FastAPI para backend, y el stack que mejor se adapte a cada proyecto." },
];
