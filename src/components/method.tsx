"use client";

import { motion } from "framer-motion";
import { SectionWrapper, SectionHeading } from "@/components/section-wrapper";
import { methodSteps } from "@/lib/data";
import { useState } from "react";

function StepConnector({ active }: { active: boolean }) {
  return (
    <div className="hidden sm:flex items-center justify-center py-2">
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
      <SectionHeading
        label="Mi método"
        title="Así trabajo"
      />

      {/* Intro */}
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
      <div className="hidden sm:flex items-start justify-center gap-0">
        {methodSteps.map((step, i) => (
          <div key={step.title} className="flex items-start">
            <motion.button
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              onClick={() => setActiveStep(activeStep === i ? null : i)}
              className={`group flex flex-col items-center gap-3 p-4 rounded-xl transition-all duration-300 ${
                activeStep === i
                  ? "bg-violet-500/10 border border-violet-500/20"
                  : "hover:bg-zinc-900/40 border border-transparent"
              }`}
            >
              {/* Circle with icon */}
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl transition-all duration-300 ${
                  activeStep === i
                    ? "bg-violet-500/20 ring-2 ring-violet-500/40 scale-110"
                    : "bg-zinc-900 ring-1 ring-zinc-800 group-hover:ring-zinc-700"
                }`}
              >
                {step.icon}
              </div>
              {/* Label */}
              <div className="text-center">
                <div
                  className={`text-sm font-semibold transition-colors ${
                    activeStep === i ? "text-violet-400" : "text-zinc-300"
                  }`}
                >
                  {step.title}
                </div>
                <div className="mt-0.5 text-[11px] text-zinc-600 max-w-24 leading-tight">
                  {step.verb}
                </div>
              </div>
            </motion.button>
            {i < methodSteps.length - 1 && (
              <StepConnector active={activeStep !== null} />
            )}
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
          className="mx-auto mt-10 hidden max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 sm:block"
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
            className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4"
          >
            <div className="mb-2 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-lg">
                {step.icon}
              </span>
              <div>
                <div className="text-sm font-semibold text-zinc-200">
                  {step.title}
                </div>
                <div className="text-xs text-zinc-600">{step.verb}</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-zinc-400">
              {step.detail}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
