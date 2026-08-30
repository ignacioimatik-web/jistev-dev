import { NextResponse } from "next/server";
import { listFolders, mailConfigured } from "@/lib/mail";

export async function GET() {
  if (!mailConfigured()) {
    return NextResponse.json({ error: "Correo no configurado" }, { status: 503 });
  }
  try {
    const folders = await listFolders();
    return NextResponse.json({ folders });
  } catch {
    return NextResponse.json({ error: "No se pudo cargar las bandejas." }, { status: 500 });
  }
}