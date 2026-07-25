"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "#proyectos", label: "Proyectos" },
  { href: "#capacidades", label: "Capacidades" },
  { href: "#about", label: "Sobre mí" },
  { href: "#contacto", label: "Contacto" },
];

export function Nav() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="#"
          className="text-lg font-bold tracking-tight transition-colors hover:text-violet-400"
        >
          jistev<span className="text-violet-400">.</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm text-zinc-400 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Button size="sm" asChild>
            <Link href="#contacto">Contactar</Link>
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}
