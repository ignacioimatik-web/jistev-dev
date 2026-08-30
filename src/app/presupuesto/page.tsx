"use client";

import { useState, useRef, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// ─── Servicios y precios ─────────────────────────────────────
const SERVICES = [
  {
    id: "mvp",
    name: "MVP Factory",
    desc: "Web app, dashboard o prototipo full-stack en 1-2 semanas.",
    price: 1000,
  },
  {
    id: "ia",
    name: "Automatización con IA",
    desc: "Chatbots, RAG, GPTs custom, sistemas que aprenden.",
    price: 500,
  },
  {
    id: "tools",
    name: "Automation Tools",
    desc: "Scripts Python, scraping, pipelines, reporting.",
    price: 300,
  },
  {
    id: "bots",
    name: "Bots & APIs",
    desc: "Bots Telegram/WhatsApp, APIs REST, webhooks.",
    price: 400,
  },
  {
    id: "full",
    name: "Proyecto Completo",
    desc: "Combinación de varios servicios. Presupuesto personalizado.",
    price: -1, // custom
  },
];

// ─── Iconos premium (SVG de marca, gradiente naranja→cian) ────
const SERVICE_PATHS: Record<string, ReactNode> = {
  mvp: (
    <>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </>
  ),
  ia: (
    <>
      <path d="M9.94 15.5a2 2 0 0 0-1.44-1.44l-6.13-1.58a.5.5 0 0 1 0-.96l6.13-1.58A2 2 0 0 0 9.94 8.5l1.58-6.13a.5.5 0 0 1 .96 0l1.58 6.13a2 2 0 0 0 1.44 1.44l6.13 1.58a.5.5 0 0 1 0 .96l-6.13 1.58a2 2 0 0 0-1.44 1.44l-1.58 6.13a.5.5 0 0 1-.96 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
      <path d="M4 17v2" />
      <path d="M5 18H3" />
    </>
  ),
  tools: (
    <>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  bots: (
    <>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
    </>
  ),
  full: (
    <>
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </>
  ),
};

const TIMELINE_OPTIONS = [
  { value: "urgente", label: "Urgente (menos de 1 semana)", multiplier: 1.5 },
  { value: "normal", label: "Normal (1-3 semanas)", multiplier: 1 },
  { value: "flexible", label: "Sin prisa (1-2 meses)", multiplier: 0.85 },
];

// ─── Steps ────────────────────────────────────────────────────
const TOTAL_STEPS = 4;

// ─── Tipos ────────────────────────────────────────────────────
interface FormData {
  services: string[];
  name: string;
  email: string;
  company: string;
  description: string;
  timeline: string;
  budget: string;
}

const emptyForm: FormData = {
  services: [],
  name: "",
  email: "",
  company: "",
  description: "",
  timeline: "normal",
  budget: "",
};

// ─── Cálculo de presupuesto ───────────────────────────────────
function calcBudget(services: string[], timeline: string): {
  items: { name: string; price: number }[];
  total: number;
} {
  const items: { name: string; price: number }[] = [];
  const tl = TIMELINE_OPTIONS.find((t) => t.value === timeline) || TIMELINE_OPTIONS[1];

  for (const id of services) {
    if (id === "full") continue;
    const svc = SERVICES.find((s) => s.id === id);
    if (svc) items.push({ name: svc.name, price: Math.round(svc.price * tl.multiplier) });
  }

  const total = items.reduce((sum, i) => sum + i.price, 0);
  return { items, total };
}

// ─── Componente principal ─────────────────────────────────────
export default function PresupuestoPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const quoteRef = useRef<HTMLDivElement>(null);

  const updateForm = (key: keyof FormData, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleService = (id: string) => {
    const curr = form.services;
    if (curr.includes(id)) {
      updateForm("services", curr.filter((s) => s !== id));
    } else {
      if (id === "full") {
        updateForm("services", ["full"]);
      } else {
        updateForm("services", [...curr.filter((s) => s !== "full"), id]);
      }
    }
  };

  const canContinue = useCallback((): boolean => {
    if (step === 1) return form.services.length > 0;
    if (step === 2) return form.name.trim().length > 0 && form.email.trim().length > 0 && form.description.trim().length > 0;
    return true;
  }, [step, form]);

  const handleSubmit = async () => {
    setSending(true);
    setError("");
    try {
      const { items, total } = calcBudget(form.services, form.timeline);
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items, total }),
      });
      if (!res.ok) throw new Error("Error al enviar");
      setSubmitted(true);
      setStep(TOTAL_STEPS);
    } catch (e) {
      setError("Error al enviar. Intenta de nuevo o escríbeme directamente.");
    } finally {
      setSending(false);
    }
  };

  const downloadPDF = () => {
    if (!quoteRef.current) return;
    const el = quoteRef.current;
    el.classList.remove("hidden");
    window.print();
    setTimeout(() => el.classList.add("hidden"), 500);
  };

  // ─── Layout ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-line bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 font-mono text-base font-bold tracking-tight hover:text-cyan-400">
            ~/jistev<span className="text-cyan-400">_</span>
            <img
              src="/logo.png"
              alt=""
              aria-hidden
              className="h-5 w-5 shrink-0"
            />
          </Link>
          <Link href="/" className="text-sm text-zinc-400 transition-colors hover:text-white">
            ← Volver
          </Link>
        </div>
      </nav>

      <main className="pt-24">
        <div className="mx-auto max-w-3xl px-6 pb-24">
          {/* Header */}
          <div className="mb-10 text-center">
            <span className="mb-2 block text-sm font-medium uppercase tracking-widest text-orange-400">
              Presupuesto
            </span>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Solicita tu presupuesto
            </h1>
            <p className="mt-3 text-zinc-400">
              Cuéntame qué necesitas y te envío un presupuesto detallado en menos de 24h.
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-10">
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: TOTAL_STEPS - (submitted ? 0 : 0) }, (_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      i + 1 <= step
                        ? "bg-orange-600 text-white"
                        : "bg-subtle text-zinc-500"
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < TOTAL_STEPS - 1 && (
                    <div
                      className={`h-1 w-12 rounded transition-all ${
                        i + 1 < step ? "bg-orange-600" : "bg-subtle"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <StepServices
                key="step1"
                selected={form.services}
                onToggle={toggleService}
                timeline={form.timeline}
                onTimelineChange={(v) => updateForm("timeline", v)}
                onNext={() => setStep(2)}
                canContinue={canContinue()}
              />
            )}
            {step === 2 && (
              <StepDetails
                key="step2"
                form={form}
                onChange={updateForm}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
                canContinue={canContinue()}
              />
            )}
            {step === 3 && (
              <StepReview
                key="step3"
                form={form}
                budget={calcBudget(form.services, form.timeline)}
                onBack={() => setStep(2)}
                onSubmit={handleSubmit}
                sending={sending}
                error={error}
              />
            )}
            {step === 4 && (
              <StepConfirmation
                key="step4"
                form={form}
                quoteRef={quoteRef}
                onDownload={downloadPDF}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Hidden printable quote */}
      <div ref={quoteRef} className="hidden print:block">
        <PrintableQuote
          form={form}
          budget={calcBudget(form.services, form.timeline)}
        />
      </div>
    </div>
  );
}

// ─── Step 1: Selección de servicios ───────────────────────────
function StepServices({
  selected,
  onToggle,
  timeline,
  onTimelineChange,
  onNext,
  canContinue,
}: {
  selected: string[];
  onToggle: (id: string) => void;
  timeline: string;
  onTimelineChange: (v: string) => void;
  onNext: () => void;
  canContinue: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
    >
      <h2 className="mb-6 text-xl font-semibold">¿Qué necesitas?</h2>

      <div className="mb-8 space-y-3">
        {SERVICES.map((svc) => {
          const isSelected = selected.includes(svc.id);
          return (
            <button
              key={svc.id}
              onClick={() => onToggle(svc.id)}
              className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                isSelected
                  ? "border-orange-600 bg-orange-600/10"
                  : "border-line bg-card/60 hover:border-muted/40"
              }`}
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br from-orange-500/15 via-transparent to-cyan-400/10 transition-colors ${
                  isSelected ? "border-orange-500/60" : "border-line/80"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={`url(#sg-${svc.id})`}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 drop-shadow-[0_0_6px_rgba(249,115,22,0.3)]"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id={`sg-${svc.id}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#fb923c" />
                      <stop offset="55%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                  </defs>
                  {SERVICE_PATHS[svc.id]}
                </svg>
              </span>
              <div className="flex-1">
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold">{svc.name}</span>
                  <span className="text-sm font-medium text-orange-400">
                    {svc.price > 0 ? `desde ${svc.price.toLocaleString()}€` : "A consultar"}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-zinc-400">{svc.desc}</p>
              </div>
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
                  isSelected ? "border-orange-600 bg-orange-600" : "border-muted/40"
                }`}
              >
                {isSelected && (
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="mb-8">
        <h3 className="mb-3 text-sm font-semibold text-zinc-400">¿Cuándo lo necesitas?</h3>
        <div className="flex gap-2">
          {TIMELINE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onTimelineChange(opt.value)}
              className={`flex-1 rounded-lg border p-3 text-center text-sm transition-all ${
                timeline === opt.value
                  ? "border-orange-600 bg-orange-600/10 text-orange-400"
                  : "border-line bg-card/60 text-zinc-400 hover:border-muted/40"
              }`}
            >
              <div className="font-medium">{opt.label}</div>
              <div className="mt-1 text-xs text-zinc-500">
                {opt.multiplier < 1 ? "-15%" : opt.multiplier > 1 ? "+50%" : "Estándar"}
              </div>
            </button>
          ))}
        </div>
      </div>

      <Button onClick={onNext} disabled={!canContinue} className="w-full">
        Continuar →
      </Button>
    </motion.div>
  );
}

// ─── Step 2: Datos del cliente ────────────────────────────────
function StepDetails({
  form,
  onChange,
  onBack,
  onNext,
  canContinue,
}: {
  form: FormData;
  onChange: (k: keyof FormData, v: any) => void;
  onBack: () => void;
  onNext: () => void;
  canContinue: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
    >
      <h2 className="mb-6 text-xl font-semibold">Tus datos</h2>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm text-zinc-400">Nombre *</label>
          <input
            value={form.name}
            onChange={(e) => onChange("name", e.target.value)}
            className="flex h-12 w-full rounded-xl border border-line bg-deep px-4 py-3 text-sm outline-none transition-colors placeholder:text-zinc-600 focus:border-orange-500"
            placeholder="Tu nombre"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-zinc-400">Email *</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => onChange("email", e.target.value)}
            className="flex h-12 w-full rounded-xl border border-line bg-deep px-4 py-3 text-sm outline-none transition-colors placeholder:text-zinc-600 focus:border-orange-500"
            placeholder="tu@email.com"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-zinc-400">Empresa (opcional)</label>
          <input
            value={form.company}
            onChange={(e) => onChange("company", e.target.value)}
            className="flex h-12 w-full rounded-xl border border-line bg-deep px-4 py-3 text-sm outline-none transition-colors placeholder:text-zinc-600 focus:border-orange-500"
            placeholder="Nombre de tu empresa"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-zinc-400">
            Cuéntame tu proyecto * 
            <span className="ml-2 text-zinc-600">(objetivo, funcionalidades, referencias...)</span>
          </label>
          <textarea
            value={form.description}
            onChange={(e) => onChange("description", e.target.value)}
            className="flex min-h-[140px] w-full rounded-xl border border-line bg-deep px-4 py-3 text-sm outline-none transition-colors placeholder:text-zinc-600 focus:border-orange-500 resize-none"
            placeholder="Describe tu proyecto con el máximo detalle posible..."
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-zinc-400">Presupuesto estimado (opcional)</label>
          <input
            value={form.budget}
            onChange={(e) => onChange("budget", e.target.value)}
            className="flex h-12 w-full rounded-xl border border-line bg-deep px-4 py-3 text-sm outline-none transition-colors placeholder:text-zinc-600 focus:border-orange-500"
            placeholder="Ej: 2.000€ - 5.000€"
          />
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          ← Atrás
        </Button>
        <Button onClick={onNext} disabled={!canContinue} className="flex-1">
          Revisar presupuesto →
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Step 3: Revisión y envío ─────────────────────────────────
function StepReview({
  form,
  budget,
  onBack,
  onSubmit,
  sending,
  error,
}: {
  form: FormData;
  budget: { items: { name: string; price: number }[]; total: number };
  onBack: () => void;
  onSubmit: () => void;
  sending: boolean;
  error: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
    >
      <h2 className="mb-6 text-xl font-semibold">Revisa tu presupuesto</h2>

      <div className="mb-6 rounded-2xl border border-line bg-card/60 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Desglose
        </h3>
        <div className="space-y-3">
          {budget.items.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <span className="text-sm text-zinc-300">{item.name}</span>
              <span className="text-sm font-medium">{item.price.toLocaleString()}€</span>
            </div>
          ))}
          <div className="border-t border-line pt-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total estimado</span>
              <span className="text-lg font-bold text-orange-400">
                {budget.total.toLocaleString()}€
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              * Presupuesto orientativo. El precio final puede variar según el alcance exacto.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-line bg-card/50 p-4">
        <div className="space-y-2 text-sm text-zinc-400">
          <p><span className="text-zinc-500">Nombre:</span> {form.name}</p>
          <p><span className="text-zinc-500">Email:</span> {form.email}</p>
          {form.company && <p><span className="text-zinc-500">Empresa:</span> {form.company}</p>}
          <p className="pt-2 border-t border-line">
            <span className="text-zinc-500">Descripción:</span>
            <br />{form.description}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-900/30 border border-red-800 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          ← Atrás
        </Button>
        <Button onClick={onSubmit} disabled={sending} className="flex-1">
          {sending ? "Enviando..." : "Enviar presupuesto →"}
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Step 4: Confirmación ─────────────────────────────────────
function StepConfirmation({
  form,
  quoteRef,
  onDownload,
}: {
  form: FormData;
  quoteRef: React.RefObject<HTMLDivElement | null>;
  onDownload: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="url(#sg-check)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="mx-auto mb-6 block h-16 w-16 drop-shadow-[0_0_18px_rgba(34,211,238,0.35)]"
      >
        <defs>
          <linearGradient id="sg-check" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
      <h2 className="mb-3 text-2xl font-bold">¡Presupuesto enviado!</h2>
      <p className="mb-8 text-zinc-400">
        Gracias, {form.name}. Te responderé en menos de 24h con un presupuesto detallado.
        <br />También te he enviado una copia a <strong>{form.email}</strong>.
      </p>

      <div className="flex flex-col items-center gap-4">
        <Button onClick={onDownload} className="px-8">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="url(#sg-file)"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="mr-2 inline h-4 w-4"
          >
            <defs>
              <linearGradient id="sg-file" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path d="M16 13H8" />
            <path d="M16 17H8" />
            <path d="M10 9H8" />
          </svg>
          Descargar PDF del presupuesto
        </Button>
        <div className="flex gap-4 text-sm">
          <Link href="/" className="text-orange-400 hover:text-orange-300 transition-colors">
            ← Volver al inicio
          </Link>
          <span className="text-zinc-600">·</span>
          <Link href="/#contacto" className="text-orange-400 hover:text-orange-300 transition-colors">
            Contactar directamente
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Printable Quote (PDF) ────────────────────────────────────
function PrintableQuote({
  form,
  budget,
}: {
  form: FormData;
  budget: { items: { name: string; price: number }[]; total: number };
}) {
  return (
    <div className="bg-white p-12 text-black" style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div className="mb-10 border-b-2 border-orange-600 pb-6">
        <h1 className="text-3xl font-bold text-orange-600">jistev<span style={{ color: "#f97316" }}>.</span></h1>
        <p className="mt-1 text-sm text-gray-500">Desarrollo Full-Stack & Automatización con IA</p>
      </div>

      {/* Info */}
      <div className="mb-8 flex justify-between">
        <div>
          <h2 className="text-lg font-bold">PRESUPUESTO</h2>
          <p className="text-sm text-gray-500">Fecha: {new Date().toLocaleDateString("es-ES")}</p>
          <p className="text-sm text-gray-500">Cliente: {form.name}</p>
          {form.company && <p className="text-sm text-gray-500">Empresa: {form.company}</p>}
        </div>
      </div>

      {/* Items */}
      <table className="mb-8 w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-200 text-left text-sm text-gray-500">
            <th className="pb-2">Servicio</th>
            <th className="pb-2 text-right">Importe</th>
          </tr>
        </thead>
        <tbody>
          {budget.items.map((item) => (
            <tr key={item.name} className="border-b border-gray-100">
              <td className="py-3 text-sm">{item.name}</td>
              <td className="py-3 text-right text-sm">{item.price.toLocaleString()} €</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="pt-4 text-base font-bold">TOTAL ESTIMADO</td>
            <td className="pt-4 text-right text-base font-bold text-orange-600">
              {budget.total.toLocaleString()} €
            </td>
          </tr>
        </tfoot>
      </table>

      <p className="mb-8 text-xs text-gray-400">
        * Presupuesto orientativo. El precio final se confirmará tras definir el alcance exacto del proyecto.
      </p>

      {/* Descripción */}
      <div className="mb-8 rounded-lg bg-gray-50 p-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Descripción del proyecto</h3>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{form.description}</p>
      </div>

      {/* Términos */}
      <div className="border-t-2 border-gray-200 pt-6 text-xs text-gray-400">
        <p className="mb-1">• Incluye 30 días de soporte post-entrega.</p>
        <p className="mb-1">• Forma de pago: 50% al inicio, 50% a la entrega.</p>
        <p className="mb-1">• jistev.dev  -  ignacio@digitalcode.es</p>
      </div>
    </div>
  );
}
