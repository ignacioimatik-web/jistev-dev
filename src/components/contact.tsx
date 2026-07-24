"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { SectionWrapper, SectionHeading } from "@/components/section-wrapper";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Send } from "lucide-react";

export function Contact() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);

    // mailto fallback
    const subject = encodeURIComponent(
      `Nuevo proyecto: ${(data.get("name") as string) || "sin nombre"}`
    );
    const body = encodeURIComponent(
      `Nombre: ${data.get("name") || ""}\nEmail: ${data.get("email") || ""}\n\nMensaje:\n${data.get("message") || ""}`
    );
    window.location.href = `mailto:hola@jistev.dev?subject=${subject}&body=${body}`;
    setSent(true);
    setTimeout(() => setSent(false), 4000);
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
          className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
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
            <Button type="submit" className="w-full gap-2" size="lg">
              {sent ? (
                <>¡Enviado! ✅</>
              ) : (
                <>
                  Enviar mensaje <Send className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 border-t border-zinc-800 pt-6">
            <p className="mb-2 text-sm text-zinc-500">O escríbeme directo:</p>
            <a
              href="mailto:hola@jistev.dev"
              className="inline-flex items-center gap-2 text-sm text-violet-400 transition-colors hover:text-violet-300"
            >
              <Mail className="h-4 w-4" />
              hola@jistev.dev
            </a>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
