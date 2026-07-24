import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = {
  default: "bg-violet-600 text-white hover:bg-violet-500",
  outline: "border border-zinc-700 text-zinc-300 hover:border-zinc-600 hover:text-white",
  ghost: "text-zinc-400 hover:text-white",
  link: "text-violet-400 underline-offset-4 hover:underline",
} as const;

const buttonSizes = {
  default: "h-10 px-5 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-12 rounded-full px-8 text-base",
  icon: "h-10 w-10",
} as const;

type ButtonVariant = keyof typeof buttonVariants;
type ButtonSize = keyof typeof buttonSizes;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? "span" : "button";
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:pointer-events-none disabled:opacity-50",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
