import { NextRequest, NextResponse } from "next/server";
import { sendMail, mailConfigured } from "@/lib/mail";

export async function POST(req: NextRequest) {
  if (!mailConfigured()) {
    return NextResponse.json({ error: "Correo no configurado" }, { status: 503 });
  }
  try {
    const body = await req.json();
    const to = String(body.to || "").trim();
    const subject = String(body.subject || "").trim();
    const text = String(body.text || "").trim();
    if (!to || !subject) {
      return NextResponse.json({ error: "Faltan destinatario o asunto" }, { status: 400 });
    }
    await sendMail(to, subject, text, body.replyTo);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo enviar el correo." }, { status: 500 });
  }
}