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

export interface Capability {
  icon: string;
  title: string;
  price: string;
  approach: string;
  example: string;
  exampleProject: string;
  whyPrice: string;
  connectsTo: string[];
}

export const capabilities: Capability[] = [
  {
    icon: "⚡",
    title: "MVP Factory",
    price: "desde 1.000€",
    approach:
      "No entrego documentación ni wireframes bonitos. Entrego producto funcionando. En la primera semana definimos juntos qué es lo mínimo que necesita para resolver el problema real. En la segunda, lo construyo, lo despliego y lo tienes en producción.",
    example:
      "CESTIA nació de una necesidad real: organizar la compra semanal sin volverse loco. En 10 días tenía una PWA funcional con listas multi-hogar, presupuestos por hogar y sincronización en tiempo real. No hubo llamadas de ventas, ni mockups, ni sobreingeniería.",
    exampleProject: "CESTIA",
    whyPrice:
      "Porque no es una plantilla ni un constructor visual. Es un producto completo construido desde cero: frontend responsive, base de datos, autenticación, API, despliegue y 30 días de soporte post-entrega. Cada proyecto tiene su propia arquitectura, no hereda bugs de un tema genérico.",
    connectsTo: ["automatizacion", "bots"],
  },
  {
    icon: "🤖",
    title: "Automatización con IA",
    price: "desde 500€",
    approach:
      "No hago demos de ChatGPT. Construyo sistemas que procesan, clasifican y deciden con IA en producción. El reto no es integrar un LLM — es hacer que sea fiable, que no alucine cuando no debe y que mejore con el uso.",
    example:
      "LaudIA transcribe consultas médicas en tiempo real con Whisper, genera informes estructurados con LLMs y aprende del feedback del especialista. No es un chatbot bonito: es un sistema que un médico usa cada día para ahorrar horas de papeleo.",
    exampleProject: "LaudIA",
    whyPrice:
      "Porque una automatización con IA real implica orquestación de modelos, gestión de contexto, RAG sobre documentos, control de alucinaciones y testing de fiabilidad. No es 'conectar ChatGPT y listo' — cada integración se prueba hasta que el resultado es consistente en producción.",
    connectsTo: ["mvp", "bots"],
  },
  {
    icon: "🔄",
    title: "Automation Tools",
    price: "desde 300€",
    approach:
      "Construyo herramientas que eliminan tareas repetitivas. Scripts Python, scraping, pipelines de datos, integración de APIs, reporting automático. Son soluciones más acotadas que un sistema de IA completo, pero igual de pensadas: si algo se ejecuta solo, tiene que hacerlo bien siempre.",
    example:
      "El PAC — Pipeline de Audio descarga, organiza y enriquece música automáticamente desde YouTube con metadatos de MusicBrainz + Discogs, todo corriendo en un NAS Synology. Una vez configurado, nadie vuelve a tocar nada.",
    exampleProject: "PAC — Pipeline de Audio",
    whyPrice:
      "Porque aunque sea una herramienta más acotada, sigue siendo software que tiene que funcionar sin supervisión. Manejo de errores, logging, reintentos, y que sepas que si falla a las 3 de la mañana, no pierdes datos. Eso diferencia un script de una herramienta.",
    connectsTo: ["bots"],
  },
  {
    icon: "💬",
    title: "Bots & APIs",
    price: "desde 400€",
    approach:
      "Construyo las tuberías que conectan sistemas que no hablan entre sí. APIs REST, webhooks, bots para Telegram y WhatsApp, sistemas de notificaciones inteligentes. Cada integración está diseñada para que cuando algo falle (y va a fallar), no se pierdan datos ni se rompa el flujo.",
    example:
      "El Telegram AI Bot responde con GPT-4o-mini, mantiene memoria de conversación y es personalizable para cualquier negocio. No es un bot de menús — es un asistente que aprende del contexto de cada usuario.",
    exampleProject: "Telegram AI Bot",
    whyPrice:
      "Porque una integración fiable requiere diseño de API, manejo de errores, colas de reintentos, logging y monitoreo. No es 'un script que hace una llamada' — es pieza de infraestructura que tiene que funcionar 24/7. Los bots además necesitan gestión de estados, memoria y manejo de concurrencia.",
    connectsTo: ["mvp", "ia"],
  },
];

export const faqs = [
  { q: "¿Cómo trabajamos?", a: "Hablamos, defines lo que necesitas, te doy un presupuesto y plazo realista. Entrego el proyecto funcionando. Sin vueltas ni sorpresas." },
  { q: "¿Cuánto tardas en construir un MVP?", a: "Depende del proyecto, pero en 1-2 semanas tienes una primera versión funcional que puedes mostrar y testear con usuarios reales." },
  { q: "¿Ofreces mantenimiento?", a: "Sí. Todos los proyectos incluyen 30 días de soporte post-entrega. Después podemos acordar un plan de mantenimiento continuo." },
  { q: "¿Trabajas con startups o con empresas tradicionales?", a: "Con ambas. Desde founders que necesitan su MVP ayer hasta empresas que quieren automatizar procesos manuales que les consumen horas." },
  { q: "¿Qué tecnologías usas?", a: "Principalmente Next.js + TypeScript + Tailwind para frontend, Python/FastAPI para backend, y el stack que mejor se adapte a cada proyecto." },
];
