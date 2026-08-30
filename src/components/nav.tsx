"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  { href: "http://100.125.239.37:3001", label: "novaTerm" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

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

        {/* Desktop */}
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

        {/* Mobile: hamburguesa */}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-line text-zinc-300 transition-colors hover:border-cyan-500/50 hover:text-cyan-400 sm:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            className="h-5 w-5"
            aria-hidden
          >
            {open ? (
              <path d="M18 6 6 18M6 6l12 12" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile: panel de menú */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
            className="overflow-hidden border-b border-line bg-background/95 backdrop-blur-xl sm:hidden"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4 font-mono text-sm">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className="rounded-[8px] px-3 py-2.5 text-zinc-300 transition-colors hover:bg-subtle/60 hover:text-cyan-300"
                >
                  {link.label}
                </Link>
              ))}
              <div className="my-2 h-px bg-line/60" aria-hidden />
              {extExternal.map((ext) => (
                <a
                  key={ext.href}
                  href={ext.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                  className="rounded-[8px] px-3 py-2.5 text-zinc-400 transition-colors hover:bg-subtle/60 hover:text-cyan-400"
                >
                  {ext.label}↗
                </a>
              ))}
              <Link
                href="#contacto"
                onClick={close}
                className="mt-2 rounded-[8px] border border-line px-4 py-2.5 text-center text-zinc-200 transition-colors hover:border-orange-500 hover:text-orange-400"
              >
                $ start
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}