import { NextRequest, NextResponse } from "next/server";
import { deleteMessage, mailConfigured } from "@/lib/mail";

export async function POST(req: NextRequest) {
  if (!mailConfigured()) {
    return NextResponse.json({ error: "Correo no configurado" }, { status: 503 });
  }
  try {
    const body = await req.json();
    const folder = typeof body.folder === "string" ? body.folder : "INBOX";
    const uid = parseInt(body.uid, 10);
    if (!uid || Number.isNaN(uid)) {
      return NextResponse.json({ error: "uid inválido" }, { status: 400 });
    }
    await deleteMessage(folder, uid);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo eliminar el correo." }, { status: 500 });
  }
}