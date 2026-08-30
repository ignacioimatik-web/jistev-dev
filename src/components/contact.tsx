"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { SectionWrapper, SectionHeading } from "@/components/section-wrapper";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Send, CheckCircle, AlertCircle } from "lucide-react";

export function Contact() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
      website: (form.elements.namedItem("website") as HTMLInputElement).value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Error al enviar");

      setStatus("sent");
      form.reset();
      setTimeout(() => setStatus("idle"), 5000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  return (
    <SectionWrapper id="contacto">
      <SectionHeading label="Contacto" title="¿Hablamos?" />

      <div className="mx-auto max-w-xl text-center">
        <p className="mb-10 text-zinc-400">
          Cuéntame tu proyecto y te respondo en menos de 24h con presupuesto y
          plazo.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-line bg-card/50 p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Honeypot anti-spam: invisible para personas, los bots lo rellenan igualmente */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute left-[-9999px] h-0 w-0 opacity-0"
            />
            <div>
              <label className="mb-1.5 block text-sm text-zinc-400">
                Nombre
              </label>
              <Input name="name" placeholder="Tu nombre" required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-zinc-400">
                Email
              </label>
              <Input
                name="email"
                type="email"
                placeholder="tu@email.com"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-zinc-400">
                Cuéntame tu proyecto
              </label>
              <Textarea
                name="message"
                placeholder="¿Qué necesitas construir? ¿Cuándo lo necesitas?"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full gap-2"
              size="lg"
              disabled={status === "sending"}
            >
              {status === "sending" ? (
                <>Enviando…</>
              ) : status === "sent" ? (
                <>
                  ¡Enviado! <CheckCircle className="h-4 w-4" />
                </>
              ) : status === "error" ? (
                <>
                  Error  -  intenta de nuevo <AlertCircle className="h-4 w-4" />
                </>
              ) : (
                <>
                  Enviar mensaje <Send className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 border-t border-line pt-6">
            <p className="mb-2 text-sm text-zinc-500">O escríbeme directo:</p>
            <a
              href="mailto:ignacio@digitalcode.es"
              className="inline-flex items-center gap-2 text-sm text-orange-400 transition-colors hover:text-orange-300"
            >
              <Mail className="h-4 w-4" />
              ignacio@digitalcode.es
            </a>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
