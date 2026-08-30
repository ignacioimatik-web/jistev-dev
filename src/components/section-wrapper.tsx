"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/lib/motion";

interface SectionWrapperProps {
  children: ReactNode;
  id?: string;
  className?: string;
  delay?: number;
}

export function SectionWrapper({ children, id, className, delay = 0 }: SectionWrapperProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: EASE_OUT }}
      className={cn("border-t border-line px-6 py-24", className)}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </motion.section>
  );
}

export function SectionHeading({
  label,
  title,
}: {
  label: string;
  title: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      className="mb-16 text-left"
    >
      <span className="mb-3 inline-block font-mono text-xs uppercase tracking-[1.5px] text-cyan-400">
        {"//"} {label}
      </span>
      <h2 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-[40px]">
        {title}
      </h2>
    </motion.div>
  );
}