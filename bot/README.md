# Puente de chat Telegram → widget del portfolio

Proceso continuo (Node, sin dependencias) que conecta el widget de chat
embebido de `digitalcode.es` con el Telegram del dueño.

## Arrancar (en el NAS Synology o Mac)

```bash
cd bot
# 1º: crea .env a partir de .env.example (token + chat_id del dueño)
node --env-file=.env src/index.js
```

Expone una mini API (puerto 8787 por defecto):
- `GET /api/session` → crea sesión, devuelve `sessionId` + `startUrl`
- `GET /api/poll?session=X` → ¿respondió el dueño? devuelve `{reply}`
- `POST /api/send` → manda el mensaje del visitante al dueño

El widget del portfolio llama a estos endpoints. En Vercel, apunta
`NEXT_PUBLIC_TELEGRAM_API` a la URL pública de este puente (IP del NAS o túnel).

## Estado
- `conversations.json` — mapea sesiones ↔ chat_id del visitante. Se guarda localmente.
