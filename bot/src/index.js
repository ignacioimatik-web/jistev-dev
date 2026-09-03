import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFile } from "node:child_process";
import { timingSafeEqual, randomUUID } from "node:crypto";
import {
  getUpdates,
  sendMessage,
  sendDocument,
  sendVoice,
  sendAudio,
  formatVisitorAnnouncement,
} from "./telegram.js";

// ------------------------------------------------------------------
// Estado persistente (conversations.json)
// ------------------------------------------------------------------
const DB_PATH = path.join(process.cwd(), "conversations.json");
const LOG_PATH = path.join(process.cwd(), "activity.log");

// Logger simple a archivo (journald no captura la salida del puente).
function log(...parts) {
  const line = `[${new Date().toISOString()}] ${parts.join(" ")}`;
  try {
    fs.appendFileSync(LOG_PATH, line + "\n");
  } catch {
    /* si no se puede escribir, ignorar */
  }
  console.log(line);
}

// sessionId -> { chat_id, user_name, created_at, owner_reply, ever_used, last_activity }
let conversations = new Map();

function loadDb() {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    conversations = new Map(JSON.parse(raw));
  } catch {
    conversations = new Map();
  }
}

function saveDb() {
  fs.writeFileSync(DB_PATH, JSON.stringify([...conversations.entries()], null, 2));
}

// ------------------------------------------------------------------
// Utilidades
// ------------------------------------------------------------------
const OWNER_ID = () => Number(process.env.OWNER_CHAT_ID);

function findSessionByChatId(chatId) {
  for (const [id, meta] of conversations) {
    if (meta.chat_id === chatId) return { id, ...meta };
  }
  return null;
}

// Sesión "más reciente que escribió algo" (para responder normal en el chat).
function mostRecentActiveSession() {
  let best = null;
  let bestActivity = -1;
  for (const [id, meta] of conversations) {
    const act = meta.last_activity || meta.created_at || 0;
    if ((meta.chat_id || meta.ever_used) && act > bestActivity) {
      bestActivity = act;
      best = { id, ...meta };
    }
  }
  return best;
}

