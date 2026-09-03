"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import {
  MessageCircle,
  X,
  Send,
  Paperclip,
  FileText,
  Mic,
  Square,
} from "lucide-react";

// Widget de chat embebido. Habla con rutas propias de este despliegue
// (/api/telegram/*); el server de Vercel añade la API key y reenvía al puente
// (VPS). El navegador nunca ve el secreto. Los ARCHIVOS GRANDES se suben DIRECTO
// al VPS (/api/upload con uploadToken) para superar el límite de 4.5MB de Vercel.

const UPLOAD_URL =
  process.env.NEXT_PUBLIC_TG_UPLOAD_URL?.replace(/\/$/, "") || "";

type Msg = { from: "user" | "owner"; text: string };
type Voice = { blob: Blob; url: string; mimeType: string; durationMs: number };
type LogEntry = { t: string; msg: string };

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function TelegramChat() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<string | null>(null);
  const [uploadToken, setUploadToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [attached, setAttached] = useState<{ name: string; type: string; data: string } | null>(null);
  const [voice, setVoice] = useState<Voice | null>(null);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "starting">("idle");
  const [activity, setActivity] = useState<LogEntry[]>([]);
  const [showLog, setShowLog] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordStartRef = useRef(0);

  // Registro de actividad del widget (visible en el panel de diagnóstico).
  function pushLog(msg: string) {
    const entry = { t: new Date().toLocaleTimeString(), msg };
    setActivity((prev) => [...prev.slice(-49), entry]);
    console.log("[tg-chat]", entry.t, msg);
  }

  // Cada visitante (pestaña/navegador) mantiene su PROPIA sesión, persistida en
  // localStorage para que sobreviva a recargas. Varios clientes a la vez OK.
  const SESSION_KEY = "tg-chat-session";
  const TOKEN_KEY = "tg-chat-uploadtoken";

  // Crear (o recuperar) la sesión al abrir el chat.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      // 1) Intentar reutilizar la sesión de este navegador.
      const stored = localStorage.getItem(SESSION_KEY);
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (stored) {
        if (storedToken) {
          setSession(stored);
          setUploadToken(storedToken);
          setStatus("idle");
          pushLog(`sesión reutilizada (${stored.slice(0, 8)}…) token OK`);
          return;
        }
        // Sesión vieja sin token de subida -> descartar y crear una nueva
        // (sin uploadToken los adjuntos caen al proxy de Vercel y fallan).
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(TOKEN_KEY);
        pushLog("sesión vieja sin token — descartada, creando nueva");
      }
      // 2) Crear una sesión nueva si no hay ninguna.
      setStatus("starting");
      pushLog("creando sesión nueva…");
      try {
        const res = await fetch("/api/telegram/session");
        const data = await res.json();
        if (cancelled) return;
        localStorage.setItem(SESSION_KEY, data.sessionId);
        localStorage.setItem(TOKEN_KEY, data.uploadToken || "");
        setSession(data.sessionId);
        setUploadToken(data.uploadToken || null);
        setStatus("idle");
        pushLog(
          `sesión creada (${data.sessionId.slice(0, 8)}…) token ${data.uploadToken ? "OK" : "FALTA"}`
        );
      } catch (e) {
        if (!cancelled) setStatus("idle");
        pushLog(`ERROR creando sesión: ${(e as Error).message}`);
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

  // ── Grabación de voz ──────────────────────────────────────────────
  // MediaRecorder captura en webm/opus (o mp4 como respaldo). El puente lo
  // convierte a OGG (voice) o MP3 (audio) y lo entrega a Telegram.
  // Usamos un REF para el estado de grabación (no el estado de React) para
  // evitar closures obsoletos al pulsar rápido.
  const recordingRef = useRef(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const recTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function toggleRecord() {
    if (recordingRef.current) {
      recorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      recordStartRef.current = Date.now();
      setRecSeconds(0);
      rec.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (recTimerRef.current) {
          clearInterval(recTimerRef.current);
          recTimerRef.current = null;
        }
        const mimeType = rec.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const durationMs = Date.now() - recordStartRef.current;
        // Validación: grabación vacía o casi vacía -> no enviar, avisar.
        if (blob.size < 2000 || durationMs < 800) {
          pushLog(`grabación descartada: ${blob.size} bytes, ${Math.round(durationMs / 1000)}s`);
          alert("La grabación quedó vacía o fue demasiado corta. Pulsa 🎤, espera a que se ponga rojo y vuelve a intentarlo.");
          setVoice(null);
        } else {
          pushLog(`grabación OK: ${blob.size} bytes, ${Math.round(durationMs / 1000)}s (${mimeType})`);
          setVoice({
            blob,
            url: URL.createObjectURL(blob),
            mimeType,
            durationMs,
          });
        }
        setRecording(false);
        recordingRef.current = false;
        setRecSeconds(0);
        recorderRef.current = null;
      };
      rec.start();
      recorderRef.current = rec;
      recordingRef.current = true;
      setRecording(true);
      recTimerRef.current = setInterval(() => {
        setRecSeconds((s) => s + 1);
      }, 1000);
    } catch {
      alert("No pude acceder al micrófono. Revisa los permisos del navegador.");
    }
  }

  function cancelVoice() {
    if (voice) URL.revokeObjectURL(voice.url);
    setVoice(null);
  }

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !attached && !voice) || !session) return;
    const text = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      ...(text ? [{ from: "user" as const, text }] : []),
      ...(attached ? [{ from: "user" as const, text: `📎 ${attached.name}` }] : []),
      ...(voice ? [{ from: "user" as const, text: "🎤 Nota de voz" }] : []),
    ]);
    pushLog(`enviando: texto=${text ? "sí" : "no"} adjunto=${attached?.name ?? "no"} voz=${voice ? "sí" : "no"}`);
    try {
      // 1) Archivo grande -> subida DIRECTA al VPS (no pasa por el proxy de Vercel,
      //    que tiene límite de 4.5MB). Requiere UPLOAD_URL y el uploadToken.
      if (attached && UPLOAD_URL && uploadToken) {
        pushLog(`subiendo ${attached.name} (${(attached.data.length * 3) / 4 / 1024 / 1024 > 1 ? ((attached.data.length * 3) / 4 / 1024 / 1024).toFixed(1) + " MB" : Math.round((attached.data.length * 3) / 4 / 1024) + " KB"}) directo al VPS…`);
        const uploadPayload = {
          sessionId: session,
          uploadToken,
          file: { name: attached.name, mimeType: attached.type, base64: attached.data, isVoice: false },
        };
        const upRes = await fetch(`${UPLOAD_URL}/api/upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(uploadPayload),
        });
        const upData = await upRes.json().catch(() => ({}));
        pushLog(`upload HTTP ${upRes.status}: ${JSON.stringify(upData)}`);
      } else if (attached) {
        pushLog("⚠ adjunto irá por el proxy de Vercel (sin UPLOAD_URL/token) — puede fallar si es grande");
      }
      // 1b) Nota de voz -> también subida directa (isVoice=true la enruta a sendVoice).
      if (voice && UPLOAD_URL && uploadToken) {
        const data = await blobToBase64(voice.blob);
        pushLog("subiendo nota de voz directo al VPS…");
        const uploadPayload = {
          sessionId: session,
          uploadToken,
          file: {
            name: "voz.webm",
            mimeType: voice.mimeType,
            base64: data,
            isVoice: true,
            duration_ms: voice.durationMs,
          },
        };
        const upRes = await fetch(`${UPLOAD_URL}/api/upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(uploadPayload),
        });
        const upData = await upRes.json().catch(() => ({}));
        pushLog(`upload voz HTTP ${upRes.status}: ${JSON.stringify(upData)}`);
        cancelVoice();
      }
      // 2) Texto (+ ref archivo si algo pequeño sin upload directo) -> proxy.
      const payload: Record<string, unknown> = { session, message: text };
      if (name) payload.name = name;
      if (attached && (!UPLOAD_URL || !uploadToken)) {
        payload.file = { name: attached.name, mimeType: attached.type, base64: attached.data };
      }
      // 2b) Voz sin upload directo -> por el proxy (voice).
      if (voice && (!UPLOAD_URL || !uploadToken)) {
        const data = await blobToBase64(voice.blob);
        payload.voice = { mimeType: voice.mimeType, base64: data, duration_ms: voice.durationMs };
        cancelVoice();
      }
      pushLog("enviando por proxy /api/telegram/send…");
      const res = await fetch("/api/telegram/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      pushLog(`send HTTP ${res.status}: ${JSON.stringify(data)}`);
      setAttached(null);
    } catch (err) {
      pushLog(`ERROR de red: ${(err as Error).message}`);
    }
  };

  // Adjunto: leer archivo como base64 (capa 20 MB, límites de Telegram/API).
  const handleAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) {
      alert("Máximo 20MB por adjunto.");
      pushLog(`archivo rechazado por tamaño: ${f.name} (${(f.size / 1024 / 1024).toFixed(1)} MB)`);
      return;
    }
    pushLog(`adjuntando ${f.name} (${f.size > 1024 * 1024 ? (f.size / 1024 / 1024).toFixed(2) + " MB" : Math.round(f.size / 1024) + " KB"}, ${f.type || "sin tipo"})`);
    const reader = new FileReader();
    reader.onload = () => {
      const data = String(reader.result).split(",")[1] ?? "";
      setAttached({ name: f.name, type: f.type, data });
      pushLog(`archivo leído: ${(data.length * 3) / 4 / 1024 / 1024 > 1 ? ((data.length * 3) / 4 / 1024 / 1024).toFixed(2) + " MB" : Math.round((data.length * 3) / 4 / 1024) + " KB"} base64`);
    };
    reader.onerror = () => pushLog(`ERROR leyendo archivo ${f.name}`);
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
              {/* Voz grabada (previsualización) */}
              {voice && (
                <div className="mb-2 flex items-center gap-2 rounded-lg border border-line bg-zinc-800/60 px-2 py-1.5">
                  <audio controls src={voice.url} className="h-9 min-w-0 flex-1" />
                  <button
                    type="button"
                    onClick={cancelVoice}
                    aria-label="Descartar nota de voz"
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
                {/* Botón micrófono: graba/para la nota de voz */}
                <button
                  type="button"
                  onClick={toggleRecord}
                  disabled={!!voice}
                  aria-label={recording ? "Parar grabación" : "Grabar nota de voz"}
                  title={recording ? "Parar grabación" : "Grabar nota de voz"}
                  className={`flex h-9 shrink-0 items-center justify-center gap-1 rounded-full px-2 transition-colors disabled:opacity-40 ${
                    recording ? "bg-red-500 text-white animate-pulse" : "text-zinc-400 hover:text-orange-400"
                  }`}
                >
                  {recording ? (
                    <>
                      <Square className="h-3.5 w-3.5" />
                      <span className="text-[11px] font-semibold tabular-nums">{recSeconds}s</span>
                    </>
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={recording ? "Grabando… pulsa para parar" : "Escribe tu mensaje… 😀"}
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
                Puedes adjuntar archivos (máx. 20 MB) o grabar una nota de voz.
              </p>

              {/* Panel de diagnóstico (log de actividad) */}
              <div className="mt-2 border-t border-line pt-2">
                <button
                  type="button"
                  onClick={() => setShowLog((v) => !v)}
                  className="text-[10px] uppercase tracking-wide text-zinc-500 hover:text-zinc-300"
                >
                  {showLog ? "▾ Ocultar diagnóstico" : "▸ Diagnóstico"} ({activity.length})
                </button>
                {showLog && (
                  <pre className="mt-1 max-h-28 overflow-y-auto rounded-lg bg-zinc-900/80 p-2 text-[10px] leading-tight text-zinc-400">
                    {activity.length === 0
                      ? "(sin actividad todavía — adjunta un archivo y envía)"
                      : activity.map((l, i) => (
                          <div key={i}>
                            <span className="text-zinc-600">{l.t}</span> {l.msg}
                          </div>
                        ))}
                  </pre>
                )}
              </div>
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
