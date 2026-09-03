// Seguridad de adjuntos: validación por MAGIC BYTES (no por extensión/MIME, que
// se falsifican), lista blanca de tipos seguros y escaneo antivirus ClamAV.
// Política fail-closed: si ClamAV no responde, el archivo se RECHAZA.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";

// Máximo por archivo (server-side; el cliente ya limita a 20MB, esto es la capa real).
export const MAX_FILE_BYTES = 20 * 1024 * 1024;
// Máximo de subidas por sesión (anti-abuso).
export const MAX_UPLOADS_PER_SESSION = 10;

// Detección por magic bytes. Cada entrada: { re: RegExp sobre los primeros bytes,
//   ext: extensiones aceptadas, label }
const SIGNATURES = [
  { re: /^%PDF-/, ext: [".pdf"], label: "pdf" },
  { re: /^\x89PNG\r\n\x1a\n/, ext: [".png"], label: "png" },
  { re: /^\xff\xd8\xff/, ext: [".jpg", ".jpeg"], label: "jpeg" },
  { re: /^GIF8/, ext: [".gif"], label: "gif" },
  { re: /^RIFF....WEBP/, ext: [".webp"], label: "webp" },
  { re: /^PK\x03\x04/, ext: [".docx", ".xlsx", ".pptx", ".odt", ".ods", ".odp"], label: "office" },
  { re: /^\x1f\x8b/, ext: [".gz"], label: "gzip" },
];

// Texto plano / CSV / JSON: sin firma mágica; validamos que sea ASCII/UTF-8
// legible y sin bytes de control peligrosos.
function looksLikeText(buffer) {
  if (buffer.length === 0) return false;
  const sample = buffer.subarray(0, Math.min(buffer.length, 8000));
  let printable = 0;
  for (const b of sample) {
    if (b === 0x09 || b === 0x0a || b === 0x0d || (b >= 0x20 && b < 0x7f) || b >= 0x80) printable++;
  }
  return printable / sample.length > 0.9;
}

// Devuelve el tipo REAL del archivo por sus primeros bytes, o null si no es
// un tipo permitido.
export function detectAllowedType(buffer) {
  for (const sig of SIGNATURES) {
    if (sig.re.test(buffer.subarray(0, 16))) return sig;
  }
  if (looksLikeText(buffer)) return { ext: [".txt", ".csv", ".md", ".json"], label: "text" };
  return null;
}

// Sanitiza el nombre de archivo (quita rutas y caracteres raros).
export function sanitizeFilename(name) {
  const base = String(name || "archivo").replace(/[\\/]/g, "_").replace(/[\x00-\x1f]/g, "").trim();
  return base.slice(0, 120) || "archivo";
}

// Comprueba que la extensión declarada es coherente con el tipo detectado.
function extensionMatches(filename, type) {
  if (!type) return false;
  const lower = filename.toLowerCase();
  return type.ext.some((e) => lower.endsWith(e));
}

// Escaneo ClamAV: escribe el buffer a un temporal y lo pasa a clamdscan.
// Devuelve { clean: true } o { clean: false, virus } ; lanza si clamd no responde.
export function scanWithClamav(buffer) {
  return new Promise((resolve, reject) => {
    const tmp = path.join(os.tmpdir(), `scan-${randomUUID()}`);
    fs.writeFileSync(tmp, buffer);
    execFile(
      "clamdscan",
      ["--no-summary", "--fdpass", tmp],
      { timeout: 30000 },
      (err, stdout, stderr) => {
        fs.unlinkSync(tmp);
        if (err) {
          // clamdscan devuelve exit code != 0 si encuentra virus O si falla.
          const out = `${stdout} ${stderr}`.trim();
          if (/FOUND/i.test(out)) {
            const virus = out.split("\n").find((l) => /FOUND/i.test(l))?.trim() || "desconocido";
            return resolve({ clean: false, virus });
          }
          return reject(new Error(`clamdscan: ${out || err.message}`));
        }
        resolve({ clean: true });
      }
    );
  });
}

// Validación completa de un adjunto. Devuelve { ok:true, buffer } o
// { ok:false, reason } — reason es un código estable para el widget.
export async function validateAttachment({ buffer, filename, mimeType, isVoice }) {
  if (!buffer || buffer.length === 0) return { ok: false, reason: "empty" };
  if (buffer.length > MAX_FILE_BYTES) return { ok: false, reason: "too_large" };

  // Voz: solo la dejamos pasar si es audio (el servidor la reconvierte a MP3/OGG
  // y es contenido generado por el propio visitante; aún así se escanea).
  if (isVoice || /^audio\//.test(mimeType || "")) {
    if (!/^audio\/(webm|ogg|mp4|mpeg|wav|mp3)/.test(mimeType || "")) {
      return { ok: false, reason: "type_not_allowed" };
    }
  } else {
    const type = detectAllowedType(buffer);
    if (!type) return { ok: false, reason: "type_not_allowed" };
    if (!extensionMatches(sanitizeFilename(filename), type)) {
      return { ok: false, reason: "extension_mismatch" };
    }
  }

  // Escaneo antivirus (fail-closed: si clamd no está, se rechaza).
  try {
    const result = await scanWithClamav(buffer);
    if (!result.clean) return { ok: false, reason: "virus", virus: result.virus };
  } catch (e) {
    return { ok: false, reason: "scanner_unavailable", detail: String(e.message).slice(0, 120) };
  }

  return { ok: true, buffer };
}
