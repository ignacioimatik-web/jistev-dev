"use client";

import { motion } from "framer-motion";
import { SectionWrapper, SectionHeading } from "@/components/section-wrapper";
import { services } from "@/lib/data";

export function Services() {
  return (
    <SectionWrapper id="servicios">
      <SectionHeading label="Servicios" title="Lo que puedo hacer por ti" />

      <div className="grid gap-6 sm:grid-cols-2">
        {services.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-900"
          >
            <motion.span
              whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
              className="mb-4 block text-3xl"
            >
              {s.icon}
            </motion.span>
            <h3 className="mb-2 text-lg font-semibold">{s.title}</h3>
            <p className="mb-4 text-sm leading-relaxed text-zinc-400">
              {s.desc}
            </p>
            <span className="text-sm font-medium text-violet-400">
              {s.price}
            </span>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
