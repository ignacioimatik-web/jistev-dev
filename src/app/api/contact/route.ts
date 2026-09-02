import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { escapeHtml, isValidEmail, isRateLimited, getClientIp } from "@/lib/mail-utils";
import { sendTelegramNotification } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (isRateLimited(`contact:${ip}`)) {
      return NextResponse.json(
        { error: "Demasiados envíos. Espera unos minutos e inténtalo de nuevo." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, message } = body;
    // Honeypot: campo oculto que solo rellenan los bots (invisible para humanos en el form)
    const honeypot = body.website;

    if (honeypot) {
      // Respondemos éxito falso para no delatar el honeypot a los bots
      return NextResponse.json({ success: true });
    }

    if (
      typeof name !== "string" || !name.trim() ||
      typeof message !== "string" || !message.trim() ||
      !isValidEmail(email)
    ) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios y el email debe ser válido" },
        { status: 400 }
      );
    }

    if (name.length > 200 || message.length > 5000) {
      return NextResponse.json(
        { error: "El nombre o el mensaje son demasiado largos" },
        { status: 400 }
      );
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message);

    // Config SMTP desde variables de entorno
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const toEmail = "ignacio@digitalcode.es";
    const fromEmail = process.env.SMTP_FROM || smtpUser;

    if (smtpHost && smtpUser && smtpPass) {
      // --- Modo REAL: enviar email vía SMTP ---
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: `"jistev.dev" <${fromEmail}>`,
        replyTo: `"${safeName}" <${email}>`,
        to: toEmail,
        subject: `Nuevo proyecto de ${safeName}`,
        text: `Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${message}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:linear-gradient(135deg,#fb923c,#f97316);padding:24px;border-radius:12px 12px 0 0;">
              <h1 style="color:#fff;margin:0;font-size:20px;">📬 Nuevo contacto desde jistev.dev</h1>
            </div>
            <div style="background:#18181b;padding:24px;border-radius:0 0 12px 12px;border:1px solid #27272a;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px 0;color:#a1a1aa;font-size:13px;">Nombre</td><td style="padding:8px 0;color:#fafafa;font-size:14px;">${safeName}</td></tr>
                <tr><td style="padding:8px 0;color:#a1a1aa;font-size:13px;">Email</td><td style="padding:8px 0;color:#fafafa;font-size:14px;"><a href="mailto:${safeEmail}" style="color:#fb923c;">${safeEmail}</a></td></tr>
                <tr><td colspan="2" style="padding-top:16px;"><hr style="border:none;border-top:1px solid #27272a;"></td></tr>
                <tr><td style="padding:8px 0;color:#a1a1aa;font-size:13px;vertical-align:top;">Mensaje</td><td style="padding:8px 0;color:#fafafa;font-size:14px;white-space:pre-wrap;">${safeMessage}</td></tr>
              </table>
            </div>
          </div>
        `,
      });
    } else {
      // --- Modo DEV: log + mailto fallback ---
      console.log("── CONTACT FORM ──────────────────────");
      console.log("  Nombre:  ", name);
      console.log("  Email:   ", email);
      console.log("  Mensaje: ", message);
      console.log("  → Para enviar, configura SMTP_HOST, SMTP_USER, SMTP_PASS en .env");
      console.log("──────────────────────────────────────");
    }

    // Reenvío a Telegram: siempre se intenta (complementa al email, no lo sustituye)
    await sendTelegramNotification({ name, email, message });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Error al enviar el mensaje. Intenta de nuevo o escribe a ignacio@digitalcode.es directamente." },
      { status: 500 }
    );
  }
}
