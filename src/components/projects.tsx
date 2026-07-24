"use client";

import { motion } from "framer-motion";
import { SectionWrapper, SectionHeading } from "@/components/section-wrapper";
import { Badge } from "@/components/ui/badge";
import { projects } from "@/lib/data";
import { ExternalLink } from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export function Projects() {
  return (
    <SectionWrapper id="proyectos">
      <SectionHeading label="Proyectos" title="Trabajo reciente" />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects
          .filter((p) => p.featured)
          .map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-900 hover:shadow-lg hover:shadow-violet-600/5"
            >
              <div className="mb-4 flex items-start justify-between">
                <Badge variant="secondary">{p.category}</Badge>
                <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  {p.repo && (
                    <a
                      href={p.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-500 transition-colors hover:text-white"
                    >
                      <GithubIcon className="h-4 w-4" />
                    </a>
                  )}
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-500 transition-colors hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <h3 className="mb-2 text-lg font-semibold transition-colors group-hover:text-violet-400">
                {p.title}
              </h3>
              <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-zinc-400">
                {p.desc}
              </p>

              <div className="flex flex-wrap gap-2">
                {p.tech.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-zinc-800/80 px-2.5 py-1 text-[11px] text-zinc-500"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
      </div>

      {/* More projects link */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-10 text-center"
      >
        <a
          href="https://github.com/ignacioimatik-web"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <GithubIcon className="h-4 w-4" />
          Ver todos en GitHub
          <span>→</span>
        </a>
      </motion.div>
    </SectionWrapper>
  );
}
