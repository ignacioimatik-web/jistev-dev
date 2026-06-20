"use client";

import { useState } from "react";

// ─── Data ───────────────────────────────────────────────────────
const services = [
  {
    icon: "⚡",
    title: "MVP Factory",
    desc: "De idea a producto funcional en 1-2 semanas. Web apps, dashboards, prototipos.",
    price: "desde 1.000€",
  },
  {
    icon: "🤖",
    title: "Automatización con IA",
    desc: "Chatbots, GPTs custom, RAG sobre documentos, automatización de procesos con inteligencia artificial.",
    price: "desde 500€",
  },
  {
    icon: "🔄",
    title: "Automation Tools",
    desc: "Scripts Python, scraping, pipelines de datos, integración de APIs, reporting automático.",
    price: "desde 300€",
  },
  {
    icon: "💬",
    title: "Bots & APIs",
    desc: "Bots para Telegram/WhatsApp, APIs REST, webhooks, sistemas de notificaciones.",
    price: "desde 400€",
  },
];

const projects = [
  {
    title: "AI Blog Writer",
    desc: "Generador automático de artículos SEO con IA. Investigación, redacción y publicación automatizada.",
    tech: ["Python", "OpenAI", "LangChain", "Next.js"],
  },
  {
    title: "Telegram Bot Manager",
    desc: "Bot de Telegram para gestión de incidencias con notificaciones, roles y dashboard web.",
    tech: ["Python", "Telegraf", "Supabase", "Vercel"],
  },
  {
    title: "Smart Home Controller",
    desc: "Panel de control unificado para dispositivos IoT con automatización solar y meteorológica.",
    tech: ["Python", "Tuya API", "Next.js", "Tailwind"],
  },
];

const faqs = [
  {
    q: "¿Cómo trabajamos?",
    a: "Hablamos, defines lo que necesitas, te doy un presupuesto y plazo. Entrego el proyecto funcionando. Sin vueltas.",
  },
  {
    q: "¿Cuánto tardas en construir un MVP?",
    a: "Depende del proyecto, pero en 1-2 semanas tienes una primera versión funcional que puedes mostrar y testear.",
  },
  {
    q: "¿Ofreces mantenimiento?",
    a: "Sí. Todos los proyectos incluyen 30 días de soporte post-entrega. Después podemos acordar un plan de mantenimiento.",
  },
  {
    q: "¿Trabajas con startups o con empresas tradicionales?",
    a: "Con ambas. Desde founders que necesitan su MVP ayer hasta empresas que quieren automatizar procesos manuales.",
  },
];

// ─── Components ──────────────────────────────────────────────────

