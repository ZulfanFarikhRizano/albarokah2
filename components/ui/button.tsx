import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

type Variant = "primary" | "outline" | "ghost" | "accent";

const variants: Record<Variant, string> = {
  primary: "bg-primary-600 text-white hover:brightness-110",
  outline: "border border-border text-foreground hover:bg-muted",
  ghost: "text-primary-700 hover:bg-primary-50",
  accent: "bg-accent-400 text-onAccent hover:bg-accent-500",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  href?: string;
};

export function Button({ variant = "primary", className, href, children, ...props }: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors",
    variants[variant],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
