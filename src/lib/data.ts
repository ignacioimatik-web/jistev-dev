/* ============================================================
   jistev.dev — Data Layer
   Positioning: Director Técnico & Arquitecto de Soluciones
   ============================================================ */

/* ─── Methodology: "Así trabajo" ─── */
export interface Step {
  icon: string;
  title: string;
  verb: string;
  desc: string;
  detail: string;
}

export const methodSteps: Step[] = [
  {
    icon: "🔍",
    title: "Observar",
    verb: "Encuentro el problema",
    desc: "No parto de la tecnología. Parto de la necesidad real.",
    detail:
      "Un problema bien definido es medio proyecto resuelto. Escucho, pregunto, identifico dónde duele. Muchas veces el problema no es el que te cuentan — es el que hay debajo.",
  },
  {
    icon: "💡",
    title: "Concebir",
    verb: "Diseño la idea",
    desc: "Imagino lo que debería existir. La tecnología es el medio, no el fin.",
    detail:
      "Aquí no hay código. Hay pizarra, preguntas, y bocetos. ¿Qué debería hacer este sistema? ¿Cómo debería sentirse usarlo? Primero el concepto, después la arquitectura.",
  },
  {
    icon: "🏗️",
    title: "Arquitecturar",
    verb: "Diseño el sistema",
    desc: "Elijo el ecosistema: cloud, on-prem, híbrido. Cada pieza en su sitio.",
    detail:
      "Frontend, backend, base de datos, IA, infraestructura, despliegue. No sobreingeniería: la solución más simple que funcione hoy y Escale mañana. A veces es un monolito. A veces son 4 microservicios en un NAS.",
  },
  {
    icon: "🧭",
    title: "Liderar",
    verb: "Dirijo el proyecto",
    desc: "Roadmap, decisiones técnicas, ejecución. Coordino todo de principio a fin.",
    detail:
      "No delego lo que no sé hacer. Eso significa que entiendo cada capa del sistema, aunque no escriba cada línea. Priorizo, decido, y me aseguro de que el proyecto llegue a puerto.",
  },
  {
    icon: "⚡",
    title: "Construir",
    verb: "Escribo el código",
    desc: "Full-stack, APIs, IA, infraestructura. Todo lo que hace falta para que funcione.",
    detail:
      "Frontend, backend, scripts, pipelines, Docker, deployments. Construyo producto real, no prototipos. Código limpio, decisiones pragmáticas, sin sobreingeniería.",
  },
];

/* ─── Concepts: Ideas originales que he concebido y liderado ─── */
export interface Concept {
  icon: string;
  title: string;
  tagline: string;
  idea: string;         // La idea original — qué problema resuelve de forma no obvia
  domains: string[];    // Áreas que mezcla (IA, automatización, datos...)
  gradient: string;     // bg-gradient class
}

