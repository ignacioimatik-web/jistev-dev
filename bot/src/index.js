import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { timingSafeEqual, randomUUID } from "node:crypto";
import {
  getUpdates,
  sendMessage,
  formatVisitorAnnouncement,
} from "./telegram.js";

// ------------------------------------------------------------------
// Estado persistente (conversations.json)
// ------------------------------------------------------------------
const DB_PATH = path.join(process.cwd(), "conversations.json");

let conversations = new Map(); // sessionId -> { chat_id, user_name, created_at, owner_reply }

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
// Enrutado de updates del bot
// ------------------------------------------------------------------
let offset = 0;

function findSessionByChatId(chatId) {
  for (const [id, meta] of conversations) {
    if (meta.chat_id === chatId) return { id, ...meta };
  }
  return null;
}

async function handleUpdate(upd) {
  if (!upd.message) return;
  const msg = upd.message;
  const chatId = msg.chat.id;
  const user = `${msg.from?.first_name ?? ""} ${msg.from?.last_name ?? ""}`.trim();

  // /start con payload -> el visitante (o el dueño probando) inicia la sesión.
  if (msg.text && msg.text.startsWith("/start")) {
    const payload = msg.text.replace("/start", "").trim();
    const sessionId = payload || randomUUID();

    // Si quien inicia es el DUEÑO, es prueba propia.
    if (chatId === Number(process.env.OWNER_CHAT_ID)) {
      await sendMessage(
        chatId,
        "✅ Puente listo. La ventana de chat embebida ya puede conectar aquí."
      );
      return;
    }

    conversations.set(sessionId, {
      chat_id: chatId,
      user_name: user,
      created_at: Date.now(),
      owner_reply: null,
    });
    saveDb();

    await sendMessage(
      process.env.OWNER_CHAT_ID,
      formatVisitorAnnouncement({ id: sessionId })
    );
    await sendMessage(
      chatId,
      "¡Hola! Me comunico con mi dueño al instante. Escríbeme por aquí y te responderá enseguida. 🙂"
    );
    return;
  }

  // Mensaje normal del visitante -> reenviar al dueño.
  const session = findSessionByChatId(chatId);
  if (session) {
    await sendMessage(
      process.env.OWNER_CHAT_ID,
      `💬 *Nuevo mensaje* (sesión \`${session.id}\` — ${session.user_name || "visitante"}):\n\n${msg.text ?? "(medio no textual)"}`
    );
    return;
  }

  // Mensaje del DUEÑO (respondiendo, con reply) -> reenviar al visitante de esa sesión.
  if (chatId === Number(process.env.OWNER_CHAT_ID) && msg.reply_to_message) {
    const repliedText = msg.reply_to_message.text || "";
    const m = repliedText.match(/sesión[\(`\s]*([0-9a-f-]{8,})/i);
    if (!m) return;
    const meta = conversations.get(m[1]);
    let target = null;
    if (meta?.chat_id) target = meta.chat_id;
    // La respuesta también se guarda para que el WIDGET la recoja por polling.
    if (meta) {
      meta.owner_reply = msg.text ?? "";
      saveDb();
    }
    // Si la sesión no tenía chat_id aún (visitante que solo usó el widget), intenta la más reciente con chat activo.
    if (!target) {
      const latest = [...conversations.entries()]
        .filter(([, v]) => v.chat_id)
        .sort((a, b) => b[1].created_at - a[1].created_at)[0];
      if (latest) target = latest[1].chat_id;
    }
    if (target) {
      try {
        await sendMessage(target, `👨‍💻 ${msg.text ?? ""}`);
      } catch {
        /* sin chat activo */
      }
    }
    return;
  }
}

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

// Verifica la cabecera x-api-key contra API_KEY (comparación de tiempo constante).
function authorized(req) {
  const secret = process.env.API_KEY;
  if (!secret) {
    console.error("⚠️  API_KEY no definida — rechazando todas las peticiones.");
    return false;
  }
  const provided = req.headers["x-api-key"];
  if (typeof provided !== "string" || provided.length !== secret.length) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return timingSafeEqual(a, b);
}

async function handleHttp(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // Guarda de autenticación: todos los endpoints exigen x-api-key correcta.
  if (!authorized(req)) {
    return json(res, 401, { error: "unauthorized" });
  }

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

  if (req.method === "GET" && url.pathname === "/api/poll") {
    const sid = url.searchParams.get("session");
    const meta = conversations.get(sid);
    if (!meta) return json(res, 404, { error: "unknown_session" });
    const reply = meta.owner_reply || null;
    if (reply) {
      meta.owner_reply = null;
      saveDb();
    }
    return json(res, 200, { reply });
  }

  if (req.method === "POST" && url.pathname === "/api/send") {
    let bodyText = "";
    for await (const chunk of req) bodyText += chunk;
    const body = JSON.parse(bodyText || "{}");
    const meta = conversations.get(body.session);
    if (!meta) return json(res, 404, { error: "unknown_session" });

    const text = String(body.message ?? "").slice(0, 3500);
    if (!text.trim()) return json(res, 400, { error: "empty" });

    if (meta.chat_id) {
      try {
        await sendMessage(meta.chat_id, `🙂 ${text}`);
      } catch {
        /* el visitante aún no ha pulsado Start */
      }
    }
    await sendMessage(
      process.env.OWNER_CHAT_ID,
      `💬 *Nuevo mensaje del widget* (sesión \`${body.session}\`${meta.user_name ? ` — ${meta.user_name}` : ""}):\n\n${text}`
    );
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