import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none transition-colors placeholder:text-zinc-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