export const concepts: Concept[] = [
  {
    icon: "🛒",
    title: "CESTIA",
    tagline: "La cocina como problema de datos",
    idea: "Convertir recetas en listas de compra inteligentes, organizadas por secciones físicas del supermercado. Escala ingredientes por comensales, respeta preferencias y presupuesto, y te dice exactamente qué comprar en cada pasillo. Mobile-first, para usar con una mano mientras compras.",
    domains: ["datos", "UX", "logística"],
    gradient: "from-emerald-500/20 to-teal-600/10",
  },
  {
    icon: "🛡️",
    title: "HuellaZero",
    tagline: "Recuperar tu huella digital",
    idea: "Escanea tu exposición online (brechas de seguridad, contraseñas filtradas, cuentas olvidadas) y automatiza el borrado con 4 métodos progresivos: bookmarklet, extensión, script o agente IA con control de navegador. Un dashboard con puntuación de privacidad para que cualquiera — sin importar su nivel técnico — recupere el control de sus datos.",
    domains: ["seguridad", "IA", "automatización", "UX"],
    gradient: "from-violet-500/20 to-purple-600/10",
  },
  {
    icon: "👨‍👩‍👧‍👦",
    title: "Escudo Digital Familiar",
    tagline: "Protección infantil en 2 capas",
    idea: "Un método completo de protección digital para menores, basado en DNS de protección + control parental, guiado paso a paso para cualquier familia. No es una app técnica: es un configurador interactivo que adapta la protección a cada dispositivo (móvil, tablet, PC, router) según la edad de los hijos y el nivel técnico de los padres.",
    domains: ["seguridad", "educación", "familia"],
    gradient: "from-sky-500/20 to-blue-600/10",
  },
  {
    icon: "🎵",
    title: "JazzOne Pipeline",
    tagline: "Tu música, sin suscripciones, sin esfuerzo",
    idea: "Pega una URL de YouTube y el pipeline descarga, organiza e inyecta la música directamente en tu biblioteca Navidrome personal. Detección automática de artista y álbum, enriquecimiento con metadatos, todo corriendo 24/7 en un NAS. Una arquitectura híbrida cloud + on-prem que separa frontend (Vercel) de backend (FastAPI + túnel Cloudflare).",
    domains: ["automatización", "híbrido", "datos"],
    gradient: "from-rose-500/20 to-pink-600/10",
  },
  {
    icon: "🎙️",
    title: "Podcast Pipeline",
    tagline: "Transcripción 24× más rápida que el audio",
    idea: "Descarga y transcribe podcasts con aceleración Apple Silicon. 95 minutos de audio → 4 minutos de transcripción usando el Neural Engine del Mac Studio. Con resúmenes automáticos vía IA, cola de trabajos con ETA, y acceso remoto por túnel. Todo gestionado como servicios persistentes, sin intervención manual.",
    domains: ["IA", "aceleración hardware", "automatización"],
    gradient: "from-amber-500/20 to-orange-600/10",
  },
  {
    icon: "📊",
    title: "StudioMo",
    tagline: "El dashboard que toda oficina en casa debería tener",
    idea: "Monitor en tiempo real de Mac Studio + Synology NAS + UPS. CPU, RAM, discos, red, procesos, temperatura, estado del RAID, batería de la UPS. Todo centralizado en un dashboard elegante con gráficos. No es un sistema de monitorización enterprise — es la herramienta que cualquier creador con infraestructura en casa necesita para dormir tranquilo.",
    domains: ["infraestructura", "datos", "UX"],
    gradient: "from-cyan-500/20 to-teal-600/10",
  },
  {
    icon: "⚽",
    title: "Tarjeta Roja",
    tagline: "Gamificar el coleccionismo de cromos",
    idea: "Un campeonato mundial de cartas de fútbol híbrido: crea cartas con rarity tiers y avatares SVG procedimentales, construye plantillas mezclando clubes y selecciones, y compite en torneos globales con mecánicas de duelos por atributos. La lógica de torneo completa — grupos, eliminatorias, desempates — corre en el navegador.",
    domains: ["gamificación", "datos", "UX"],
    gradient: "from-red-500/20 to-rose-600/10",
  },
  {
    icon: "🚵",
    title: "LEVO",
    tagline: "Rutas MTB con inteligencia de terreno",
    idea: "Planificador profesional de rutas MTB/enduro para la zona de Els Ports. Catálogo de 29 tracks GPX reales con un constructor visual que encadena rutas secuencialmente sobre mapa 3D, detecta conexiones entre tracks automáticamente, integra clima en tiempo real y horas de sol, y evalúa el riesgo combinado (meteorología + terreno).",
    domains: ["outdoor", "datos geo", "clima"],
    gradient: "from-lime-500/20 to-green-600/10",
  },
  {
    icon: "🏷️",
    title: "Price Sentinel AI",
    tagline: "Tu asistente de compras inteligente",
    idea: "Scraping multi-tienda + análisis IA para monitorizar precios. Scrapea productos de varias tiendas, normaliza datos, usa DeepSeek para analizar históricos y generar recomendaciones (\"oportunidad\", \"esperar\", \"precio alto\"), y te notifica cuando se cumplen tus reglas de alerta. Como tener un analista de mercado para tus compras del día a día.",
    domains: ["IA", "scraping", "datos", "automatización"],
    gradient: "from-yellow-500/20 to-amber-600/10",
  },
  {
    icon: "🏭",
    title: "WARDEN",
    tagline: "E-commerce con ADN de ingeniería",
    idea: "Tienda online para escenografía BattleTech impresa en 3D con una estética intencionadamente industrial: paleta gris metálico con acentos azul acero, bundles con descuento, drops limitados, y un sistema de selección con presupuesto. No es un shop genérico — es una experiencia de compra que refleja la precisión del producto.",
    domains: ["e-commerce", "UX", "3D"],
    gradient: "from-slate-500/20 to-zinc-600/10",
  },
  {
    icon: "💬",
    title: "Telegram AI Bot",
    tagline: "Tu negocio en Telegram con cerebro",
    idea: "Un bot de Telegram con IA que mantiene contexto de conversación, aprende del usuario y se personaliza para cualquier negocio. No es un bot de menús — es un asistente que entiende preguntas, recuerda conversaciones anteriores y responde con coherencia. Plug-and-play: clona, configura el prompt de personalidad y está listo.",
    domains: ["IA", "bots", "automatización"],
    gradient: "from-blue-500/20 to-indigo-600/10",
  },
  {
    icon: "🏥",
    title: "LaudIA",
    tagline: "IA que escucha consultas médicas",
    idea: "Transcripción en tiempo real de consultas médico-paciente con Whisper, generación automática de informes estructurados con LLMs, y aprendizaje continuo del feedback del especialista. No es un chatbot bonito: es un sistema que un médico usa cada día para ahorrar horas de papeleo. Orquestación de modelos, control de alucinaciones, y fiabilidad en producción.",
    domains: ["IA", "salud", "automatización"],
    gradient: "from-emerald-500/20 to-green-600/10",
  },
];

