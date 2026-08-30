import { ImapFlow, type FetchMessageObject } from "imapflow";
import { simpleParser } from "mailparser";
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

export interface MailAttachment {
  index: number;
  filename: string;
  contentType: string;
  size: number;
  disposition: "inline" | "attachment" | null;
  cid: string | null;
}

export interface FullMail extends MailSummary {
  text: string;
  html: string | null;
  attachments: MailAttachment[];
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Parse raw MIME source with mailparser and build the payload the UI needs:
// clean text, full HTML (with cid: embedded images rewritten to our API),
// and a flat attachment list (inline images + files, PDFs included).
export async function parseSource(
  folder: string,
  uid: number,
  source: Buffer
): Promise<{ text: string; html: string | null; attachments: MailAttachment[] }> {
  const parsed = await simpleParser(source);
  const attachments: MailAttachment[] = (parsed.attachments || []).map((att, i) => ({
    index: i,
    filename:
      att.filename ||
      (att.contentId ? att.contentId.replace(/[<>]/g, "") : `adjunto-${i + 1}`),
    contentType: att.contentType || "application/octet-stream",
    size: att.content?.length || 0,
    disposition: (att.contentDisposition as "inline" | "attachment" | null) || null,
    cid: att.contentId ? att.contentId.replace(/[<>]/g, "") : null,
  }));

  let html = parsed.html || null;
  if (html) {
    for (const att of attachments) {
      if (!att.cid) continue;
      const url = `/api/correo/attachment?folder=${encodeURIComponent(folder)}&uid=${uid}&i=${att.index}`;
      // match cid:xyz  (angle brackets around the id are optional)
      html = html.replace(new RegExp(`cid:<?${escapeRe(att.cid)}>?`, "gi"), url);
    }
    // hard cap against multi-MB newsletters
    if (html.length > 1_500_000) html = html.slice(0, 1_500_000);
  }

  return { text: (parsed.text || "").trim(), html, attachments };
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
    let html: string | null = null;
    let attachments: MailAttachment[] = [];
    try {
      const sourceBuf = (msg as any).source as Buffer | undefined;
      if (sourceBuf && sourceBuf.length) {
        const parsed = await parseSource(folder, uid, sourceBuf);
        text = parsed.text;
        html = parsed.html;
        attachments = parsed.attachments;
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
      html,
      attachments,
    };
  } finally {
    await c.logout().catch(() => {});
  }
}

// Re-fetch the raw source and return one attachment by index.
export async function getAttachment(
  folder: string,
  uid: number,
  index: number
): Promise<{ buffer: Buffer; attachment: MailAttachment } | null> {
  const c = client();
  try {
    await c.connect();
    const opened = await c.mailboxOpen(folder);
    if (!opened) return null;
    const msg = (await c.fetchOne(`${uid}`, { source: true }, { uid: true })) as
      | FetchMessageObject
      | false;
    if (!msg) return null;
    const sourceBuf = (msg as any).source as Buffer | undefined;
    if (!sourceBuf || !sourceBuf.length) return null;
    const parsed = await simpleParser(sourceBuf);
    const att = parsed.attachments?.[index];
    if (!att?.content) return null;
    return {
      buffer: att.content,
      attachment: {
        index,
        filename:
          att.filename ||
          (att.contentId ? att.contentId.replace(/[<>]/g, "") : `adjunto-${index + 1}`),
        contentType: att.contentType || "application/octet-stream",
        size: att.content.length,
        disposition: (att.contentDisposition as "inline" | "attachment" | null) || null,
        cid: att.contentId ? att.contentId.replace(/[<>]/g, "") : null,
      },
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