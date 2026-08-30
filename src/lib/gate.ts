// Shared gate logic for /correo — works on edge (middleware) and node (route handlers).
// Cookie value = hex(HMAC-SHA256(MAIL_GATE_SECRET, MAIL_GATE_PIN))
export const COOKIE_NAME = "correo_sess";

const enc = new TextEncoder();

async function makeToken(): Promise<string> {
  const pin = process.env.MAIL_GATE_PIN || "";
  const secret = process.env.MAIL_GATE_SECRET || "correo-gate-secret";
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(pin));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isValidCookie(value: string | undefined | null): Promise<boolean> {
  if (!value) return false;
  const expected = await makeToken();
  if (value.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < value.length; i++) {
    diff |= value.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0; // constant-time compare
}

export async function cookieValue(): Promise<string> {
  return makeToken();
}