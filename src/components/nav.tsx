"use client";

import { motion } from "framer-motion";
import { EASE_OUT } from "@/lib/motion";
import Link from "next/link";

const navLinks = [
  { href: "#about", label: "sobre-mi" },
  { href: "#capacidades", label: "capacidades" },
  { href: "#conceptos", label: "conceptos" },
  { href: "#metodo", label: "metodo" },
  { href: "#skills", label: "stack" },
  { href: "#contacto", label: "contacto" },
  { href: "/correo", label: "correo" },
];

const extExternal = [
  { href: "https://studiomo.jazzone.click/", label: "studioMo" },
  { href: "https://jazzone-suite.vercel.app/", label: "jazzone" },
  { href: "http://macbook-air-m4:3001", label: "novaTerm" },
];

export function Nav() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      className="fixed top-0 z-50 w-full border-b border-line bg-background/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link
          href="#"
          className="flex items-center gap-2 font-mono text-base font-bold tracking-tight transition-colors hover:text-cyan-400"
        >
          ~/jistev<span className="text-cyan-400">_</span>
          <img
            src="/logo.png"
            alt=""
            aria-hidden
            className="h-5 w-5 shrink-0"
          />
        </Link>

        <div className="hidden items-center gap-5 font-mono text-[13px] text-zinc-400 sm:flex">
          {navLinks.map((link, i) => (
            <span key={link.href} className="contents">
              <Link
                href={link.href}
                className="whitespace-nowrap transition-colors hover:text-white"
              >
                {link.label}
              </Link>
              {i === navLinks.length - 2 && (
                <span className="h-4 w-px bg-line/60" aria-hidden />
              )}
            </span>
          ))}
          <span className="h-4 w-px bg-line/60" aria-hidden />
          {extExternal.map((ext) => (
            <a
              key={ext.href}
              href={ext.href}
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap transition-colors hover:text-cyan-400"
            >
              {ext.label}↗
            </a>
          ))}
          <Link
            href="#contacto"
            className="whitespace-nowrap rounded-[8px] border border-line px-4 py-2 text-[13px] text-zinc-200 transition-colors hover:border-orange-500 hover:text-orange-400"
          >
            $ start
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}