"use client";

import { useState } from "react";

export default function CorreoLogin() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!pin || loading) return;
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/correo/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (r.ok) {
        // Navegación dura: garantiza que la cookie httpOnly de la respuesta
        // del POST ya está en el navegador antes de pedir /correo.
        // (router.push podía adelantarse al Set-Cookie y el middleware
        // redirigía de vuelta al login.)
        window.location.assign("/correo");
      } else {
        setPin("");
        setError("PIN incorrecto");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center px-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="w-full max-w-sm rounded-[16px] border border-line bg-card/60 p-8"
      >
        <p className="font-mono text-xs text-cyan-400">$ secure</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          Acceso al correo
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          ignacio@digitalcode.es · introduce tu PIN
        </p>

        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, "").slice(0, 8));
            setError(null);
          }}
          placeholder="••••••"
          className="mt-6 w-full rounded-[10px] border border-line bg-subtle/60 px-4 py-3 text-center font-mono text-xl tracking-[0.4em] outline-none focus:border-orange-500"
          maxLength={8}
        />

        {error && (
          <p className="mt-3 text-center text-sm text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || pin.length < 8}
          className="mt-6 w-full rounded-[10px] bg-orange-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? "Verificando…" : "Entrar"}
        </button>

        <a
          href="/"
          className="mt-4 block text-center font-mono text-xs text-zinc-500 transition-colors hover:text-orange-400"
        >
          ← volver al inicio
        </a>
      </form>
    </main>
  );
}