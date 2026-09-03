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
  const [micLevel, setMicLevel] = useState(0); // 0..1, medidor en vivo
  const analyserRef = useRef<AnalyserNode | null>(null);
  const levelRafRef = useRef<number | null>(null);
  const [micDevices, setMicDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState("");

  // Enumerar los micrófonos reales del equipo (para elegir el correcto).
  useEffect(() => {
    if (!open) return;
    navigator.mediaDevices
      ?.enumerateDevices()
      .then((devs) => {
        const inputs = devs.filter((d) => d.kind === "audioinput");
        setMicDevices(inputs);
        if (inputs.length === 1) setSelectedDevice(inputs[0].deviceId);
        else if (inputs.length > 1) pushLog(`micrófonos detectados: ${inputs.length}`);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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
      // Usar el micrófono elegido; si hay varios y ninguno seleccionado, el
      // predeterminado del sistema (que en macOS puede ser un dispositivo sin
      // señal — causa típica de grabaciones en silencio).
      const constraints: MediaStreamConstraints = {
        audio: selectedDevice ? { deviceId: { exact: selectedDevice } } : true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      // Tras el primer permiso, los nombres de los micrófonos ya son visibles.
      navigator.mediaDevices
        ?.enumerateDevices()
        .then((devs) => setMicDevices(devs.filter((d) => d.kind === "audioinput")))
        .catch(() => {});
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

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
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
        <div className="fixed bottom-24 right-6 z-50 flex h-[560px] w-[360px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 bg-[#2AABEE] px-4 py-3 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">jistev — contacto</p>
              <p className="text-xs text-white/80">Respuesta en menos de 24h</p>
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
            <div className="max-h-[340px] overflow-y-auto border-t border-line p-3">
              {/* Nombre del cliente (opcional) */}
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre (opcional)"
                className="mb-2 w-full rounded-xl border border-line bg-transparent px-3 py-1.5 text-xs text-foreground outline-none focus:border-orange-400"
              />
              {/* Selector de micrófono (si hay varios) */}
              {micDevices.length > 1 && !recording && (
                <div className="mb-2 flex items-center gap-1.5">
                  <Mic className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                  <select
                    value={selectedDevice}
                    onChange={(e) => {
                      setSelectedDevice(e.target.value);
                      pushLog("micrófono cambiado a " + (micDevices.find((d) => d.deviceId === e.target.value)?.label || "predeterminado"));
                    }}
                    className="w-full rounded-lg border border-line bg-transparent px-2 py-1 text-[11px] text-zinc-300 outline-none focus:border-orange-400"
                  >
                    <option value="" className="bg-zinc-900">Predeterminado del sistema</option>
                    {micDevices.map((d) => (
                      <option key={d.deviceId} value={d.deviceId} className="bg-zinc-900">
                        {d.label || "Micrófono"}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {/* Aviso si no hay ningún micrófono detectado */}
              {micDevices.length === 0 && !recording && (
                <p className="mb-2 text-[11px] text-amber-400/90">
                  No se ha detectado ningún micrófono. Conecta uno o revisa Ajustes → Sonido → Entrada.
                </p>
              )}
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
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <label className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-zinc-400 transition-colors hover:text-orange-400">
                  <Paperclip className="h-4 w-4" />
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.txt,.csv,.md,.json,.docx,.xlsx,.pptx"
                    onChange={handleAttach}
                  />
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