/* ─── Capabilities: Lo que ofrezco como Director Técnico + Dev ─── */
export interface Capability {
  icon: string;
  title: string;
  tagline: string;
  desc: string;
  details: string[];
}

export const capabilities: Capability[] = [
  {
    icon: "🎯",
    title: "Dirección de Producto",
    tagline: "De la idea al roadmap",
    desc: "Defino la visión, priorizo las funcionalidades, y trazo el camino desde el concepto hasta el lanzamiento. Sin caos ni sobreingeniería: solo lo que hace falta para que el producto resuelva el problema real.",
    details: [
      "Definición de producto desde la necesidad real",
      "Roadmap priorizado por impacto",
      "Coordinación técnica integral (frontend, backend, IA, infra)",
      "Decisiones que equilibran velocidad, calidad y coste"
    ],
  },
  {
    icon: "🏗️",
    title: "Arquitectura Full-Stack",
    tagline: "Diseño y ejecuto sistemas completos",
    desc: "Diseño la arquitectura y construyo cada capa. Frontend, backend, APIs, base de datos, despliegue. No hay 'eso lo hace otro' — entiendo y ejecuto todo el stack.",
    details: [
      "Frontend: Next.js, React, TypeScript, animaciones",
      "Backend: Python, FastAPI, Node.js, APIs REST",
      "Infraestructura: Docker, NAS, Vercel, túneles seguros",
      "Bases de datos: PostgreSQL, Supabase, SQLite, ChromaDB"
    ],
  },
  {
    icon: "🤖",
    title: "IA en Producción",
    tagline: "No demos. Sistemas que funcionan.",
    desc: "Integro LLMs, RAG, Whisper y automatización en productos reales. El reto no es conectar un modelo — es hacer que sea fiable, que no alucine cuando no debe, y que mejore con el uso.",
    details: [
      "LLMs: OpenAI, DeepSeek, Claude, modelos locales",
      "RAG sobre documentos con ChromaDB + embeddings NVIDIA",
      "Transcripción Whisper acelerada por Apple Silicon",
      "Control de alucinaciones, validación y testing de fiabilidad"
    ],
  },
  {
    icon: "🔄",
    title: "Automatización Inteligente",
    tagline: "Lo que se ejecuta solo, funciona siempre",
    desc: "Pipelines, scraping, bots, procesamiento de datos, integración de APIs. Herramientas que eliminan tareas repetitivas y funcionan sin supervisión 24/7.",
    details: [
      "Pipelines de datos: ingestión, transformación, enriquecimiento",
      "Bots para Telegram, WhatsApp, Slack con IA contextual",
      "Scraping multi-tienda con Playwright + análisis IA",
      "Servicios persistentes con logging, reintentos y monitoreo"
    ],
  },
  {
    icon: "🌐",
    title: "Ecosistemas Híbridos",
    tagline: "Cloud + on-prem, sin fricción",
    desc: "Diseño sistemas que cruzan la frontera entre cloud y tu propio hardware. Frontend en Vercel, backend en un NAS en casa, túneles Cloudflare para acceso seguro. Lo mejor de ambos mundos.",
    details: [
      "Arquitecturas cloud + NAS + Docker",
      "Túneles Cloudflare para acceso remoto seguro",
      "Backups, RAID, UPS monitoring",
      "CI/CD y despliegue automatizado"
    ],
  },
];

