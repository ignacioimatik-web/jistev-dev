import { ImapFlow, type FetchMessageObject } from "imapflow";
import nodemailer from "nodemailer";

const IMAP_HOST = process.env.MAIL_IMAP_HOST || "mail.digitalcode.es";
const IMAP_PORT = Number(process.env.MAIL_IMAP_PORT || 993);
const IMAP_USER = process.env.MAIL_IMAP_USER || "";
const IMAP_PASS = process.env.MAIL_IMAP_PASS || "";
const SMTP_HOST = process.env.MAIL_SMTP_HOST || IMAP_HOST;
const SMTP_PORT = Number(process.env.MAIL_SMTP_PORT || 465);
const SMTP_USER = process.env.MAIL_SMTP_USER || IMAP_USER;
const SMTP_PASS = process.env.MAIL_SMTP_PASS || IMAP_PASS;
export const MAIL_FROM = process.env.MAIL_FROM || IMAP_USER;

export function mailConfigured(): boolean {
  return Boolean(IMAP_USER && IMAP_PASS);
}

const FOLDER_LABELS: Record<string, string> = {
  INBOX: "Recibidos",
  "INBOX.Sent": "Enviados",
  "INBOX.Trash": "Papelera",
  "INBOX.Drafts": "Borradores",
  "INBOX.spam": "Spam",
  "INBOX.Junk": "Spam",
  "INBOX.Archive": "Archivo",
};

export function fmtFolder(path: string): string {
  return FOLDER_LABELS[path] || path.split(".").pop() || path;
}

function client() {
  return new ImapFlow({
    host: IMAP_HOST,
    port: IMAP_PORT,
    secure: true,
    auth: { user: IMAP_USER, pass: IMAP_PASS },
    logger: false,
  });
}

