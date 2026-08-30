import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, cookieValue } from "@/lib/gate";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Layer 1: per-IP brute-force protection
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const bucket = rateLimit(`auth:${ip}`);
  if (!bucket.allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera unos minutos." },
      { status: 429, headers: { "Retry-After": String(bucket.retryAfter ?? 60) } }
    );
  }

  const body = await req.json().catch(() => ({ pin: "" }));
  const pin = String(body.pin || "").trim();
  const expected = process.env.MAIL_GATE_PIN || "";

  if (!expected) {
    return NextResponse.json({ error: "PIN no configurado" }, { status: 503 });
  }

  // constant-time compare
  let ok = pin.length === expected.length;
  if (ok) {
    let diff = 0;
    for (let i = 0; i < pin.length; i++) {
      diff |= pin.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    ok = diff === 0;
  }

  if (!ok) {
    return NextResponse.json({ error: "PIN incorrecto" }, { status: 401 });
  }

  const value = await cookieValue();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
    priority: "high",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}