/* ─── About ─── */
export interface AboutHighlight {
  icon: string;
  title: string;
  desc: string;
}

export const aboutHighlights: AboutHighlight[] = [
  {
    icon: "🧠",
    title: "Imagino",
    desc: "Concibo ideas originales donde otros ven problemas cotidianos. No espero a que me digan qué construir — identifico lo que falta y lo creo.",
  },
  {
    icon: "🧭",
    title: "Lidero",
    desc: "Dirijo el proyecto de principio a fin. Visión de producto, roadmap, decisiones técnicas, coordinación. Sé lo que cuesta cada decisión porque sé lo que cuesta implementarla.",
  },
  {
    icon: "⚡",
    title: "Construyo",
    desc: "Escribo el código. Frontend, backend, APIs, infraestructura, IA. No hay capa del sistema que no entienda ni línea que no pueda escribir.",
  },
];

/* ─── Stats ─── */
export const stats = [
  { n: "12+", l: "Proyectos liderados" },
  { n: "8", l: "Ideas originales" },
  { n: "5", l: "Disciplinas técnicas" },
  { n: "Full-Stack", l: "De la visión al código" },
];

/* ─── Services (precios — keep lean) ─── */
export const services = [
  {
    icon: "🚀",
    title: "Proyecto completo",
    desc: "De la idea al producto funcionando. Definición, arquitectura, desarrollo, despliegue. Tú pones la visión, yo pongo el resto.",
    price: "desde 1.000€",
  },
  {
    icon: "🤖",
    title: "IA integrada",
    desc: "LLMs, RAG, Whisper, automatización. Sistemas de IA que funcionan en producción, no demos.",
    price: "desde 500€",
  },
  {
    icon: "🔄",
    title: "Automatización",
    desc: "Pipelines, scraping, bots, integraciones. Herramientas que eliminan tareas repetitivas 24/7.",
    price: "desde 300€",
  },
  {
    icon: "💬",
    title: "Consultoría técnica",
    desc: "Arquitectura, revisión de código, estrategia técnica. Para equipos que necesitan dirección sin perder velocidad.",
    price: "desde 400€",
  },
];

/* ─── FAQs ─── */
export const faqs = [
  { q: "¿Cómo trabajamos?", a: "Hablamos, me cuentas tu idea o problema, te propongo una solución con roadmap y presupuesto. Si te funciona, arrancamos. Sin vueltas ni sorpresas." },
  { q: "¿Eres desarrollador o jefe de proyecto?", a: "Ambos. Concibo la idea, lidero el proyecto y escribo el código. No hay brecha entre lo que imagino y lo que entrego." },
  { q: "¿Cuánto tarda un proyecto?", a: "Depende del alcance, pero en 1-2 semanas tienes una primera versión funcional lista para testear con usuarios reales." },
  { q: "¿Ofreces mantenimiento?", a: "Sí. Todos los proyectos incluyen 30 días de soporte post-entrega. Después podemos acordar un plan continuo." },
  { q: "¿Con quién trabajas?", a: "Con founders que necesitan su MVP, empresas que quieren automatizar procesos, o cualquiera que tenga una idea y necesite a alguien que la haga real." },
];
