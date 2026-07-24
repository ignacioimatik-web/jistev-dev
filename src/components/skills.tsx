"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionWrapper, SectionHeading } from "@/components/section-wrapper";
import { skills, type Skill } from "@/lib/data";
import { cn } from "@/lib/utils";

const categories = [
  { key: "all", label: "Todo" },
  { key: "frontend", label: "Frontend" },
  { key: "backend", label: "Backend" },
  { key: "ai", label: "IA & Bots" },
  { key: "devops", label: "DevOps" },
  { key: "database", label: "DB" },
] as const;

type CategoryKey = (typeof categories)[number]["key"];

export function Skills() {
  const [active, setActive] = useState<CategoryKey>("all");

  const filtered =
    active === "all" ? skills : skills.filter((s) => s.category === active);

  return (
    <SectionWrapper id="skills">
      <SectionHeading
        label="Stack Técnico"
        title="Tecnologías que uso a diario"
      />

      {/* Filters */}
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActive(cat.key)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-all",
              active === cat.key
                ? "bg-violet-600 text-white"
                : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Skills grid */}
      <motion.div
        layout
        className="flex flex-wrap justify-center gap-3"
      >
        {filtered.map((skill, i) => (
          <motion.div
            key={skill.name}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, delay: i * 0.03 }}
            className="group cursor-default rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 transition-all hover:border-violet-600/50 hover:bg-zinc-900 hover:shadow-lg hover:shadow-violet-600/5"
          >
            <span className="flex items-center gap-2 text-sm">
              <span className="text-base">{skill.icon}</span>
              <span className="font-medium text-zinc-300 group-hover:text-white">
                {skill.name}
              </span>
            </span>
          </motion.div>
        ))}
      </motion.div>
    </SectionWrapper>
  );
}
