import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { timingSafeEqual, randomUUID } from "node:crypto";
import {
  getUpdates,
  sendMessage,
  sendDocument,
  formatVisitorAnnouncement,
} from "./telegram.js";

// ------------------------------------------------------------------
// Estado persistente (conversations.json)
// ------------------------------------------------------------------
const DB_PATH = path.join(process.cwd(), "conversations.json");

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

async function handleHttp(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (!authorized(req)) return json(res, 401, { error: "unauthorized" });

  // GET /api/session -> nueva sesión para el widget.
  if (req.method === "GET" && url.pathname === "/api/session") {
    const id = randomUUID();
    conversations.set(id, {
      chat_id: null,
      user_name: null,
      created_at: Date.now(),
      owner_reply: null,
    });
    saveDb();
    return json(res, 200, {
      sessionId: id,
      startUrl: `https://t.me/${process.env.BOT_USERNAME}?start=${id}`,
    });
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
    if (!text.trim() && !file?.base64) return json(res, 400, { error: "empty" });

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

    // Enviar el texto del mensaje. Solo texto -> mensaje normal.
    // Si hay adjunto y NO hay texto, enviamos el nombre como caption.
    if (text.trim()) {
      await sendMessage(OWNER_ID(), text);
    } else if (file?.name) {
      await sendMessage(OWNER_ID(), `📎 *Adjunto:* ${file.name}`);
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