"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionWrapper, SectionHeading } from "@/components/section-wrapper";
import { faqs } from "@/lib/data";
import { ChevronDown } from "lucide-react";
import { EASE_OUT } from "@/lib/motion";

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <SectionWrapper id="faq">
      <SectionHeading label="FAQ" title="Preguntas frecuentes" />

      <div className="mx-auto max-w-3xl space-y-3">
        {faqs.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="overflow-hidden rounded-xl border border-zinc-800"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-medium transition-colors hover:bg-zinc-900/50"
            >
              <span>{f.q}</span>
              <motion.span
                animate={{ rotate: open === i ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="ml-4 text-zinc-500"
              >
                <ChevronDown className="h-4 w-4" />
              </motion.span>
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: EASE_OUT }}
                  className="border-t border-zinc-800"
                >
                  <div className="px-6 py-4 text-sm leading-relaxed text-zinc-400">
                    {f.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
