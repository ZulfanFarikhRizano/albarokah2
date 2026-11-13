import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "outline" | "ghost" | "accent";

const variants: Record<Variant, string> = {
  primary: "bg-primary-600 text-white shadow-sm hover:shadow-md hover:brightness-125",
  outline: "border border-border text-foreground hover:border-primary-500 hover:bg-muted",
  ghost: "text-primary-700 hover:bg-primary-100",
  accent: "bg-accent-400 text-onAccent shadow-sm hover:shadow-md hover:bg-accent-500",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  href?: string;
  /** true = tampilkan spinner dan nonaktifkan tombol (cegah klik ganda). */
  loading?: boolean;
};

export function Button({
  variant = "primary",
  className,
  href,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    // transition-colors -> transition (ikut animasi transform) + efek tekan saat diklik/disentuh
    "inline-flex cursor-pointer select-none items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60",
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
    <button className={classes} aria-busy={loading || undefined} {...props} disabled={disabled || loading}>
      {loading && <Loader2 size={16} className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
}