"use client";

import { motion } from "framer-motion";
import { SectionWrapper, SectionHeading } from "@/components/section-wrapper";
import { useState } from "react";

const methodSteps = [
  {
    icon: "🔍", title: "Observar", verb: "Encuentro el problema",
    desc: "No parto de la tecnología. Parto de la necesidad real.",
    detail: "Un problema bien definido es medio proyecto resuelto. Escucho, pregunto, identifico dónde duele. Muchas veces el problema no es el que te cuentan — es el que hay debajo.",
  },
  {
    icon: "💡", title: "Concebir", verb: "Diseño la idea",
    desc: "Imagino lo que debería existir. La tecnología es el medio, no el fin.",
    detail: "Aquí no hay código. Hay pizarra, preguntas, y bocetos. ¿Qué debería hacer este sistema? ¿Cómo debería sentirse usarlo? Primero el concepto, después la arquitectura.",
  },
  {
    icon: "🏗️", title: "Arquitecturar", verb: "Diseño el sistema",
    desc: "Elijo el ecosistema: cloud, on-prem, híbrido. Cada pieza en su sitio.",
    detail: "Frontend, backend, base de datos, IA, infraestructura, despliegue. No sobreingeniería: la solución más simple que funcione hoy y escale mañana. A veces es un monolito. A veces son 4 microservicios en un NAS.",
  },
  {
    icon: "🧭", title: "Liderar", verb: "Dirijo el proyecto",
    desc: "Roadmap, decisiones técnicas, ejecución. Coordino todo de principio a fin.",
    detail: "No delego lo que no sé hacer. Eso significa que entiendo cada capa del sistema, aunque no escriba cada línea. Priorizo, decido, y me aseguro de que el proyecto llegue a puerto.",
  },
  {
    icon: "⚡", title: "Construir", verb: "Escribo el código",
    desc: "Full-stack, APIs, IA, infraestructura. Todo lo que hace falta para que funcione.",
    detail: "Frontend, backend, scripts, pipelines, Docker, deployments. Construyo producto real, no prototipos. Código limpio, decisiones pragmáticas, sin sobreingeniería.",
  },
];

function StepConnector({ active }: { active: boolean }) {
  return (
    <div className="hidden items-center justify-center py-2 sm:flex">
      <div
        className={`h-0.5 w-12 transition-colors duration-500 ${
          active ? "bg-violet-500/40" : "bg-zinc-800"
        }`}
      />
    </div>
  );
}

export function Method() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <SectionWrapper id="metodo">
      <SectionHeading label="mi método" title="Así trabajo." />

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mx-auto mb-16 max-w-3xl text-center text-sm leading-relaxed text-zinc-400"
      >
        No empiezo por el código. Empiezo por el problema. Cada proyecto sigue
        el mismo flujo — desde que identifico la necesidad hasta que el producto
        está funcionando en producción.
      </motion.p>

      {/* Desktop: horizontal flow */}
      <div className="hidden items-start justify-center sm:flex">
        {methodSteps.map((step, i) => (
          <div key={step.title} className="flex items-start">
            <motion.button
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              onClick={() => setActiveStep(activeStep === i ? null : i)}
              className={`group flex flex-col items-center gap-3 rounded-[12px] p-4 transition-all duration-300 ${
                activeStep === i
                  ? "border border-violet-500/30 bg-violet-500/10"
                  : "border border-transparent hover:bg-zinc-900/40"
              }`}
            >
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl transition-all duration-300 ${
                  activeStep === i
                    ? "scale-110 bg-violet-500/20 ring-2 ring-violet-500/40"
                    : "bg-[#0f141b] ring-1 ring-zinc-800 group-hover:ring-zinc-700"
                }`}
              >
                {step.icon}
              </div>
              <div className="text-center">
                <div
                  className={`text-sm font-semibold transition-colors ${
                    activeStep === i ? "text-violet-400" : "text-zinc-300"
                  }`}
                >
                  {step.title}
                </div>
                <div className="mt-0.5 max-w-24 text-[11px] leading-tight text-zinc-600">
                  {step.verb}
                </div>
              </div>
            </motion.button>
            {i < methodSteps.length - 1 && <StepConnector active={activeStep !== null} />}
          </div>
        ))}
      </div>

      {/* Active step detail — desktop */}
      {activeStep !== null && (
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-auto mt-10 hidden max-w-2xl rounded-[14px] border border-zinc-800 bg-[#11161d]/70 p-6 sm:block"
        >
          <div className="mb-2 flex items-center gap-3">
            <span className="text-2xl">{methodSteps[activeStep].icon}</span>
            <div>
              <span className="text-sm font-semibold text-violet-400">
                {methodSteps[activeStep].title}
              </span>
              <span className="ml-2 text-sm text-zinc-600">
                — {methodSteps[activeStep].verb}
              </span>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-zinc-400">
            {methodSteps[activeStep].detail}
          </p>
        </motion.div>
      )}

      {/* Mobile: vertical cards */}
      <div className="mt-10 space-y-3 sm:hidden">
        {methodSteps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="rounded-[12px] border border-zinc-800 bg-[#11161d]/60 p-4"
          >
            <div className="mb-2 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-lg">
                {step.icon}
              </span>
              <div>
                <div className="text-sm font-semibold text-zinc-200">{step.title}</div>
                <div className="text-xs text-zinc-600">{step.verb}</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-zinc-400">{step.detail}</p>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}