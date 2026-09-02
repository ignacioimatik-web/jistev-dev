// Helper para enviar avisos de contacto a Telegram.
// El token del bot y el chat_id del dueño viven en las env vars de Vercel:
//   TELEGRAM_BOT_TOKEN  -> token del bot (@jistevbot)
//   TELEGRAM_CHAT_ID    -> chat_id personal del dueño (donde se reenvían los mensajes)

export async function sendTelegramNotification(opts: {
  name: string;
  email: string;
  message: string;
}): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.log(
      "  → Para reenviar a Telegram, configura TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID"
    );
    return false;
  }

  const text =
    `📬 *Nuevo contacto desde digitalcode.es*\n\n` +
    `👤 *Nombre:* ${opts.name}\n` +
    `✉️ *Email:* ${opts.email}\n\n` +
    `💬 *Mensaje:*\n${opts.message.slice(0, 3500)}`;

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "Markdown",
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Telegram send failed:", err);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Telegram send error:", error);
    return false;
  }
}