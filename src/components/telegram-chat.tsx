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
  Smile,
} from "lucide-react";

// Widget de chat embebido. Habla con rutas propias de este despliegue
// (/api/telegram/*); el server de Vercel añade la API key y reenvía al puente
// (VPS). El navegador nunca ve el secreto. Los ARCHIVOS GRANDES se suben DIRECTO
// al VPS (/api/upload con uploadToken) para superar el límite de 4.5MB de Vercel.

const UPLOAD_URL =
  process.env.NEXT_PUBLIC_TG_UPLOAD_URL?.replace(/\/$/, "") || "";

// Emojis frecuentes para el selector del chat.
const EMOJIS = [
  "😀", "😄", "😁", "😂", "🤣", "😊", "😍", "😘",
  "😉", "😎", "🤔", "😅", "🙂", "🤗", "😴", "🥳",
  "👍", "👎", "👏", "🙏", "💪", "🤝", "👋", "✌️",
  "❤️", "🔥", "⭐", "✅", "🎉", "🚀", "💡", "⚡",
  "🎯", "📎", "📅", "☕", "🍕", "💰", "🏆", "🙌",
];

// Icono premium de bot (mensajes del sistema). SVG inline, sin emoji.
function BotIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M12 2.6v2.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="2.2" r="1.4" fill="currentColor" />
      <rect x="3.5" y="6.5" width="17" height="12.5" rx="4.2" fill="currentColor" />
      <circle cx="9" cy="12.6" r="1.4" fill="#fff" />
      <circle cx="15" cy="12.6" r="1.4" fill="#fff" />
      <path d="M9.4 16.4h5.2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

