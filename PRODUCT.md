# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS 4 · Framer Motion · shadcn/ui · Vercel · nodemailer (contacto/presupuesto). Deploy vía git push → Vercel (jistev-dev.vercel.app).

## Users

Primary user: **founders / startups que necesitan un MVP**. Cambian una idea sin validar por una primera versión funcional en ~2 semanas, para mostrarla a usuarios/inversores y testear con gente real. Esperan entregas rápidas, comunicación directa y cero fricción para arrancar.

## Product Purpose

Portfolio/servicio de Ignacio Estevez (jistev), desarrollador full-stack + IA. Convierte ideas en MVPs funcionales: desarrollo full-stack, automatización con IA, bots y herramientas a medida. Objetivo de negocio: que un founder le encargue un primer producto. Éxito medible = contacto de presupuesto iniciado (página /presupuesto).

## Positioning

Pocos devs freelance combinan **IA en producción** (LLMs, RAG, bots que aguantan tráfico real, con costes y fallbacks) con **arquitectura híbrida cloud + on-prem** (frontend en Vercel, backend en NAS Synology propio, túneles seguros). Eso — mas experiencia real de director técnico que imagina, lidera y construye — es la diferencia que un vecino no podría copiar con verdad.

## Operating Context

Página pública en español. Secciones: Hero (video ondas 4K, `$ status: onboard`), Sobre mí, Capacidades (5 acordeones + tooltip seguidor), Stack (tooltips con proyectos por tecnología), Ideas concebidas (8 proyectos reales con fondo de código), Mi método (5 pasos), Servicios (cards con foto), FAQ, Contacto. Página configuradora `/presupuesto` multi-paso (servicios → datos → revisión → PDF) con API `/api/quote`. Formularios con rate-limit, honeypot y escape HTML.

## Capabilities and Constraints

- Full-stack end-to-end: Next.js/React/TS, Python/FastAPI, Node, PostgreSQL/Supabase (RLS), Docker, NAS, Vercel, túneles seguro.
- IA en producción: LLMs (OpenAI, DeepSeek, Claude, locales), RAG (ChromaDB), Whisper (Apple Silicon), control de alucinaciones.
- Entregas: MVP funcional en 1-2 semanas; soporte post-entrega 30 días.
- 8 proyectos reales públicos (JazzOne, ZBS-Forcall, studioMo, Escudo, HuellaZero, ASP-10, NovaTerm, AstroLab).
- Stack visual: dark premium, mono (JetBrains Mono) + Inter, acentos violeta/cian, cards con fondo oscuro.
- Limitación: presupuesto-sensible; acepta límites físicos (equipo/tiempo).

## Brand Commitments

Marca "jistev" / "jistev.dev" / "~/jistev_". Nombre real: Ignacio Estevez (jistev). Tono: español, directo, técnico-templado, sin hype ni folleto. Personalidad: capacidad de imaginar, liderar y construir desde la visión a la última línea de código. Email de contacto: ignacio@digitalcode.es. GitHub: ignacioimatik-web.

## Evidence on Hand

- 8 repos públicos de proyectos reales (descritos arriba) con código funcionando.
- Datos verificables: 12+ proyectos entregados, 8 open source, MVP en 2 semanas.
- Pipeline JazzOne funcionando en NAS Synology; AstroLab con resultado medido (25 subs + denoise > 100 subs crudos).
- Performance/arquitectura de cada proyecto documentada en sus READMEs.

## Product Principles

1. **La IA debe funcionar en producción, no ser una demo** — costes, fallbacks y datos donde deben.
2. **Entrega rápida y pragmática** — MVP en semanas, no meses; sin sobreingeniería.
3. **Un solo sistema, de principio a fin** — frontend y backend pensados juntos, sin silos.
4. **Arquitectura híbrida real** — cloud + on-prem; lo mejor de ambos mundos.
5. **Honestidad técnica** — cifras reales, nunca infladas.

## Accessibility & Inclusion

Sitio en español, navigable con teclado (focus indicators), `prefers-reduced-motion` global que reduce movimiento pero mantiene fades, hovers solo en dispositivos con puntero fino. Accesibilidad AA como objetivo; los tooltips seguidores son decorativos y no bloquean el contenido.