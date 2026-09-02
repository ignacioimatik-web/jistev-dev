"use client";

// Widget de chat embebido. Habla con rutas propias de este despliegue
// (/api/telegram/*); el server de Vercel añade la API key y reenvía al puente
// (VPS). El navegador nunca ve el secreto ni la URL del puente.

import { useState, useEffect, useRef, type FormEvent } from "react";
import { MessageCircle, X, Send, Paperclip, FileText } from "lucide-react";

type Msg = { from: "user" | "owner"; text: string };

export function TelegramChat() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [attached, setAttached] = useState<{ name: string; type: string; data: string } | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "starting">("idle");
  const listRef = useRef<HTMLDivElement>(null);

  // Cada visitante (pestaña/navegador) mantiene su PROPIA sesión, persistida en
  // localStorage para que sobreviva a recargas. Varios clientes a la vez OK.
  const SESSION_KEY = "tg-chat-session";

  // Crear (o recuperar) la sesión al abrir el chat.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      // 1) Intentar reutilizar la sesión de este navegador.
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        setSession(stored);
        setStatus("idle");
        return;
      }
      // 2) Crear una sesión nueva si no hay ninguna.
      setStatus("starting");
      try {
        const res = await fetch("/api/telegram/session");
        const data = await res.json();
        if (cancelled) return;
        localStorage.setItem(SESSION_KEY, data.sessionId);
        setSession(data.sessionId);
        setStatus("idle");
      } catch {
        if (!cancelled) setStatus("idle");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Polling: cada 3s preguntamos si el dueño respondió a esta sesión.
  useEffect(() => {
    if (!open || !session) return;
    const t = setInterval(async () => {
      try {
        const res = await fetch(`/api/telegram/poll?session=${session}`);
        const data = await res.json();
        if (data.reply) {
          setMessages((prev) => [...prev, { from: "owner", text: data.reply }]);
        }
      } catch {
        /* silencio */
      }
    }, 3000);
    return () => clearInterval(t);
  }, [open, session]);

  // Auto-scroll al último mensaje.
  useEffect(() => {
    listRef.current?.scrollTo?.({ top: listRef.current.scrollHeight });
  }, [messages]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !attached) || !session) return;
    const text = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      ...(text ? [{ from: "user" as const, text }] : []),
      ...(attached ? [{ from: "user" as const, text: `📎 ${attached.name}` }] : []),
    ]);
    try {
      const payload: Record<string, unknown> = { session, message: text };
      if (name) payload.name = name;
      if (attached) payload.file = { name: attached.name, mimeType: attached.type, base64: attached.data };
      await fetch("/api/telegram/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setAttached(null);
    } catch {
      /* sin red */
    }
  };

  // Adjunto: leer archivo como base64 (capa 20 MB, límites de Telegram/API).
  const handleAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) {
      alert("Máximo 20MB por adjunto.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const data = String(reader.result).split(",")[1] ?? "";
      setAttached({ name: f.name, type: f.type, data });
    };
    reader.readAsDataURL(f);
  };

  const startUrl = `https://t.me/jistevbot?start=${session}`;

  return (
    <>
      {/* Botón flotante + etiqueta */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {!open && (
          <span className="rounded-full border border-line bg-card/90 px-3 py-1.5 text-sm font-medium text-zinc-300 shadow-lg backdrop-blur">
            ¿hablamos?
          </span>
        )}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir chat de contacto"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2AABEE] text-white shadow-xl shadow-[#2AABEE]/30 transition-transform hover:scale-105"
        >
          {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </button>
      </div>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[480px] w-[360px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 bg-[#2AABEE] px-4 py-3 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">jistev — contacto</p>
              <p className="text-xs text-white/80">Respuesta en menos de 24h</p>
            </div>
          </div>

          {/* Cuerpo */}
          <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto p-4">
            {messages.length === 0 && (
              <p className="text-center text-sm text-zinc-500">
                {status === "starting"
                  ? "Conectando con el dueño…"
                  : "¿En qué puedo ayudarte? Cuéntame tu proyecto."}
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  m.from === "user"
                    ? "ml-auto bg-[#2AABEE] text-white"
                    : "bg-zinc-800 text-zinc-100"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          {/* Input */}
          {session ? (
            <div className="border-t border-line p-3">
              {/* Nombre del cliente (opcional) */}
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre (opcional)"
                className="mb-2 w-full rounded-xl border border-line bg-transparent px-3 py-1.5 text-xs text-foreground outline-none focus:border-orange-400"
              />
              {/* Adjunto seleccionado */}
              {attached && (
                <div className="mb-2 flex items-center gap-2 rounded-lg border border-line bg-zinc-800/60 px-2 py-1.5 text-xs text-zinc-200">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-orange-400" />
                  <span className="flex-1 truncate">{attached.name}</span>
                  <button
                    type="button"
                    onClick={() => setAttached(null)}
                    aria-label="Quitar adjunto"
                    className="text-zinc-400 hover:text-zinc-200"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <label className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-zinc-400 transition-colors hover:text-orange-400">
                  <Paperclip className="h-4 w-4" />
                  <input type="file" className="hidden" accept="*/*" onChange={handleAttach} />
                </label>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe tu mensaje… 😀"
                  className="flex-1 rounded-xl border border-line bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-orange-400"
                />
                <button
                  type="submit"
                  aria-label="Enviar"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2AABEE] text-white transition-colors hover:bg-[#229ED9]"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
              <p className="mt-2 text-center text-[11px] text-zinc-500">
                Puedes adjuntar archivos (máx. 20 MB).
              </p>
            </div>
          ) : (
            <div className="border-t border-line p-4">
              <p className="mb-2 text-center text-xs text-zinc-400">
                Pulsa para iniciar el chat con el dueño (es un único paso).
              </p>
              <a
                href={startUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  setTimeout(() => setStatus("starting"), 500)
                }
                className="block rounded-xl bg-[#2AABEE] py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-[#229ED9]"
              >
                Iniciar chat en Telegram
              </a>
              <p className="mt-2 text-center text-[11px] text-zinc-500">
                Tras iniciar, vuelve aquí y escribe directamente.
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}