function Nav() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <span className="text-lg font-bold tracking-tight">
          jistev<span className="text-violet-400">.</span>
        </span>
        <div className="hidden items-center gap-8 text-sm text-zinc-400 sm:flex">
          <a href="#servicios" className="transition-colors hover:text-white">
            Servicios
          </a>
          <a href="#proyectos" className="transition-colors hover:text-white">
            Proyectos
          </a>
          <a href="#faq" className="transition-colors hover:text-white">
            FAQ
          </a>
          <a
            href="#contacto"
            className="rounded-full bg-violet-600 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-violet-500"
          >
            Contactar
          </a>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-20 text-center">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/50 px-4 py-1.5 text-xs text-zinc-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Disponible para nuevos proyectos
        </div>
        <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          Convierto tus ideas en{" "}
          <span className="gradient-text">productos digitales</span>
        </h1>
        <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-zinc-400">
          Desarrollo web, automatizaciones con IA y herramientas a medida.
          Construyo tu proyecto mientras tú te centras en lo que importa.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="#contacto"
            className="w-full rounded-full bg-violet-600 px-8 py-3.5 text-sm font-medium text-white transition-all hover:bg-violet-500 sm:w-auto"
          >
            Solicitar presupuesto
          </a>
          <a
            href="#proyectos"
            className="w-full rounded-full border border-zinc-700 px-8 py-3.5 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-600 hover:text-white sm:w-auto"
          >
            Ver proyectos →
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="relative z-10 mt-20 grid grid-cols-2 gap-8 sm:grid-cols-4">
        {[
          { n: "50+", l: "Proyectos entregados" },
          { n: "30+", l: "Clientes satisfechos" },
          { n: "2 sem", l: "MVP funcional" },
          { n: "100%", l: "Compromiso" },
        ].map((s) => (
          <div key={s.l} className="text-center">
            <div className="gradient-text text-2xl font-bold sm:text-3xl">
              {s.n}
            </div>
            <div className="mt-1 text-xs text-zinc-500">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="servicios" className="border-t border-zinc-800 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-2 text-center text-sm font-medium uppercase tracking-widest text-violet-400">
          Servicios
        </h2>
        <p className="mb-16 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Lo que puedo hacer por ti
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          {services.map((s) => (
            <div
              key={s.title}
              className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-900"
            >
              <span className="mb-4 block text-3xl">{s.icon}</span>
              <h3 className="mb-2 text-lg font-semibold">{s.title}</h3>
              <p className="mb-4 text-sm leading-relaxed text-zinc-400">
                {s.desc}
              </p>
              <span className="text-sm font-medium text-violet-400">
                {s.price}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Projects() {
  return (
    <section id="proyectos" className="border-t border-zinc-800 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-2 text-center text-sm font-medium uppercase tracking-widest text-violet-400">
          Proyectos
        </h2>
        <p className="mb-16 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Trabajo reciente
        </p>
        <div className="grid gap-6 sm:grid-cols-3">
          {projects.map((p) => (
            <div
              key={p.title}
              className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-zinc-700"
            >
              <h3 className="mb-2 text-lg font-semibold">{p.title}</h3>
              <p className="mb-4 text-sm leading-relaxed text-zinc-400">
                {p.desc}
              </p>
              <div className="flex flex-wrap gap-2">
                {p.tech.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="border-t border-zinc-800 px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-2 text-center text-sm font-medium uppercase tracking-widest text-violet-400">
          FAQ
        </h2>
        <p className="mb-16 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Preguntas frecuentes
        </p>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-zinc-800"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-medium transition-colors hover:bg-zinc-900/50"
              >
                {f.q}
                <span
                  className={`ml-4 text-zinc-500 transition-transform ${
                    open === i ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>
              {open === i && (
                <div className="border-t border-zinc-800 px-6 py-4 text-sm leading-relaxed text-zinc-400">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contacto" className="border-t border-zinc-800 px-6 py-24">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          ¿Hablamos?
        </h2>
        <p className="mb-10 text-zinc-400">
          Cuéntame tu proyecto y te respondo en menos de 24h con presupuesto y
          plazo.
        </p>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8">
          <form className="space-y-4 text-left">
            <div>
              <label className="mb-1.5 block text-sm text-zinc-400">
                Nombre
              </label>
              <input
                type="text"
                placeholder="Tu nombre"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition-colors focus:border-violet-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-zinc-400">
                Email
              </label>
              <input
                type="email"
                placeholder="tu@email.com"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition-colors focus:border-violet-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-zinc-400">
                Cuéntame tu proyecto
              </label>
              <textarea
                rows={4}
                placeholder="¿Qué necesitas construir? ¿Cuándo lo necesitas? ¿Cuál es tu presupuesto?"
                className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition-colors focus:border-violet-500"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-violet-600 py-3.5 text-sm font-medium text-white transition-all hover:bg-violet-500"
            >
              Enviar mensaje
            </button>
          </form>

          <div className="mt-6 border-t border-zinc-800 pt-6">
            <p className="mb-2 text-sm text-zinc-500">O escríbeme directo:</p>
            <a
              href="mailto:hola@jistev.dev"
              className="text-sm text-violet-400 transition-colors hover:text-violet-300"
            >
              hola@jistev.dev
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-800 px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-sm text-zinc-600 sm:flex-row">
        <span>© 2026 jistev.dev</span>
        <div className="flex gap-6">
          <a href="#" className="transition-colors hover:text-zinc-400">
            GitHub
          </a>
          <a href="#" className="transition-colors hover:text-zinc-400">
            LinkedIn
          </a>
          <a href="#" className="transition-colors hover:text-zinc-400">
            Upwork
          </a>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ────────────────────────────────────────────────────────

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Services />
        <Projects />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
