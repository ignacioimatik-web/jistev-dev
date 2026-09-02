// Proxy server-side hacia el puente Telegram (VPS).
// El navegador NUNCA ve la API key: habla con /api/telegram/* de este despliegue,
// que añade x-api-key y reenvía al puente. La URL y el secreto viven solo en las
// env vars de Vercel: TELEGRAM_BRIDGE_URL y TELEGRAM_BRIDGE_KEY.

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // nunca cachear (sesiones por request)

const BRIDGE_URL = process.env.TELEGRAM_BRIDGE_URL?.replace(/\/$/, "") || "";
const BRIDGE_KEY = process.env.TELEGRAM_BRIDGE_KEY || "";

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolved = await params;
  return proxy(req, resolved);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolved = await params;
  return proxy(req, resolved);
}

async function proxy(req: NextRequest, { path }: { path: string[] }) {
  if (!BRIDGE_URL || !BRIDGE_KEY) {
    return NextResponse.json(
      { error: "Puente no configurado. Define TELEGRAM_BRIDGE_URL y TELEGRAM_BRIDGE_KEY." },
      { status: 500 }
    );
  }

  const sub = Array.isArray(path) ? path.join("/") : "session";
  const search = req.nextUrl.search || "";
  const url = `${BRIDGE_URL}/api/${sub}${search}`;

  const init: RequestInit = {
    method: req.method,
    headers: {
      "x-api-key": BRIDGE_KEY,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  };

  if (req.method === "POST") {
    init.body = await req.text();
  }

  try {
    const res = await fetch(url, init);
    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json(
      { error: "Puente inaccesible", detail: String(e) },
      { status: 502 }
    );
  }
}