export async function listFolders(): Promise<{ path: string; label: string; unread: number }[]> {
  const c = client();
  try {
    await c.connect();
    const boxes = await c.list();
    const out: { path: string; label: string; unread: number }[] = [];
    for (const box of boxes) {
      if (box.specialUse === "\\Trash" || box.flags.has("\\Noselect")) {
        // still include trash via label but skip noselect
      }
      if (box.flags.has("\\Noselect")) continue;
      let unread = 0;
      try {
        const st = await c.status(box.path, { unseen: true });
        unread = st.unseen || 0;
      } catch {
        unread = 0;
      }
      out.push({ path: box.path, label: fmtFolder(box.path), unread });
    }
    const order = ["INBOX", "INBOX.Sent", "INBOX.Drafts", "INBOX.Trash", "INBOX.Archive", "INBOX.spam", "INBOX.Junk"];
    out.sort((a, b) => {
      const ai = order.indexOf(a.path);
      const bi = order.indexOf(b.path);
      if (ai === -1 && bi === -1) return a.label.localeCompare(b.label);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
    return out;
  } finally {
    await c.logout().catch(() => {});
  }
}

export interface MailSummary {
  uid: number;
  subject: string;
  from: string;
  date: number;
  flags: string[];
  size: number;
}

function decodeHeader(value: string): string {
  return (value || "").replace(/[\r\n\t]+/g, " ").trim();
}

function msgEnvelope(env: any): string {
  return Array.isArray(env?.from)
    ? env.from.map((f: any) => (f?.name ? `${f.name} <${f.address || ""}>` : f?.address || "")).join(", ")
    : "";
}

export interface MessageList {
  messages: MailSummary[];
  total: number;
}

export async function listMessages(folder: string, page = 1, perPage = 30, search = ""): Promise<MessageList> {
  const c = client();
  try {
    await c.connect();
    const opened = await c.mailboxOpen(folder);
    if (!opened) return { messages: [], total: 0 };
    const total = opened.exists;

    // Optional server-side search (FROM/SUBJECT/TEXT) → returns matching UIDs.
    let matchedUids: number[] | null = null;
    if (search.trim()) {
      const q = search.trim();
      const res = await c.search({ or: [{ from: q }, { subject: q }] }, { uid: true }).catch(() => null);
      matchedUids = res ? res.map(Number) : [];
      if (matchedUids.length === 0) return { messages: [], total: 0 };
    }

    // newest first: iterate a window at the end of the mailbox
    const end = total;
    const messages: MailSummary[] = [];

    if (matchedUids) {
      // Search mode: fetch matching UIDs directly (paginated among matches).
      const sorted = matchedUids.sort((a, b) => b - a); // newest first
      const pageUids = sorted.slice((page - 1) * perPage, page * perPage);
      if (!pageUids.length) return { messages: [], total: sorted.length };
      for await (const msg of c.fetch(pageUids, { envelope: true, uid: true, flags: true, size: true }, { uid: true })) {
        const env = msg.envelope as any;
        const fromAddr = msgEnvelope(env);
        messages.push({
          uid: msg.uid,
          subject: decodeHeader(env?.subject || "(sin asunto)"),
          from: fromAddr || "(desconocido)",
          date: new Date(env?.date || Date.now()).getTime(),
          flags: Array.from(msg.flags || []),
          size: msg.size || 0,
        });
      }
      return { messages, total: sorted.length };
    }

    // Normal mode: newest first window at the end of the mailbox.
    const start = Math.max(1, end - page * perPage + 1);
    if (start > end) return { messages: [], total };
    const range = start === end ? `${start}` : `${start}:${end}`;
    for await (const msg of c.fetch(range, { envelope: true, uid: true, flags: true, size: true })) {
      const env = msg.envelope as any;
      const fromAddr = msgEnvelope(env);
      messages.push({
        uid: msg.uid,
        subject: decodeHeader(env?.subject || "(sin asunto)"),
        from: fromAddr || "(desconocido)",
        date: new Date(env?.date || Date.now()).getTime(),
        flags: Array.from(msg.flags || []),
        size: msg.size || 0,
      });
    }
    // fetch returns in ascending seq for a range -> reverse to newest-first
    messages.reverse();
    return { messages, total };
  } finally {
    await c.logout().catch(() => {});
  }
}

export interface FullMail extends MailSummary {
  text: string;
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Decode RFC2047 encoded-words ("=?UTF-8?B?...?=" / "=?UTF-8?Q?...?=")
function decodeWords(s: string): string {
  return s.replace(/=\?[^?]+\?([bBqQ])\?([^?]*)\?=/g, (_m, enc, data) => {
    try {
            if (enc.toLowerCase() === "b") return Buffer.from(data, "base64").toString("utf8");
            return data
              .replace(/_/g, " ")
              .replace(/=([0-9a-fA-F]{2})/g, (_a: string, h: string) => String.fromCharCode(parseInt(h, 16)));
    } catch {
      return "";
    }
  });
}

// Decode a MIME body part given its transfer-encoding + raw content
function decodePart(raw: string, encoding: string): string {
  let out = raw.replace(/\r\n/g, "\n");
  const ct = (encoding || "").toLowerCase().trim();
  if (ct === "base64") {
    try {
      out = Buffer.from(out.replace(/\s+/g, ""), "base64").toString("utf8");
    } catch {
      out = raw;
    }
  } else if (ct === "quoted-printable") {
    out = out
      .replace(/=\r?\n/g, "")
      .replace(/=([0-9a-fA-F]{2})/g, (_a, h) => String.fromCharCode(parseInt(h, 16)));
  }
  return out;
}

// Best-effort MIME text extraction from a full raw source buffer.
// Handles nested multipart (mixed → alternative, etc.) by recursion on parts.
function extractMailText(source: Buffer): string {
  const raw = source.toString("utf8").replace(/\r\n/g, "\n");
  let plain = "";
  let html = "";

  const processRaw = (rawPart: string) => {
    const headerEnd = rawPart.indexOf("\n\n");
    if (headerEnd === -1) return;
    const head = rawPart.slice(0, headerEnd);
    const body = rawPart.slice(headerEnd + 2);
    const ctMatch = head.match(/^content-type:\s*([^;\n]+)/im);
    const teMatch = head.match(/^content-transfer-encoding:\s*([^\n]+)/im);
    const type = (ctMatch?.[1] || "").toLowerCase().trim();
    const enc = (teMatch?.[1] || "").toLowerCase().trim();
    if (type.includes("multipart")) {
      const bnd = head.match(/boundary="?([\w./_=+-]+)"?/i);
      if (!bnd) return;
      const chunks = body.split(`--${bnd[1]}`);
      for (const chunk of chunks) {
        // skip epilogue/fluff (final -- or empty)
        if (/^\s*$/.test(chunk.replace(/^-+/, ""))) continue;
        processRaw(chunk);
      }
    } else if (type.includes("text/plain")) {
      plain = plain ? `${plain}\n\n${decodePart(body, enc)}` : decodePart(body, enc);
    } else if (type.includes("text/html")) {
      html = html ? `${html}\n${decodePart(body, enc)}` : decodePart(body, enc);
    }
  };

  processRaw(raw);

  if (plain.trim()) return decodeWords(plain).trim();
  if (html.trim()) return stripHtml(decodeWords(html));
  // fallback: strip headers of raw
  const headerEnd = raw.indexOf("\n\n");
  return (headerEnd === -1 ? raw : raw.slice(headerEnd + 2)).trim();
}

export async function readMessage(folder: string, uid: number): Promise<FullMail | null> {
  const c = client();
  try {
    await c.connect();
    const opened = await c.mailboxOpen(folder);
    if (!opened) return null;
    const msg = (await c.fetchOne(`${uid}`, { envelope: true, flags: true, size: true, source: true }, { uid: true })) as
      | FetchMessageObject
      | false;
    if (!msg) return null;
    const env = msg.envelope as any;
    const fromAddr = Array.isArray(env?.from)
      ? env.from.map((f: any) => (f?.name ? `${f.name} <${f.address || ""}>` : f?.address || "")).join(", ")
      : "";

    let text = "";
    try {
      const sourceBuf = (msg as any).source as Buffer | undefined;
      if (sourceBuf && sourceBuf.length) {
        text = extractMailText(sourceBuf);
      }
    } catch {
      text = "";
    }

    return {
      uid: msg.uid,
      subject: decodeHeader(env?.subject || "(sin asunto)"),
      from: fromAddr || "(desconocido)",
      date: new Date(env?.date || Date.now()).getTime(),
      flags: Array.from(msg.flags || []),
      size: msg.size || 0,
      text,
    };
  } finally {
    await c.logout().catch(() => {});
  }
}

export async function setSeen(folder: string, uid: number, seen = true): Promise<void> {
  const c = client();
  try {
    await c.connect();
    await c.mailboxOpen(folder);
    if (seen) await c.messageFlagsAdd(`${uid}`, ["\\Seen"], { uid: true });
  } finally {
    await c.logout().catch(() => {});
  }
}

export async function deleteMessage(folder: string, uid: number): Promise<void> {
  const c = client();
  try {
    await c.connect();
    await c.mailboxOpen(folder);
    await c.messageDelete(`${uid}`, { uid: true });
  } finally {
    await c.logout().catch(() => {});
  }
}

// Bulk operations — accept arrays of UIDs.
function toUidRange(uids: number[]): string {
  return uids.sort((a, b) => a - b).join(",");
}

export async function bulkDelete(folder: string, uids: number[]): Promise<void> {
  if (!uids.length) return;
  const c = client();
  try {
    await c.connect();
    await c.mailboxOpen(folder);
    await c.messageDelete(toUidRange(uids), { uid: true });
  } finally {
    await c.logout().catch(() => {});
  }
}

export async function bulkSetSeen(folder: string, uids: number[], seen = true): Promise<void> {
  if (!uids.length) return;
  const c = client();
  try {
    await c.connect();
    await c.mailboxOpen(folder);
    const flag = "\\Seen";
    if (seen) await c.messageFlagsAdd(toUidRange(uids), [flag], { uid: true });
    else await c.messageFlagsRemove(toUidRange(uids), [flag], { uid: true });
  } finally {
    await c.logout().catch(() => {});
  }
}

export async function sendMail(to: string, subject: string, text: string, inReplyTo?: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  await transporter.sendMail({
    from: `ignacio@digitalcode.es <${MAIL_FROM}>`,
    to,
    subject,
    text,
    replyTo: inReplyTo || undefined,
  });
}