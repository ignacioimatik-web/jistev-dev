import { NextRequest, NextResponse } from "next/server";
import { readMessage, setSeen, mailConfigured } from "@/lib/mail";

export async function GET(req: NextRequest) {
  if (!mailConfigured()) {
    return NextResponse.json({ error: "Correo no configurado" }, { status: 503 });
  }
  const folder = req.nextUrl.searchParams.get("folder") || "INBOX";
  const uid = parseInt(req.nextUrl.searchParams.get("uid") || "0", 10);
  if (!uid || Number.isNaN(uid)) {
    return NextResponse.json({ error: "uid inválido" }, { status: 400 });
  }
  try {
    const msg = await readMessage(folder, uid);
    if (!msg) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    await setSeen(folder, uid, true);
    return NextResponse.json(msg);
  } catch {
    return NextResponse.json({ error: "No se pudo leer el correo." }, { status: 500 });
  }
}