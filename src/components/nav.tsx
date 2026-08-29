"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const navLinks = [
  { href: "#about", label: "sobre-mi" },
  { href: "#capacidades", label: "capacidades" },
  { href: "#proyectos", label: "proyectos" },
  { href: "#conceptos", label: "conceptos" },
  { href: "#metodo", label: "metodo" },
  { href: "#skills", label: "stack" },
  { href: "#contacto", label: "contacto" },
];

export function Nav() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 z-50 w-full border-b border-zinc-800 bg-[#0b0d10]/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="#"
          className="font-mono text-base font-bold tracking-tight transition-colors hover:text-cyan-400"
        >
          ~/jistev<span className="text-cyan-400">_</span>
        </Link>

        <div className="hidden items-center gap-8 font-mono text-[13px] text-zinc-400 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="#contacto"
            className="rounded-[8px] border border-zinc-700 px-4 py-2 text-[13px] text-zinc-200 transition-colors hover:border-violet-500 hover:text-violet-400"
          >
            $ start
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}