function extractSessionIdFromText(text) {
  if (!text) return null;
  // Busca "(sesión `UUID`" o "sesión UUID" — forma que usamos en los avisos al dueño.
  const m = text.match(/sesion[\)\s]*["'`]?\s*([0-9a-f]{8}-[0-9a-f-]{27,})/i);
  return m ? m[1] : null;
}

// ------------------------------------------------------------------
// Enrutado de updates del bot
// ------------------------------------------------------------------
let offset = 0;
// Última sesión cuyo mensaje se notificó al dueño. Sirve para enrutar su
// respuesta NORMAL (sin reply) a la sesión correcta aunque haya varias.
let lastNotifiedSession = null;

async function handleUpdate(upd) {
  if (!upd.message) return;
  const msg = upd.message;
  const chatId = msg.chat.id;
  const user = `${msg.from?.first_name ?? ""} ${msg.from?.last_name ?? ""}`.trim();
  const text = (msg.text ?? "").trim();

  // /start con payload -> el visitante (o el dueño probando) inicia la sesión.
  if (text.startsWith("/start")) {
    const payload = text.replace("/start", "").trim();
    const sessionId = payload || randomUUID();

    // Si quien inicia es el DUEÑO, es prueba propia.
    if (chatId === OWNER_ID()) {
      await sendMessage(
        chatId,
        "✅ Puente listo. La ventana de chat embebida ya puede conectar aquí. " +
          "Responde normal a los avisos de visitantes y llegarán a su navegador."
      );
      return;
    }

    conversations.set(sessionId, {
      chat_id: chatId,
      user_name: user,
      created_at: Date.now(),
      owner_reply: null,
      ever_used: true,
      last_activity: Date.now(),
      upload_token: randomUUID(), // token para subir archivos directo al VPS
    });
    saveDb();

    await sendMessage(OWNER_ID(), formatVisitorAnnouncement({ id: sessionId }));
    await sendMessage(
      chatId,
      "¡Hola! Me comunico con mi dueño al instante. Escríbeme por aquí y te responderá enseguida. 🙂"
    );
    return;
  }

  // 1) Mensaje del DUEÑO -> responder a la sesión + guardar para el widget.
  if (chatId === OWNER_ID()) {
    await handleOwnerMessage(msg);
    return;
  }

  // 2) Mensaje del VISITANTE (desde su Telegram) -> reenviar al dueño.
  const session = findSessionByChatId(chatId);
  if (session) {
    const meta = conversations.get(session.id);
    if (meta) {
      meta.last_activity = Date.now();
      saveDb();
    }
    lastNotifiedSession = session.id;
    await sendMessage(
      OWNER_ID(),
      `💬 *Nuevo mensaje* (sesión \`${session.id}\` — ${session.user_name || "visitante"}):\n\n${text || "(medio no textual)"}`
    );
    return;
  }
}

// ------------------------------------------------------------------
// El dueño responde. Funciona CON reply (preciso) y SIN reply (intuitivo:
// va a la sesión más reciente con actividad).
// ------------------------------------------------------------------
async function handleOwnerMessage(msg) {
  const answer = (msg.text ?? "").trim();
  if (!answer) return;

  let sessionId = null;

  // 1. Si el dueño respondió (reply) a un aviso, extraemos el sessionId del texto.
  if (msg.reply_to_message) {
    sessionId = extractSessionIdFromText(msg.reply_to_message.text || "");
  }

  // 2. Sin reply -> enrutamos a la sesión del ÚLTIMO aviso enviado al dueño,
  //    que es la que el visitante tiene abierta ahora mismo. Determinista.
  if (!sessionId && lastNotifiedSession) {
    sessionId = lastNotifiedSession;
  }

  // 3. Respaldo: si aún no hay pista, la sesión más reciente con actividad.
  if (!sessionId) {
    const active = mostRecentActiveSession();
    if (active) sessionId = active.id;
  }

  if (!sessionId) {
    await sendMessage(
      OWNER_ID(),
      "⚠️ Aún no hay ningún visitante con el que hablar. Cuando alguien escriba en la web, te aviso aquí y me respondes."
    );
    return;
  }

  const meta = conversations.get(sessionId);
  if (!meta) return;

  // Guardar la respuesta para que el WIDGET la recoja por polling.
  meta.owner_reply = answer;
  meta.last_activity = Date.now();
  saveDb();

  // Si el visitante inició el chat en Telegram (tiene chat_id), reenviarle también ahí.
  if (meta.chat_id) {
    try {
      await sendMessage(meta.chat_id, `👨‍💻 ${answer}`);
    } catch {
      /* sin chat activo */
    }
  }
}

// ------------------------------------------------------------------
// Polling
// ------------------------------------------------------------------
async function startPolling() {
  console.log("🤖 Polling de Telegram iniciado...");
  for (;;) {
    try {
      const updates = await getUpdates(offset);
      for (const upd of updates) {
        offset = upd.update_id + 1;
        try {
          await handleUpdate(upd);
        } catch (e) {
          console.error("handleUpdate error:", e.message);
        }
      }
    } catch (e) {
      console.error("Polling error:", e.message);
    }
    if (offset === 0) await sleep(1000);
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ------------------------------------------------------------------
// Mini API HTTP que consume el widget del portfolio
// ------------------------------------------------------------------
function json(res, code, body) {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function authorized(req) {
  const secret = process.env.API_KEY;
  if (!secret) return false;
  const provided = req.headers["x-api-key"];
  if (typeof provided !== "string" || provided.length !== secret.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(secret));
}

// Convierte un buffer webm/opus a OGG/Opus con ffmpeg (Telegram solo acepta
// OGG/Opus en sendVoice). Si el buffer ya es OGG, se devuelve tal cual.
function convertToOgg(buffer, mimeType) {
  return new Promise((resolve, reject) => {
    if (/ogg|opus/i.test(mimeType || "")) return resolve(buffer);
    const inPath = path.join(os.tmpdir(), `voz-${randomUUID()}.webm`);
    const outPath = path.join(os.tmpdir(), `voz-${randomUUID()}.ogg`);
    fs.writeFileSync(inPath, buffer);
    execFile(
      "ffmpeg",
      ["-y", "-i", inPath, "-c:a", "libopus", "-b:a", "48k", "-ar", "48000", "-ac", "1", outPath],
      (err) => {
        try { fs.unlinkSync(inPath); } catch { /* ya no existe */ }
        if (err) {
          try { fs.unlinkSync(outPath); } catch { /* no creado */ }
          return reject(err);
        }
        fs.readFile(outPath, (rerr, data) => {
          try { fs.unlinkSync(outPath); } catch { /* ya no existe */ }
          if (rerr) return reject(rerr);
          resolve(data);
        });
      }
    );
  });
}

// Convierte un buffer (webm/ogg/lo que sea) a MP3 con ffmpeg. MP3 lo reproduce
// Telegram en iOS/Android/escritorio, a diferencia de un .ogg suelto.
function convertToMp3(buffer) {
  return new Promise((resolve, reject) => {
    const inPath = path.join(os.tmpdir(), `voz-${randomUUID()}.in`);
    const outPath = path.join(os.tmpdir(), `voz-${randomUUID()}.mp3`);
    fs.writeFileSync(inPath, buffer);
    execFile(
      "ffmpeg",
      ["-y", "-i", inPath, "-c:a", "libmp3lame", "-b:a", "96k", "-ar", "44100", "-ac", "1", outPath],
      (err) => {
        try { fs.unlinkSync(inPath); } catch { /* ya no existe */ }
        if (err) {
          try { fs.unlinkSync(outPath); } catch { /* no creado */ }
          return reject(err);
        }
        fs.readFile(outPath, (rerr, data) => {
          try { fs.unlinkSync(outPath); } catch { /* ya no existe */ }
          if (rerr) return reject(rerr);
          resolve(data);
        });
      }
    );
  });
}

// Envía la nota de voz del cliente: convierte a OGG y la manda como nota de
// voz; si Telegram la rechaza (p.ej. VOICE_MESSAGES_FORBIDDEN por privacidad
// del dueño), cae a sendAudio y, si también falla, a sendDocument — siempre en
// MP3 para que se reproduzca en el iPhone. SIEMPRE llega algo reproducible.
async function deliverVoice(chatId, { buffer, mimeType, durationMs }) {
  const ogg = await convertToOgg(buffer, mimeType);
  try {
    await sendVoice(chatId, { buffer: ogg, filename: "voz.ogg", mimeType: "audio/ogg" });
    return "voice";
  } catch (e) {
    log(`deliverVoice fallback a sendAudio (${String(e.message).slice(0, 60)})`);
    const mp3 = await convertToMp3(buffer);
    try {
      await sendAudio(chatId, { buffer: mp3, filename: "voz.mp3", mimeType: "audio/mpeg" });
      return "audio";
    } catch (e2) {
      log(`deliverVoice fallback a sendDocument (${String(e2.message).slice(0, 60)})`);
      await sendDocument(chatId, { buffer: mp3, filename: "voz.mp3", mimeType: "audio/mpeg" });
      return "document";
    }
  }
}

// Subida directa de archivo grande al puente (evita el límite de body de Vercel).
async function handleUpload(req, res) {
  // CORS: el navegador sube directo al VPS (distinto origen). El uploadToken
  // autentica, así que permitimos cualquier origen para subir.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  let bodyText = "";
  for await (const chunk of req) bodyText += chunk;
  const body = JSON.parse(bodyText || "{}");

  const meta = conversations.get(body.sessionId);
  if (!meta || meta.upload_token !== body.uploadToken) {
    log(`UPLOAD auth-fail session=${body.sessionId} token=${String(body.uploadToken).slice(0, 8)}`);
    return json(res, 401, { error: "invalid_token" });
  }
  if (req.method !== "POST") return json(res, 405, { error: "method" });

  const file = body.file;
  if (!file?.base64) {
    log(`UPLOAD empty session=${body.sessionId}`);
    return json(res, 400, { error: "empty" });
  }

  const buffer = Buffer.from(file.base64, "base64");
  log(`UPLOAD start session=${body.sessionId} file=${file.name} type=${file.mimeType} size=${buffer.length}B isVoice=${!!file.isVoice}`);
  meta.last_activity = Date.now();
  meta.ever_used = true;
  saveDb();

  const isVoice = /audio/.test(file.mimeType || "") && file.isVoice;
  console.log(`[upload] file=${file.name} type=${file.mimeType} size=${buffer.length} bytes isVoice=${isVoice}`);
  try {
    if (isVoice) {
      log(`UPLOAD voice → deliverVoice session=${body.sessionId}`);
      const kind = await deliverVoice(OWNER_ID(), {
        buffer,
        mimeType: file.mimeType || "audio/ogg",
        durationMs: file.duration_ms,
      });
      log(`UPLOAD voice entregado como ${kind} session=${body.sessionId}`);
      await sendMessage(OWNER_ID(), `🎤 Nota de voz del cliente${file.duration_ms ? ` · ${Math.round(file.duration_ms / 1000)}s` : ""}`);
    } else {
      await sendDocument(OWNER_ID(), {
        buffer,
        filename: file.name || "adjunto",
        mimeType: file.mimeType || "application/octet-stream",
      });
      log(`UPLOAD sendDocument OK session=${body.sessionId} file=${file.name}`);
      await sendMessage(OWNER_ID(), `📎 *Adjunto:* ${file.name || "archivo"}`);
    }
    log(`UPLOAD ok session=${body.sessionId}`);
    return json(res, 200, { ok: true });
  } catch (e) {
    log(`UPLOAD error session=${body.sessionId} err=${e.message}`);
    return json(res, 200, { ok: false, error: "telegram_send_failed" });
  }
}

async function handleHttp(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // /api/upload se autentica con el uploadToken por sesión (no requiere API key
  // global, para que el navegador pueda subir archivos grandes sin exponer la clave).
  if (url.pathname === "/api/upload") {
    return handleUpload(req, res);
  }

  if (!authorized(req)) return json(res, 401, { error: "unauthorized" });

  // GET /api/session -> nueva sesión para el widget.
  if (req.method === "GET" && url.pathname === "/api/session") {
    const id = randomUUID();
    conversations.set(id, {
      chat_id: null,
      user_name: null,
      created_at: Date.now(),
      owner_reply: null,
      upload_token: randomUUID(), // token para subir archivos grandes directo al VPS
    });
    saveDb();
    log(`SESSION created id=${id}`);
    return json(res, 200, {
      sessionId: id,
      startUrl: `https://t.me/${process.env.BOT_USERNAME}?start=${id}`,
      uploadToken: conversations.get(id).upload_token,
    });
  }

  // POST /api/upload -> subida directa de archivo grande (evita el límite de Vercel).
  // (El dispatch ya lo enrutó a handleUpload; esta rama queda como seguridad.)
  if (req.method === "POST" && url.pathname === "/api/upload") {
    return handleUpload(req, res);
  }

  // GET /api/poll?session=X -> el widget pregunta si el dueño ya respondió.
  if (req.method === "GET" && url.pathname === "/api/poll") {
    const sid = url.searchParams.get("session");
    const meta = conversations.get(sid);
    if (!meta) return json(res, 404, { error: "unknown_session" });
    const reply = meta.owner_reply || null;
    if (reply) {
      meta.owner_reply = null; // consumido
      saveDb();
    }
    return json(res, 200, { reply });
  }

  // POST /api/send -> el visitante escribió en el widget; reenviar al dueño.
  if (req.method === "POST" && url.pathname === "/api/send") {
    let bodyText = "";
    for await (const chunk of req) bodyText += chunk;
    const body = JSON.parse(bodyText || "{}");
    const meta = conversations.get(body.session);
    if (!meta) return json(res, 404, { error: "unknown_session" });

    const text = String(body.message ?? "").slice(0, 3500);
    const file = body.file; // { name, mimeType, base64 } opcional
    const voice = body.voice; // { mimeType, base64, duration_ms } opcional
    if (!text.trim() && !file?.base64 && !voice?.base64) {
      return json(res, 400, { error: "empty" });
    }
    log(`SEND session=${body.session} text=${JSON.stringify(text.slice(0, 40))} hasFile=${!!file?.base64} hasVoice=${!!voice?.base64}`);

    // Marcar la sesión como usada (el dueño puede responder normal)
    meta.ever_used = true;
    meta.last_activity = Date.now();
    if (body.chatId) meta.chat_id = body.chatId;
    if (body.name) meta.user_name = body.name;
    saveDb();

    lastNotifiedSession = body.session;

    // ── Aviso AL DUEÑO ──
    // Primer mensaje: presentación del cliente + su mensaje.
    // Siguientes: solo el texto (chat limpio tipo jistevbot).
    const who = meta.user_name || "un visitante";
    if (!meta.intro_done) {
      meta.intro_done = true;
      saveDb();
      await sendMessage(
        OWNER_ID(),
        `👤 *${who}* quiere hablar contigo desde la web.\n🔒 Respóndeme normal y le llegará en su navegador.\n—————————————————`
      );
      // Pequeña espera para que el intro y el mensaje salgan en orden.
      await sleep(300);
    }

    // Enviar adjunto si viene.
    if (file?.base64) {
      try {
        const buffer = Buffer.from(file.base64, "base64");
        await sendDocument(OWNER_ID(), {
          buffer,
          filename: file.name || "adjunto",
          mimeType: file.mimeType || "application/octet-stream",
        });
      } catch (e) {
        console.error("sendDocument error:", e.message);
      }
    }

    // Enviar nota de voz si viene.
    if (voice?.base64) {
      try {
        const buffer = Buffer.from(voice.base64, "base64");
        await deliverVoice(OWNER_ID(), {
          buffer,
          mimeType: voice.mimeType || "audio/ogg",
          durationMs: voice.duration_ms,
        });
      } catch (e) {
        console.error("deliverVoice error:", e.message);
      }
    }

    // Enviar el texto del mensaje. Solo texto -> mensaje normal.
    // Si hay adjunto y NO hay texto, enviamos el nombre como caption.
    if (text.trim()) {
      await sendMessage(OWNER_ID(), text);
    } else if (file?.name) {
      await sendMessage(OWNER_ID(), `📎 *Adjunto:* ${file.name}`);
    } else if (voice?.base64) {
      await sendMessage(OWNER_ID(), `🎤 Nota de voz del cliente${voice.duration_ms ? ` · ${Math.round(voice.duration_ms / 1000)}s` : ""}`);
    }

    // ── ECO al visitante (si inició chat en Telegram) ──
    if (meta.chat_id && text.trim()) {
      try {
        await sendMessage(meta.chat_id, `🙂 ${text}`);
      } catch {
        /* sin chat activo */
      }
    }

    return json(res, 200, { ok: true });
  }

  return json(res, 404, { error: "not_found" });
}

// ------------------------------------------------------------------
// Arranque
// ------------------------------------------------------------------
loadDb();

const port = Number(process.env.PORT || 8787);
const server = http.createServer(handleHttp);
server.listen(port, () => {
  console.log(`🌐 Mini API escuchando en :${port}`);
  console.log(`   Endpoints: GET /api/session · GET /api/poll?session= · POST /api/send`);
  console.log(`   DB: ${DB_PATH}`);
});

startPolling();