import { NextRequest, NextResponse } from "next/server";
import * as nodemailer from "nodemailer";
import { escapeHtml, isValidEmail, isRateLimited, getClientIp } from "@/lib/mail-utils";

interface QuoteItem {
  name: string;
  price: number;
}

function isValidItem(item: unknown): item is QuoteItem {
  return (
    typeof item === "object" &&
    item !== null &&
    typeof (item as QuoteItem).name === "string" &&
    typeof (item as QuoteItem).price === "number" &&
    Number.isFinite((item as QuoteItem).price)
  );
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (isRateLimited(`quote:${ip}`)) {
      return NextResponse.json(
        { error: "Demasiados envíos. Espera unos minutos e inténtalo de nuevo." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, company, description, budget: clientBudget, items, services } = body;
    const honeypot = body.website;

    if (honeypot) {
      return NextResponse.json({ success: true });
    }

    if (
      typeof name !== "string" || !name.trim() ||
      typeof description !== "string" || !description.trim() ||
      !isValidEmail(email)
    ) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios o el email no es válido" },
        { status: 400 }
      );
    }

    if (name.length > 200 || description.length > 8000 || (company && String(company).length > 200)) {
      return NextResponse.json(
        { error: "Alguno de los campos supera el tamaño permitido" },
        { status: 400 }
      );
    }

    // Los items vienen del cliente (los eligió el usuario en el configurador),
    // pero no nos fiamos ciegamente: filtramos cualquier entrada malformada
    // y recalculamos el total en el servidor en vez de confiar en el que mande el cliente.
    const validItems: QuoteItem[] = Array.isArray(items) ? items.filter(isValidItem) : [];
    const total = validItems.reduce((sum, i) => sum + i.price, 0);

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeCompany = company ? escapeHtml(company) : "";
    const safeDescription = escapeHtml(description);
    const safeBudget = clientBudget ? escapeHtml(clientBudget) : "";

    const itemsHtml = validItems.length
      ? validItems
          .map(
            (i) =>
              `<tr><td style="padding:10px 0;border-bottom:1px solid #27272a;color:#e4e4e7;">${escapeHtml(i.name)}</td><td style="padding:10px 0;border-bottom:1px solid #27272a;color:#fafafa;text-align:right;">${i.price.toLocaleString()} €</td></tr>`
          )
          .join("") +
        `<tr><td style="padding:12px 0;font-weight:600;color:#fafafa;font-size:15px;">TOTAL ESTIMADO</td><td style="padding:12px 0;text-align:right;font-weight:700;color:#a78bfa;font-size:17px;">${total.toLocaleString()} €</td></tr>`
      : "";

    const toEmail = "ignacio@digitalcode.es";

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#a78bfa,#8b5cf6);padding:28px;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:22px;">📋 Nueva solicitud de presupuesto</h1>
        </div>
        <div style="background:#18181b;padding:28px;border-radius:0 0 12px 12px;border:1px solid #27272a;">

          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#a1a1aa;font-size:13px;width:100px;">Cliente</td><td style="padding:8px 0;color:#fafafa;font-size:14px;">${safeName}</td></tr>
            ${safeCompany ? `<tr><td style="padding:8px 0;color:#a1a1aa;font-size:13px;">Empresa</td><td style="padding:8px 0;color:#fafafa;font-size:14px;">${safeCompany}</td></tr>` : ""}
            <tr><td style="padding:8px 0;color:#a1a1aa;font-size:13px;">Email</td><td style="padding:8px 0;color:#fafafa;font-size:14px;"><a href="mailto:${safeEmail}" style="color:#a78bfa;">${safeEmail}</a></td></tr>
            <tr><td colspan="2" style="padding-top:12px;"><hr style="border:none;border-top:1px solid #27272a;"></td></tr>
          </table>

          ${
            itemsHtml
              ? `<h3 style="color:#a1a1aa;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-top:20px;margin-bottom:4px;">Presupuesto estimado</h3>
                 <table style="width:100%;border-collapse:collapse;">${itemsHtml}</table>`
              : ""
          }

          <h3 style="color:#a1a1aa;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-top:20px;margin-bottom:4px;">Descripción del proyecto</h3>
          <div style="background:#1a1a1e;border:1px solid #27272a;border-radius:8px;padding:16px;margin-top:8px;">
            <p style="color:#e4e4e7;font-size:14px;line-height:1.6;white-space:pre-wrap;margin:0;">${safeDescription}</p>
          </div>

          ${
            safeBudget
              ? `<p style="margin-top:16px;color:#a1a1aa;font-size:13px;">Presupuesto indicado por el cliente: <strong style="color:#fafafa;">${safeBudget}</strong></p>`
              : ""
          }

          <div style="margin-top:24px;padding-top:16px;border-top:1px solid #27272a;">
            <p style="color:#52525b;font-size:12px;">Este presupuesto se generó desde jistev.dev/presupuesto</p>
          </div>
        </div>
      </div>
    `;

    // Send email
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const fromEmail = process.env.SMTP_FROM || smtpUser;

    if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: { user: smtpUser, pass: smtpPass },
      });

      // To me
      await transporter.sendMail({
        from: `"jistev.dev Presupuestos" <${fromEmail}>`,
        replyTo: `"${safeName}" <${email}>`,
        to: toEmail,
        subject: `📋 Presupuesto solicitado por ${safeName}${safeCompany ? ` (${safeCompany})` : ""}`,
        text: `Nombre: ${name}\nEmail: ${email}\nEmpresa: ${company || "-"}\n\nMensaje:\n${description}\n\nTotal estimado: ${total || "A consultar"}€`,
        html,
      });

      // Copy to client
      await transporter.sendMail({
        from: `"jistev.dev" <${fromEmail}>`,
        to: email,
        subject: `📄 Tu solicitud de presupuesto - jistev.dev`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:linear-gradient(135deg,#a78bfa,#8b5cf6);padding:28px;border-radius:12px 12px 0 0;">
              <h1 style="color:#fff;margin:0;font-size:22px;">✅ Presupuesto recibido</h1>
            </div>
            <div style="background:#18181b;padding:28px;border-radius:0 0 12px 12px;border:1px solid #27272a;">
              <p style="color:#e4e4e7;font-size:14px;line-height:1.6;">Hola <strong>${safeName}</strong>,</p>
              <p style="color:#a1a1aa;font-size:14px;line-height:1.6;">He recibido tu solicitud de presupuesto. Te responderé en menos de <strong>24 horas</strong> con un desglose detallado y plazos concretos.</p>

              ${
                itemsHtml
                  ? `<div style="background:#1a1a1e;border:1px solid #27272a;border-radius:8px;padding:16px;margin:20px 0;">
                       <table style="width:100%;border-collapse:collapse;">${itemsHtml}</table>
                     </div>`
                  : ""
              }

              <p style="color:#a1a1aa;font-size:14px;line-height:1.6;">Si mientras tanto tienes alguna duda, puedes responderme directamente a este email.</p>
              <p style="color:#a1a1aa;font-size:14px;">— Ignacio (jistev)</p>
              <hr style="border:none;border-top:1px solid #27272a;margin:20px 0;">
              <p style="color:#52525b;font-size:12px;">jistev.dev · Desarrollo Full-Stack & Automatización con IA</p>
            </div>
          </div>
        `,
      });
    } else {
      console.log("── QUOTE FORM ──────────────────────");
      console.log("  Nombre:  ", name);
      console.log("  Email:   ", email);
      console.log("  Empresa: ", company || "-");
      console.log("  Servicios:", services);
      console.log("  Total:   ", total);
      console.log("  Mensaje: ", description);
      console.log("  → SMTP no configurado");
      console.log("──────────────────────────────────────");
    }

    return NextResponse.json({ success: true, total });
  } catch (error) {
    console.error("Quote error:", error);
    return NextResponse.json(
      { error: "Error al enviar el presupuesto. Intenta de nuevo." },
      { status: 500 }
    );
  }
}