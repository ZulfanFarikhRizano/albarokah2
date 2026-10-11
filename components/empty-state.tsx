import type { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, title, hint }: { icon: LucideIcon; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-10 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-700">
        <Icon size={20} />
      </span>
      <p className="mt-3 font-semibold text-foreground">{title}</p>
      {hint && <p className="mt-1 max-w-[44ch] text-sm text-foreground/55">{hint}</p>}
    </div>
  );
}
