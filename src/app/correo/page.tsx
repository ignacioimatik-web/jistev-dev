"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Folder {
  path: string;
  label: string;
  unread: number;
}
interface MailSummary {
  uid: number;
  subject: string;
  from: string;
  date: number;
  flags: string[];
  size: number;
}
interface FullMail extends MailSummary {
  text: string;
  html: string | null;
  attachments: MailAttachment[];
}
interface MailAttachment {
  index: number;
  filename: string;
  contentType: string;
  size: number;
  disposition: "inline" | "attachment" | null;
  cid: string | null;
}

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function fmtDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay)
    return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
}

function senderName(from: string): string {
  return from.split("<")[0].trim() || from;
}

export default function CorreoPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folder, setFolder] = useState("INBOX");
  const [msgs, setMsgs] = useState<MailSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [sel, setSel] = useState<FullMail | null>(null);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [compose, setCompose] = useState(false);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendMsg, setSendMsg] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [view, setView] = useState<"comoda" | "densa">("comoda");
  const [sort, setSort] = useState<"new" | "old">("new");
  const [query, setQuery] = useState("");
  const [bulkAction, setBulkAction] = useState<string | null>(null);

  const loadFolders = useCallback(async () => {
    try {
      const r = await fetch("/api/correo/folders");
      const d = await r.json();
      if (d.folders) setFolders(d.folders);
    } catch {}
  }, []);

  const loadList = useCallback(
    async (f: string, p: number, q: string = "") => {
      setLoading(true);
      setErr(null);
      try {
        const qs = q ? `&q=${encodeURIComponent(q)}` : "";
        const r = await fetch(`/api/correo/list?folder=${encodeURIComponent(f)}&page=${p}${qs}`);
        const d = await r.json();
        if (d.error) setErr(d.error);
        else {
          setMsgs(d.messages || []);
          setTotal(d.total || 0);
        }
      } catch {
        setErr("Error al cargar el correo");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const runBulk = async (action: string) => {
    const uids = Array.from(selected);
    if (!uids.length || bulkAction) return;
    setBulkAction(action);
    try {
      await fetch("/api/correo/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder, uids, action }),
      });
      setSelected(new Set());
      loadList(folder, page, query);
      loadFolders();
    } finally {
      setBulkAction(null);
    }
  };

  const toggleSelect = (uid: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  };

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  useEffect(() => {
    setPage(1);
    setSel(null);
    setSelected(new Set());
    loadList(folder, 1);
  }, [folder, loadList]);

  const openMsg = async (m: MailSummary) => {
    setLoadingMsg(true);
    setSendMsg(null);
    try {
      const r = await fetch(`/api/correo/read?folder=${encodeURIComponent(folder)}&uid=${m.uid}`);
      const d = await r.json();
      if (d.error) setErr(d.error);
      else {
        setSel(d);
        // refresh list to update read state
        loadList(folder, page);
      }
    } catch {
      setErr("Error al abrir el correo");
    } finally {
      setLoadingMsg(false);
    }
  };

  const handleDelete = async (m: MailSummary) => {
    setDeletingId(m.uid);
    try {
      await fetch("/api/correo/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder, uid: m.uid }),
      });
      if (sel?.uid === m.uid) setSel(null);
      loadList(folder, page);
      loadFolders();
    } finally {
      setDeletingId(null);
    }
  };

  const handleSend = async () => {
    setSending(true);
    setSendMsg(null);
    try {
      const r = await fetch("/api/correo/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, text: body }),
      });
      const d = await r.json();
      if (d.error) setSendMsg(`Error: ${d.error}`);
      else {
        setSendMsg("Enviado ✓");
        setCompose(false);
        setTo(""); setSubject(""); setBody("");
        setFolder("INBOX.Sent");
        loadFolders();
      }
    } catch {
      setSendMsg("Error de red");
    } finally {
      setSending(false);
    }
  };

  const unreadTotal = folders.reduce((a, f) => a + f.unread, 0);

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-6xl flex-col px-5 py-24">
      <div className="mb-8">
        <p className="font-mono text-xs text-cyan-400">$ webmail</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold tracking-tight">
            Bandeja de{" "}
            <span className="text-orange-400">digitalcode.es</span>
          </h1>
          <button
            onClick={async () => {
              await fetch("/api/correo/logout", { method: "POST" });
              window.location.href = "/correo/login";
            }}
            className="rounded-[8px] border border-line px-3 py-1.5 font-mono text-xs text-zinc-400 transition-colors hover:border-red-500/50 hover:text-red-400"
          >
            ⏻ cerrar sesión
          </button>
        </div>
        <p className="mt-2 text-sm text-zinc-400">
          ignacio@digitalcode.es · vía servidor de Raiola
          {unreadTotal > 0 && (
            <span className="ml-2 rounded-full bg-orange-600/20 px-2 py-0.5 text-xs text-orange-300">
              {unreadTotal} sin leer
            </span>
          )}
        </p>
      </div>

      {err && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {err}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-1">
          <button
            onClick={() => setCompose(true)}
            className="mb-3 w-full rounded-[10px] bg-orange-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            ✎ Redactar
          </button>
          {folders.map((f) => {
            const active = folder === f.path;
            return (
              <button
                key={f.path}
                onClick={() => {
                  setFolder(f.path);
                  setCompose(false);
                }}
                className={`flex w-full items-center justify-between rounded-[10px] px-3.5 py-2.5 text-left text-sm font-mono transition-colors ${
                  active
                    ? "bg-orange-600/15 text-orange-300"
                    : "text-zinc-400 hover:bg-subtle/60 hover:text-zinc-200"
                }`}
              >
                <span>{f.label}</span>
                {f.unread > 0 && (
                  <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs font-semibold text-cyan-300">
                    {f.unread}
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-3">
            <a
              href="https://webmail.digitalcode.es"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2.5 font-mono text-xs text-zinc-400 transition-colors hover:border-orange-500 hover:text-orange-400"
            >
              ↗ Webmail Roundcube
            </a>
          </div>
        </aside>

        {/* Main panel */}
        <section className="overflow-hidden rounded-[14px] border border-line bg-card/50">
          {compose ? (
            <div className="p-6">
              <h2 className="mb-5 text-lg font-semibold">Nuevo correo</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block font-mono text-xs text-zinc-500">Para</label>
                  <input
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="destinatario@dominio.es"
                    className="w-full rounded-[10px] border border-line bg-subtle/60 px-3.5 py-2.5 text-sm outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-mono text-xs text-zinc-500">Asunto</label>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Asunto"
                    className="w-full rounded-[10px] border border-line bg-subtle/60 px-3.5 py-2.5 text-sm outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-mono text-xs text-zinc-500">Mensaje</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={10}
                    className="w-full rounded-[10px] border border-line bg-subtle/60 px-3.5 py-2.5 text-sm leading-relaxed outline-none focus:border-orange-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSend}
                    disabled={sending}
                    className="rounded-[10px] bg-orange-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
                  >
                    {sending ? "Enviando…" : "Enviar"}
                  </button>
                  <button
                    onClick={() => setCompose(false)}
                    className="rounded-[10px] border border-line px-5 py-2.5 text-sm text-zinc-400 hover:text-zinc-200"
                  >
                    Cancelar
                  </button>
                  {sendMsg && (
                    <span className="text-sm text-emerald-400">{sendMsg}</span>
                  )}
                </div>
              </div>
            </div>
          ) : sel ? (
            <div className="p-6">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold leading-snug">{sel.subject}</h2>
                  <p className="mt-1 font-mono text-sm text-zinc-400">{sel.from}</p>
                  <p className="mt-0.5 text-xs text-zinc-600">
                    {new Date(sel.date).toLocaleString("es-ES")}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => handleDelete(sel)}
                    disabled={deletingId === sel.uid || loadingMsg}
                    className="rounded-[10px] border border-red-500/30 px-3 py-2 text-xs text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                  >
                    {deletingId === sel.uid ? "…" : "🗑"}
                  </button>
                  <button
                    onClick={() => setSel(null)}
                    className="rounded-[10px] border border-line px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200"
                  >
                    ← Volver
                  </button>
                </div>
              </div>
              <div className="rounded-[12px] border border-line bg-subtle/40 p-5">
                {loadingMsg ? (
                  <p className="text-sm text-zinc-500">Cargando…</p>
                ) : sel.html ? (
                  <iframe
                    srcDoc={sel.html}
                    sandbox="allow-popups"
                    title="Contenido del correo"
                    className="h-[62vh] w-full rounded-[8px] border-0 bg-white"
                  />
                ) : (
                  <div className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-zinc-300">
                    {sel.text || "(sin contenido)"}
                  </div>
                )}
              </div>
              {!loadingMsg && sel.attachments.length > 0 && (
                <div className="mt-3 rounded-[12px] border border-line bg-subtle/40 p-4">
                  <p className="mb-2 font-mono text-xs text-zinc-500">
                    Adjuntos ({sel.attachments.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sel.attachments.map((att) => {
                      const isPdf = att.contentType.includes("pdf");
                      const isImg = att.contentType.startsWith("image/");
                      return (
                        <a
                          key={att.index}
                          href={`/api/correo/attachment?folder=${encodeURIComponent(
                            folder
                          )}&uid=${sel.uid}&i=${att.index}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={
                            isPdf
                              ? "Abrir PDF"
                              : isImg
                                ? "Ver imagen"
                                : "Descargar"
                          }
                          className="inline-flex max-w-full items-center gap-2 rounded-[8px] border border-line bg-card/60 px-3 py-2 font-mono text-xs text-zinc-300 transition-colors hover:border-cyan-500/50 hover:text-cyan-300"
                        >
                          <span aria-hidden>
                            {isPdf ? "📄" : isImg ? "🖼" : "📎"}
                          </span>
                          <span className="max-w-[240px] truncate">
                            {att.filename}
                          </span>
                          <span className="shrink-0 text-zinc-500">
                            · {fmtBytes(att.size)}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between border-b border-line px-5 py-3">
                <span className="font-mono text-xs text-zinc-500">
                  {folder.replace(/^INBOX\.?/, "") || "Recibidos"}{" "}
                  · {total} mensajes
                </span>
                <div className="flex gap-2 font-mono text-xs">
                  <button
                    onClick={() => {
                      const p = Math.max(1, page - 1);
                      setPage(p);
                      loadList(folder, p, query);
                    }}
                    disabled={page <= 1}
                    className="rounded-md border border-line px-2 py-1 text-zinc-400 hover:text-zinc-200 disabled:opacity-40"
                  >
                    ‹
                  </button>
                  <span className="px-1 py-1 text-zinc-500">{page}</span>
                  <button
                    onClick={() => {
                      const p = page + 1;
                      setPage(p);
                      loadList(folder, p, query);
                    }}
                    disabled={page * 30 >= total}
                    className="rounded-md border border-line px-2 py-1 text-zinc-400 hover:text-zinc-200 disabled:opacity-40"
                  >
                    ›
                  </button>
                </div>
              </div>

              {/* Toolbar: busqueda, refresh, vista, orden, seleccion */}
              <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2.5">
                <div className="flex flex-1 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={msgs.length > 0 && msgs.every((m) => selected.has(m.uid))}
                    onChange={() => {
                      const allSelected = msgs.length > 0 && msgs.every((m) => selected.has(m.uid));
                      if (allSelected) setSelected(new Set());
                      else setSelected(new Set(msgs.map((m) => m.uid)));
                    }}
                    className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-orange-500"
                    title="Seleccionar todo (página)"
                  />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setPage(1);
                        loadList(folder, 1, query);
                      }
                    }}
                    placeholder="🔎 buscar por remitente/asunto"
                    className="w-full max-w-[280px] rounded-[8px] border border-line bg-subtle/60 px-3 py-1.5 text-xs outline-none focus:border-cyan-500"
                  />
                  {query && (
                    <button
                      onClick={() => {
                        setQuery("");
                        setPage(1);
                        loadList(folder, 1, "");
                      }}
                      className="text-xs text-zinc-500 hover:text-red-400"
                      title="Limpiar búsqueda"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    title="Refrescar"
                    onClick={() => loadList(folder, page, query)}
                    className="rounded-md border border-line px-2.5 py-1.5 text-xs text-zinc-400 transition-colors hover:text-cyan-400"
                  >
                    ↻
                  </button>
                  <button
                    title="Vista de lista: cómoda / densa"
                    onClick={() => setView(view === "comoda" ? "densa" : "comoda")}
                    className="rounded-md border border-line px-2.5 py-1.5 text-xs text-zinc-400 transition-colors hover:text-cyan-400"
                  >
                    {view === "comoda" ? "⋮⋮ cosy" : "— — dense"}
                  </button>
                  <button
                    title="Ordenar"
                    onClick={() => setSort(sort === "new" ? "old" : "new")}
                    className="rounded-md border border-line px-2.5 py-1.5 text-xs text-zinc-400 transition-colors hover:text-cyan-400"
                  >
                    {sort === "new" ? "↓ recientes" : "↑ antiguos"}
                  </button>
                </div>
              </div>

              {/* Bulk actions bar */}
              {selected.size > 0 && (
                <div className="flex flex-wrap items-center gap-2 border-b border-line bg-orange-600/5 px-4 py-2.5">
                  <span className="font-mono text-xs text-orange-300">
                    {selected.size} seleccionado{selected.size > 1 ? "s" : ""}
                  </span>
                  <button
                    onClick={() => runBulk("seen")}
                    disabled={!!bulkAction}
                    className="rounded-md border border-line px-2.5 py-1 text-xs text-zinc-300 hover:text-cyan-300 disabled:opacity-50"
                  >
                    ✓ leer
                  </button>
                  <button
                    onClick={() => runBulk("unseen")}
                    disabled={!!bulkAction}
                    className="rounded-md border border-line px-2.5 py-1 text-xs text-zinc-300 hover:text-cyan-300 disabled:opacity-50"
                  >
                    ◌ no leer
                  </button>
                  <button
                    onClick={() => runBulk("delete")}
                    disabled={!!bulkAction}
                    className="rounded-md border border-red-500/40 px-2.5 py-1 text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                  >
                    {bulkAction === "delete" ? "…" : "🗑 borrar"}
                  </button>
                  <button
                    onClick={() => setSelected(new Set())}
                    className="ml-auto text-xs text-zinc-500 hover:text-zinc-200"
                  >
                    cancelar
                  </button>
                </div>
              )}
              <ul className="divide-y divide-line/60">
                {loading ? (
                  <li className="p-6 text-sm text-zinc-500">Cargando correos…</li>
                ) : msgs.length === 0 ? (
                  <li className="p-6 text-sm text-zinc-500">
                    {query ? "Sin resultados para esa búsqueda" : "Bandeja vacía"}
                  </li>
                ) : (
                  [...msgs]
                    .sort((a, b) =>
                      sort === "new" ? b.date - a.date : a.date - b.date
                    )
                    .map((m) => {
                      const isSel = selected.has(m.uid);
                      const isSeen = m.flags.includes("\\Seen");
                      return (
                        <motion.li
                          key={m.uid}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`flex cursor-pointer items-center gap-3 transition-colors hover:bg-subtle/50 ${
                            isSel ? "bg-orange-600/5" : ""
                          } ${view === "densa" ? "px-4 py-2" : "px-5 py-3.5"}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSel}
                            onChange={() => toggleSelect(m.uid)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-orange-500"
                          />
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${
                              isSeen ? "bg-zinc-700" : "bg-cyan-400"
                            }`}
                          />
                          <div
                            className="min-w-0 flex-1"
                            onClick={() => openMsg(m)}
                          >
                            <p
                              className={`truncate text-sm ${
                                isSeen ? "text-zinc-400" : "font-semibold text-zinc-100"
                              }`}
                            >
                              {senderName(m.from)}
                            </p>
                            <p
                              className={`truncate text-xs ${
                                isSeen ? "text-zinc-600" : "text-zinc-400"
                              }`}
                            >
                              {m.subject}
                            </p>
                          </div>
                          <span className="shrink-0 font-mono text-xs text-zinc-600">
                            {fmtDate(m.date)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(m);
                            }}
                            disabled={deletingId === m.uid}
                            className="shrink-0 rounded-md px-2 py-1 text-xs text-zinc-600 transition-colors hover:text-red-400 disabled:opacity-40"
                          >
                            {deletingId === m.uid ? "…" : "✕"}
                          </button>
                        </motion.li>
                      );
                    })
                )}
              </ul>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}