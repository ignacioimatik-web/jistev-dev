"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionWrapper, SectionHeading } from "@/components/section-wrapper";

const concepts = [
  {
    icon: "🛒", title: "CESTIA", tagline: "La cocina como problema de datos",
    idea: "Convertir recetas en listas de compra inteligentes, organizadas por secciones físicas del supermercado. Escala ingredientes por comensales, respeta preferencias y presupuesto, y te dice exactamente qué comprar en cada pasillo. Mobile-first, para usar con una mano mientras compras.",
    domains: ["datos", "UX", "logística"], ring: "border-emerald-500/30",
  },
  {
    icon: "🛡️", title: "HuellaZero", tagline: "Recuperar tu huella digital",
    idea: "Escanea tu exposición online (brechas de seguridad, contraseñas filtradas, cuentas olvidadas) y automatiza el borrado con 4 métodos progresivos: bookmarklet, extensión, script o agente IA con control de navegador. Un dashboard con puntuación de privacidad para que cualquiera — sin importar su nivel técnico — recupere el control de sus datos.",
    domains: ["seguridad", "IA", "automatización", "UX"], ring: "border-violet-500/30",
  },
  {
    icon: "👨‍👩‍👧‍👦", title: "Escudo Digital Familiar", tagline: "Protección infantil en 2 capas",
    idea: "Un método completo de protección digital para menores, basado en DNS de protección + control parental, guiado paso a paso para cualquier familia. No es una app técnica: es un configurador interactivo que adapta la protección a cada dispositivo (móvil, tablet, PC, router) según la edad de los hijos y el nivel técnico de los padres.",
    domains: ["seguridad", "educación", "familia"], ring: "border-sky-500/30",
  },
  {
    icon: "🎵", title: "JazzOne Pipeline", tagline: "Tu música, sin suscripciones, sin esfuerzo",
    idea: "Pega una URL de YouTube y el pipeline descarga, organiza e inyecta la música directamente en tu biblioteca Navidrome personal. Detección automática de artista y álbum, enriquecimiento con metadatos, todo corriendo 24/7 en un NAS. Una arquitectura híbrida cloud + on-prem que separa frontend (Vercel) de backend (FastAPI + túnel Cloudflare).",
    domains: ["automatización", "híbrido", "datos"], ring: "border-rose-500/30",
  },
  {
    icon: "🎙️", title: "Podcast Pipeline", tagline: "Transcripción 24× más rápida que el audio",
    idea: "Descarga y transcribe podcasts con aceleración Apple Silicon. 95 minutos de audio → 4 minutos de transcripción usando el Neural Engine del Mac Studio. Con resúmenes automáticos vía IA, cola de trabajos con ETA, y acceso remoto por túnel. Todo gestionado como servicios persistentes, sin intervención manual.",
    domains: ["IA", "aceleración hardware", "automatización"], ring: "border-amber-500/30",
  },
  {
    icon: "📊", title: "StudioMo", tagline: "El dashboard que toda oficina en casa debería tener",
    idea: "Monitor en tiempo real de Mac Studio + Synology NAS + UPS. CPU, RAM, discos, red, procesos, temperatura, estado del RAID, batería de la UPS. Todo centralizado en un dashboard elegante con gráficos. No es un sistema de monitorización enterprise — es la herramienta que cualquier creador con infraestructura en casa necesita para dormir tranquilo.",
    domains: ["infraestructura", "datos", "UX"], ring: "border-cyan-500/30",
  },
  {
    icon: "⚽", title: "Tarjeta Roja", tagline: "Gamificar el coleccionismo de cromos",
    idea: "Un campeonato mundial de cartas de fútbol híbrido: crea cartas con rarity tiers y avatares SVG procedimentales, construye plantillas mezclando clubes y selecciones, y compite en torneos globales con mecánicas de duelos por atributos. La lógica de torneo completa — grupos, eliminatorias, desempates — corre en el navegador.",
    domains: ["gamificación", "datos", "UX"], ring: "border-red-500/30",
  },
  {
    icon: "🚵", title: "LEVO", tagline: "Rutas MTB con inteligencia de terreno",
    idea: "Planificador profesional de rutas MTB/enduro para la zona de Els Ports. Catálogo de 29 tracks GPX reales con un constructor visual que encadena rutas secuencialmente sobre mapa 3D, detecta conexiones entre tracks automáticamente, integra clima en tiempo real y horas de sol, y evalúa el riesgo combinado (meteorología + terreno).",
    domains: ["outdoor", "datos geo", "clima"], ring: "border-lime-500/30",
  },
  {
    icon: "🏷️", title: "Price Sentinel AI", tagline: "Tu asistente de compras inteligente",
    idea: "Scraping multi-tienda + análisis IA para monitorizar precios. Scrapea productos de varias tiendas, normaliza datos, usa DeepSeek para analizar históricos y generar recomendaciones (\"oportunidad\", \"esperar\", \"precio alto\"), y te notifica cuando se cumplen tus reglas de alerta. Como tener un analista de mercado para tus compras del día a día.",
    domains: ["IA", "scraping", "datos", "automatización"], ring: "border-yellow-500/30",
  },
  {
    icon: "🏭", title: "WARDEN", tagline: "E-commerce con ADN de ingeniería",
    idea: "Tienda online para escenografía BattleTech impresa en 3D con una estética intencionadamente industrial: paleta gris metálico con acentos azul acero, bundles con descuento, drops limitados, y un sistema de selección con presupuesto. No es un shop genérico — es una experiencia de compra que refleja la precisión del producto.",
    domains: ["e-commerce", "UX", "3D"], ring: "border-slate-500/30",
  },
  {
    icon: "💬", title: "Telegram AI Bot", tagline: "Tu negocio en Telegram con cerebro",
    idea: "Un bot de Telegram con IA que mantiene contexto de conversación, aprende del usuario y se personaliza para cualquier negocio. No es un bot de menús — es un asistente que entiende preguntas, recuerda conversaciones anteriores y responde con coherencia. Plug-and-play: clona, configura el prompt de personalidad y está listo.",
    domains: ["IA", "bots", "automatización"], ring: "border-blue-500/30",
  },
  {
    icon: "🏥", title: "LaudIA", tagline: "IA que escucha consultas médicas",
    idea: "Transcripción en tiempo real de consultas médico-paciente con Whisper, generación automática de informes estructurados con LLMs, y aprendizaje continuo del feedback del especialista. No es un chatbot bonito: es un sistema que un médico usa cada día para ahorrar horas de papeleo. Orquestación de modelos, control de alucinaciones, y fiabilidad en producción.",
    domains: ["IA", "salud", "automatización"], ring: "border-emerald-500/30",
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
        transition={{ duration: 0.5, delay: 0.1 }}
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
              transition={{ delay: (i % 6) * 0.05, duration: 0.4 }}
              layout
              onClick={() => setActive(isOpen ? null : i)}
              className={`group relative cursor-pointer overflow-hidden rounded-[14px] border bg-[#11161d]/70 p-5 transition-all duration-300 ${
                isOpen ? `${c.ring} bg-[#11161d]` : "border-zinc-800 hover:border-zinc-600"
              }`}
            >
              <div className="relative z-10">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="text-2xl">{c.icon}</span>
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
                  className={`mt-3 text-sm leading-relaxed transition-all duration-300 ${
                    isOpen ? "text-zinc-300" : "line-clamp-3 text-zinc-500"
                  }`}
                >
                  {c.idea}
                </p>
                <div className="mt-3 font-mono text-[10px] text-zinc-600 transition-colors group-hover:text-zinc-500">
                  {isOpen ? "▲ contraer" : "▼ leer más"}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}