type Msg = { from: "user" | "owner" | "system"; text: string; audioUrl?: string };
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
  const [attached, setAttached] = useState<{ name: string; type: string; data: string } | null>(null);
  const [voice, setVoice] = useState<Voice | null>(null);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "starting">("idle");
  const [online, setOnline] = useState<boolean | null>(null);
  const [activity, setActivity] = useState<LogEntry[]>([]);
  const [sizeWarning, setSizeWarning] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordStartRef = useRef(0);
  const titleClicksRef = useRef(0);
  const titleClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Gatillo oculto: 5 clics rápidos en el título del chat muestran/ocultan el
  // panel de diagnóstico (invisible para los clientes).
  const onTitleClick = () => {
    titleClicksRef.current += 1;
    if (titleClickTimerRef.current) clearTimeout(titleClickTimerRef.current);
    titleClickTimerRef.current = setTimeout(() => {
      titleClicksRef.current = 0;
    }, 2000);
    if (titleClicksRef.current >= 5) {
      titleClicksRef.current = 0;
      setShowLog((v) => !v);
    }
  };

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
  // Versión del contrato de sesión: si cambia (p.ej. nuevas features), las
  // sesiones viejas del navegador se descartan y se crea una nueva.
  const SESSION_VERSION_KEY = "tg-chat-session-version";
  const SESSION_VERSION = "4";

  // Crear (o recuperar) la sesión al abrir el chat.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      // 0) Si la versión del contrato cambió, descartar la sesión guardada
      //    (la nueva versión del puente puede requerir una sesión fresca).
      const savedVersion = localStorage.getItem(SESSION_VERSION_KEY);
      if (savedVersion !== SESSION_VERSION) {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.setItem(SESSION_VERSION_KEY, SESSION_VERSION);
        pushLog("versión de sesión actualizada — se creará una sesión nueva");
      }
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
          // Mensaje del sistema (bienvenida/auto-reply) marcado por el puente.
          if (typeof data.reply === "string" && data.reply.startsWith("__SYSTEM__:")) {
            setMessages((prev) => [
              ...prev,
              { from: "system", text: data.reply.slice("__SYSTEM__:".length) },
            ]);
          } else if (typeof data.reply === "string" && data.reply.startsWith("__AUDIO__:")) {
            const audioUrl = data.reply.slice("__AUDIO__:".length);
            setMessages((prev) => [...prev, { from: "owner", text: "🎤 Nota de voz", audioUrl }]);
          } else {
            setMessages((prev) => [...prev, { from: "owner", text: data.reply }]);
          }
        }
      } catch {
        /* silencio */
      }
    }, 3000);
    return () => clearInterval(t);
  }, [open, session]);

  // Presencia del dueño: el puente marca su última actividad en Telegram;
  // si fue hace <5 min mostramos "En línea".
  useEffect(() => {
    if (!open) return;
    const check = async () => {
      try {
        const res = await fetch("/api/telegram/status");
        const data = await res.json();
        setOnline(data?.online ?? null);
      } catch {
        /* silencio */
      }
    };
    check();
    const t = setInterval(check, 5000);
    return () => clearInterval(t);
  }, [open]);

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
  const [micLevel, setMicLevel] = useState(0); // 0..1, medidor en vivo
  const analyserRef = useRef<AnalyserNode | null>(null);
  const levelRafRef = useRef<number | null>(null);

  // Bucle de medición: lee el nivel del micrófono ~15 veces/segundo mientras
  // se graba. Si el medidor no sube al hablar, el micrófono no capta sonido.
  function startLevelMeter(stream: MediaStream) {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    src.connect(analyser);
    analyserRef.current = analyser;
    const data = new Uint8Array(analyser.fftSize);
    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let peak = 0;
      for (let i = 0; i < data.length; i++) {
        const v = Math.abs(data[i] - 128) / 128;
        if (v > peak) peak = v;
      }
      setMicLevel(Math.min(1, peak * 2.5));
      levelRafRef.current = requestAnimationFrame(tick);
    };
    tick();
  }

  function stopLevelMeter() {
    if (levelRafRef.current) cancelAnimationFrame(levelRafRef.current);
    levelRafRef.current = null;
    analyserRef.current = null;
    setMicLevel(0);
  }

  // Decodifica el audio grabado y devuelve: RMS, pico y un blob WAV listo para
  // reproducir. El webm de MediaRecorder no tiene metadatos de duración, por lo
  // que el <audio> muestra 00:00 y puede no reproducir; el WAV funciona siempre.
  async function analyzeVoice(blob: Blob): Promise<{
    rms: number;
    peak: number;
    wav: Blob | null;
  } | null> {
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const audio = await ctx.decodeAudioData(await blob.arrayBuffer());
      const data = audio.getChannelData(0);
      let sum = 0;
      let peak = 0;
      for (let i = 0; i < data.length; i++) {
        const v = data[i];
        sum += v * v;
        const a = Math.abs(v);
        if (a > peak) peak = a;
      }
      const rms = Math.sqrt(sum / data.length);

      // Codifica el buffer a WAV PCM 16-bit mono (reproducible en todo).
      const numCh = 1;
      const sampleRate = audio.sampleRate;
      const samples = data.length;
      const blockAlign = numCh * 2;
      const dataSize = samples * blockAlign;
      const wavBuf = new ArrayBuffer(44 + dataSize);
      const view = new DataView(wavBuf);
      const writeStr = (o: number, s: string) => {
        for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i));
      };
      writeStr(0, "RIFF");
      view.setUint32(4, 36 + dataSize, true);
      writeStr(8, "WAVE");
      writeStr(12, "fmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numCh, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * blockAlign, true);
      view.setUint16(32, blockAlign, true);
      view.setUint16(34, 16, true);
      writeStr(36, "data");
      view.setUint32(40, dataSize, true);
      let off = 44;
      for (let i = 0; i < samples; i++) {
        const s = Math.max(-1, Math.min(1, data[i]));
        view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        off += 2;
      }
      const wav = new Blob([wavBuf], { type: "audio/wav" });
      try { (ctx as AudioContext & { close?: () => Promise<void> }).close?.(); } catch { /* Safari */ }
      return { rms, peak, wav };
    } catch {
      return null; // no se pudo decodificar -> decisión por tamaño, sin WAV
    }
  }

  async function toggleRecord() {
    if (recordingRef.current) {
      recorderRef.current?.stop();
      return;
    }
    try {
      // Usar el micrófono predeterminado del sistema (el que el usuario tenga
      // configurado en su equipo; no hace falta selector).
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
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        stopLevelMeter();
        if (recTimerRef.current) {
          clearInterval(recTimerRef.current);
          recTimerRef.current = null;
        }
        const mimeType = rec.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const durationMs = Date.now() - recordStartRef.current;

        // Análisis objetivo: RMS del audio real (distingue voz de silencio).
        const analysis = await analyzeVoice(blob);
        const rms = analysis?.rms ?? -1;
        const peak = analysis?.peak ?? -1;
        pushLog(
          `grabación: ${blob.size} bytes, ${Math.round(durationMs / 1000)}s, RMS=${rms.toFixed(4)} pico=${peak.toFixed(3)} (${mimeType})`
        );

        // Voz real: RMS claramente > 0.005. Silencio/micrófono muerto: RMS ≈ 0.
        const hasVoice = rms >= 0.005;

        if (blob.size < 1500 || durationMs < 800 || !hasVoice) {
          if (!hasVoice && blob.size >= 1500) {
            pushLog("MICRÓFONO SIN SONIDO: duración y tamaño normales, pero el audio es silencio");
            alert(
              "La grabación NO contiene tu voz (el audio sale en silencio). El micrófono del navegador no está captando sonido. Revisa:\n\n1) Ajustes de macOS → Privacidad y seguridad → Micrófono → permite el navegador.\n2) En el navegador, pulsa el icono del candado → permitir el micrófono.\n3) Comprueba que el micrófono correcto esté activo en Ajustes de Sonido de macOS."
            );
          } else {
            pushLog(`grabación descartada: ${blob.size} bytes, ${Math.round(durationMs / 1000)}s`);
            alert(
              "Grabación demasiado corta o vacía. Mantén pulsado 🎤 unos segundos hablando, y suéltalo para enviar."
            );
          }
          setVoice(null);
        } else {
          pushLog(`grabación OK con voz: ${blob.size} bytes, ${Math.round(durationMs / 1000)}s (${mimeType})`);
          // Preview en WAV (reproduce siempre y muestra duración real); el blob
          // original (webm) se sigue enviando al servidor.
          const previewBlob = analysis?.wav ?? blob;
          setVoice({
            blob,
            url: URL.createObjectURL(previewBlob),
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
      startLevelMeter(stream);
      recTimerRef.current = setInterval(() => {
        setRecSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      const name = (err as DOMException)?.name || "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        pushLog(`ERROR permisos de micrófono: ${name}`);
        alert("El navegador no tiene permiso para usar el micrófono. Pulsa el candado 🔒 en la barra de dirección de digitalcode.es → Micrófono → Permitir, y recarga la página.");
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        pushLog(`ERROR dispositivo no disponible: ${name}`);
        alert("No se encontró el micrófono seleccionado. Comprueba en Ajustes de macOS → Sonido → Entrada que haya un micrófono activo, y vuelve a intentarlo.");
      } else if (name === "NotReadableError") {
        pushLog(`ERROR dispositivo ocupado: ${name}`);
        alert("El micrófono está siendo usado por otra aplicación (Zoom, Discord, OBS…). Ciérrala y vuelve a intentarlo.");
      } else {
        pushLog(`ERROR al acceder al micrófono: ${name || (err as Error).message}`);
        alert("No pude acceder al micrófono. Revisa los permisos del navegador.");
      }
    }
  }

  function cancelVoice() {
    if (voice) URL.revokeObjectURL(voice.url);
    setVoice(null);
  }

  // Auto-crece el textarea hasta un máximo (Enter sigue enviando).
  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 110) + "px";
  };

  // Inserta un emoji en la posición del cursor del textarea.
  const insertEmoji = (emoji: string) => {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? input.length;
    const end = el?.selectionEnd ?? input.length;
    const next = input.slice(0, start) + emoji + input.slice(end);
    setInput(next);
    autoResize();
    requestAnimationFrame(() => {
      el?.focus();
      const pos = start + emoji.length;
      el?.setSelectionRange(pos, pos);
    });
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    setShowEmoji(false);
    if (recordingRef.current) {
      pushLog("bloqueado: aún estás grabando — para la grabación antes de enviar");
      return;
    }
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
        if (upData?.ok === false) {
          const msgs: Record<string, string> = {
            type_not_allowed: "Ese tipo de archivo no está permitido. Solo: PDF, imágenes, texto y documentos de Office.",
            extension_mismatch: "El archivo no coincide con su extensión. Revisa el archivo e inténtalo de nuevo.",
            virus: "⚠️ El archivo contenía un virus y ha sido bloqueado.",
            too_large: "El archivo supera el límite de 20 MB.",
            upload_limit: "Has alcanzado el límite de adjuntos en esta conversación.",
            scanner_unavailable: "El escáner de virus no está disponible ahora. Inténtalo más tarde.",
          };
          alert(msgs[String(upData.error)] || "El archivo fue rechazado por el servidor.");
        }
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
      // Bienvenida automática del sistema (primer mensaje de la sesión).
      if (data?.welcome) {
        setMessages((prev) => [...prev, { from: "system", text: data.welcome }]);
      }
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
      setSizeWarning(true);
      pushLog(`archivo rechazado por tamaño: ${f.name} (${(f.size / 1024 / 1024).toFixed(1)} MB)`);
      e.target.value = "";
      return;
    }
    setSizeWarning(false);
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
        <div className="fixed bottom-24 right-6 z-50 flex h-[560px] w-[360px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 bg-[#2AABEE] px-4 py-3 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="cursor-default" onClick={onTitleClick}>
              <p className="text-sm font-semibold">jistev — contacto</p>
              {online !== null && !recording && (
                <p className="flex items-center gap-1.5 text-[11px] text-white/90">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      online ? "bg-green-400" : "bg-zinc-400"
                    } ${online ? "animate-pulse" : ""}`}
                  />
                  {online ? "En línea" : "No disponible ahora"}
                </p>
              )}
            </div>
            {/* Medidor de nivel de micrófono durante la grabación */}
            {recording && (
              <div className="ml-auto flex items-center gap-1.5">
                <span className="text-[11px] font-medium tabular-nums">{recSeconds}s</span>
                <div className="flex h-4 w-16 items-end gap-0.5">
                  {[0.2, 0.4, 0.6, 0.8, 1].map((th) => (
                    <div
                      key={th}
                      className={`w-full rounded-sm ${micLevel >= th ? "bg-white" : "bg-white/25"}`}
                      style={{ height: `${th * 100}%` }}
                    />
                  ))}
                </div>
              </div>
            )}
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
            {messages.map((m, i) =>
              m.from === "system" ? (
                <div
                  key={i}
                  className="mx-auto flex max-w-[90%] items-start gap-2 rounded-xl bg-zinc-800/50 px-3.5 py-2.5"
                >
                  <BotIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#2AABEE]" />
                  <p className="text-sm leading-snug text-zinc-300">{m.text}</p>
                </div>
              ) : m.from === "owner" ? (
                <div key={i} className="flex items-end gap-1.5">
                  {/* Logo del dueño (avatar) */}
                  <img
                    src="/logo.png"
                    alt=""
                    aria-hidden
                    className="h-6 w-6 shrink-0 rounded-full object-cover"
                  />
                  <div className="max-w-[75%] rounded-2xl bg-zinc-800 px-3 py-2 text-sm text-zinc-100">
                    {m.text}
                    {m.audioUrl && (
                      <audio controls src={m.audioUrl} className="mt-1.5 h-9 w-52 max-w-full" />
                    )}
                  </div>
                </div>
              ) : (
                <div
                  key={i}
                  className="ml-auto max-w-[80%] rounded-2xl bg-[#2AABEE] px-3 py-2 text-sm text-white"
                >
                  {m.text}
                </div>
              )
            )}
          </div>

          {/* Input */}
          {session ? (
            <div className="max-h-[340px] overflow-y-auto border-t border-line p-3">
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
                <div className="mb-2 rounded-xl border-2 border-[#2AABEE]/60 bg-[#2AABEE]/10 px-3 py-2.5">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#2AABEE]">
                      🎤 Audio listo ({Math.round(voice.durationMs / 1000)}s)
                    </span>
                    <button
                      type="button"
                      onClick={cancelVoice}
                      aria-label="Descartar nota de voz"
                      className="text-zinc-400 hover:text-zinc-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <audio controls src={voice.url} className="h-9 w-full" />
                </div>
              )}
              <form onSubmit={handleSend} className="flex flex-col gap-1.5">
                {/* Barra de herramientas: iconos encima del textarea */}
                <div className="flex items-center gap-1">
                  <label className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-zinc-400 transition-colors hover:text-orange-400">
                    <Paperclip className="h-4 w-4" />
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.txt,.csv,.md,.json,.docx,.xlsx,.pptx"
                      onChange={handleAttach}
                    />
                  </label>
                  {/* Selector de emojis */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowEmoji((v) => !v)}
                      aria-label="Insertar emoji"
                      title="Emojis"
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                        showEmoji ? "text-orange-400" : "text-zinc-400 hover:text-orange-400"
                      }`}
                    >
                      <Smile className="h-4 w-4" />
                    </button>
                    {showEmoji && (
                      <div className="absolute bottom-full left-0 z-50 mb-2 w-64 rounded-xl border border-line bg-card p-2 shadow-2xl">
                        <div className="grid grid-cols-8 gap-0.5">
                          {EMOJIS.map((em) => (
                            <button
                              key={em}
                              type="button"
                              onClick={() => insertEmoji(em)}
                              className="rounded-md p-1 text-lg transition-colors hover:bg-zinc-800"
                            >
                              {em}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
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
                  <span className="ml-auto text-[10px] text-zinc-600">
                    Enter envía · Shift+Enter salto de línea
                  </span>
                </div>
                {/* Fila de escritura: textarea a ancho completo + enviar */}
                <div className="flex items-end gap-2">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      autoResize();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
                      }
                    }}
                    rows={1}
                    placeholder={recording ? "Grabando… pulsa para parar" : "Escribe tu mensaje… 😀"}
                    className="max-h-[110px] min-h-[42px] flex-1 resize-none rounded-xl border border-line bg-transparent px-3 py-2.5 text-sm leading-snug text-foreground outline-none focus:border-orange-400"
                  />
                  <button
                    type="submit"
                    aria-label="Enviar"
                    className="flex h-9 shrink-0 items-center justify-center gap-1 rounded-full bg-[#2AABEE] px-2.5 text-white transition-colors hover:bg-[#229ED9]"
                  >
                    {voice ? (
                      <>
                        <span className="text-[11px] font-semibold">Enviar</span>
                        <Mic className="h-3.5 w-3.5" />
                      </>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </form>
              {/* Aviso discreto solo si el adjunto supera el límite */}
              {sizeWarning && (
                <p className="mt-1.5 text-center text-[11px] text-amber-400/90">
                  Máximo 20 MB por adjunto.
                </p>
              )}

              {/* Panel de diagnóstico OCULTO: solo se ve si se activa con 5
                  clics rápidos en el título del chat (para depuración). */}
              {showLog && (
                <div className="mt-2 border-t border-line pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wide text-zinc-500">
                      ▾ Diagnóstico ({activity.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowLog(false)}
                      className="text-[10px] text-zinc-500 hover:text-zinc-300"
                    >
                      ocultar
                    </button>
                  </div>
                  <pre className="mt-1 max-h-28 overflow-y-auto rounded-lg bg-zinc-900/80 p-2 text-[10px] leading-tight text-zinc-400">
                    {activity.length === 0
                      ? "(sin actividad todavía — adjunta un archivo y envía)"
                      : activity.map((l, i) => (
                          <div key={i}>
                            <span className="text-zinc-600">{l.t}</span> {l.msg}
                          </div>
                        ))}
                  </pre>
                </div>
              )}
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
