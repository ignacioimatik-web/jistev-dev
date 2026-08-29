export function Footer() {
  return (
    <footer className="px-6 pb-24 pt-16 text-center">
      <p className="mx-auto mb-9 max-w-[640px] text-3xl font-bold tracking-tight sm:text-4xl">
        ¿Tienes una idea?{" "}
        <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">
          Hagámosla funcionar.
        </span>
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <a
          href="mailto:ignacio@digitalcode.es"
          className="rounded-[8px] border border-zinc-700 px-5 py-3 font-mono text-sm text-zinc-400 transition-colors hover:border-violet-500 hover:text-violet-400"
        >
          @ email
        </a>
        <a
          href="https://github.com/ignacioimatik-web"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-[8px] border border-zinc-700 px-5 py-3 font-mono text-sm text-zinc-400 transition-colors hover:border-violet-500 hover:text-violet-400"
        >
          @ github
        </a>
      </div>
      <p className="mt-12 font-mono text-xs text-zinc-600">
        © {new Date().getFullYear()} jistev.dev
      </p>
    </footer>
  );
}