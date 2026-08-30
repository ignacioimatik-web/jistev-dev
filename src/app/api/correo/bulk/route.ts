import { NextRequest, NextResponse } from "next/server";
import { bulkDelete, bulkSetSeen, mailConfigured } from "@/lib/mail";

export async function POST(req: NextRequest) {
  if (!mailConfigured()) {
    return NextResponse.json({ error: "Correo no configurado" }, { status: 503 });
  }
  try {
    const body = await req.json();
    const folder = typeof body.folder === "string" ? body.folder : "INBOX";
    const uids: number[] = Array.isArray(body.uids)
      ? body.uids.map((n: any) => parseInt(n, 10)).filter((n: number) => !Number.isNaN(n))
      : [];
    const action = String(body.action || "");
    if (!uids.length) return NextResponse.json({ error: "Sin selección" }, { status: 400 });

    if (action === "delete") {
      await bulkDelete(folder, uids);
    } else if (action === "seen" || action === "unseen") {
      await bulkSetSeen(folder, uids, action === "seen");
    } else {
      return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
    }
    return NextResponse.json({ ok: true, affected: uids.length });
  } catch {
    return NextResponse.json({ error: "No se pudo ejecutar la acción." }, { status: 500 });
  }
}