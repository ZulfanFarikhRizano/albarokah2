import { cn } from "@/lib/utils";
import React from "react";

type Tone = "green" | "yellow" | "neutral";

const tones: Record<Tone, string> = {
  green: "bg-primary-50 text-primary-700",
  yellow: "bg-accent-100 text-accent-500",
  neutral: "bg-muted text-foreground/70",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
