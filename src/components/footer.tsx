export function Footer() {
  return (
    <footer className="px-6 pb-24 pt-16 text-center">
      <p className="mx-auto mb-9 max-w-[640px] text-3xl font-bold tracking-tight sm:text-4xl">
        ¿Tienes una idea?{" "}
        <span className="text-orange-400">Hagámosla funcionar.</span>
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <a
          href="mailto:ignacio@digitalcode.es"
          className="rounded-[8px] border border-line px-5 py-3 font-mono text-sm text-zinc-400 transition-colors hover:border-orange-500 hover:text-orange-400"
        >
          @ email
        </a>
        <a
          href="https://github.com/ignacioimatik-web"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-[8px] border border-line px-5 py-3 font-mono text-sm text-zinc-400 transition-colors hover:border-orange-500 hover:text-orange-400"
        >
          @ github
        </a>
      </div>
      <p className="mt-12 flex items-center justify-center gap-2 font-mono text-xs text-zinc-500">
        <img
          src="/logo.png"
          alt=""
          aria-hidden
          className="h-3.5 w-3.5 shrink-0"
        />
        © {new Date().getFullYear()}{" "}
        <a
          href="https://digitalcode.es"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-300 transition-colors hover:text-orange-400"
        >
          digitalcode.es
        </a>
      </p>
    </footer>
  );
}