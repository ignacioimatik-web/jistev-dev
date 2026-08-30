import { NextRequest, NextResponse } from "next/server";
import { getAttachment, mailConfigured } from "@/lib/mail";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!mailConfigured()) {
    return NextResponse.json({ error: "Correo no configurado" }, { status: 503 });
  }
  const folder = req.nextUrl.searchParams.get("folder") || "INBOX";
  const uid = parseInt(req.nextUrl.searchParams.get("uid") || "0", 10);
  const index = parseInt(req.nextUrl.searchParams.get("i") || "0", 10);
  if (!uid || Number.isNaN(uid) || Number.isNaN(index) || index < 0 || index > 100) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }
  try {
    const res = await getAttachment(folder, uid, index);
    if (!res) {
      return NextResponse.json({ error: "Adjunto no encontrado" }, { status: 404 });
    }
    const { buffer, attachment } = res;
    const asciiName =
      attachment.filename
        .normalize("NFKD")
        .replace(/[^\x20-\x7E]/g, "_")
        .replace(/["\\]/g, "_") || "adjunto";
    // inline for embedded images and PDFs (browser viewer), download otherwise
    const inline =
      attachment.disposition === "inline" ||
      attachment.contentType.startsWith("image/") ||
      attachment.contentType === "application/pdf" ||
      attachment.contentType === "text/plain";
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": attachment.contentType,
        "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(attachment.filename)}`,
        "Content-Length": String(buffer.length),
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch {
    return NextResponse.json({ error: "No se pudo leer el adjunto." }, { status: 500 });
  }
}