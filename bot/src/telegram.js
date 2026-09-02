// Cliente ligero de la Bot API de Telegram usando solo fetch (sin dependencias).
const BASE = `https://api.telegram.org/bot${process.env.BOT_TOKEN}`;

// Long-polling de updates (indicamos timeout de 30s y offset = last update_id + 1).
export async function getUpdates(offset, timeout = 30) {
  const res = await fetch(`${BASE}/getUpdates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      offset,
      timeout,
      allowed_updates: ["message", "callback_query"],
    }),
  });
  if (!res.ok) throw new Error(`getUpdates ${res.status}`);
  const data = await res.json();
  return data.ok ? data.result : [];
}

export async function sendMessage(chatId, text, extra = {}) {
  const res = await fetch(`${BASE}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, ...extra }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`sendMessage ${res.status}: ${err}`);
  }
  return (await res.json()).result;
}

// Texto "ficha" que el dueño ve cuando un visitante inicia una sesión nueva.
export function formatVisitorAnnouncement(session) {
  return (
    `👤 *Nuevo visitante en digitalcode.es*\n` +
    `🆔 sesión \`${session.id}\`\n` +
    `—————————————————\n` +
    `Respondo a este mensaje y la respuesta se reenvía a esa sesión.`
  );
}