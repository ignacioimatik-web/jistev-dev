import { NextRequest, NextResponse } from "next/server";
import { listMessages, mailConfigured } from "@/lib/mail";

export async function GET(req: NextRequest) {
  if (!mailConfigured()) {
    return NextResponse.json({ error: "Correo no configurado" }, { status: 503 });
  }
  const folder = req.nextUrl.searchParams.get("folder") || "INBOX";
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") || "1", 10) || 1);
  const q = req.nextUrl.searchParams.get("q") || "";
  try {
    const data = await listMessages(folder, page, 30, q);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "No se pudo cargar el correo." }, { status: 500 });
  }
}