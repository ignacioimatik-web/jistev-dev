/**
 * Escapa entidades HTML para poder interpolar texto de usuario de forma segura
 * dentro de plantillas de email en HTML. Sin esto, cualquiera podía enviar
 * <img>, <script> o enlaces de phishing camuflados en los campos del formulario,
 * y ese HTML se ejecutaba tal cual en el cliente de correo del destinatario.
 */
export function escapeHtml(value: unknown): string {
  const str = String(value ?? "");
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Validación razonable de email (no exhaustiva RFC 5322, pero filtra el 99% de basura). */
export function isValidEmail(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Rate limiting en memoria, por IP, muy básico (ventana deslizante simple).
 * Nota: en un entorno serverless con múltiples instancias esto NO es una
 * protección robusta (cada instancia tiene su propio contador), pero sí
 * frena el abuso trivial de un mismo visitante machacando el formulario.
 * Para protección real en producción, usa Vercel Firewall / un rate limiter
 * distribuido (p.ej. Upstash Ratelimit).
 */
const hits = new Map<string, number[]>();

export function isRateLimited(key: string, limit = 5, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  timestamps.push(now);
  hits.set(key, timestamps);

  // Limpieza ocasional para no acumular memoria indefinidamente
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t > windowMs)) hits.delete(k);
    }
  }

  return timestamps.length > limit;
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}