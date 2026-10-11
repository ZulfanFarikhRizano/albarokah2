"use client";

import { useFormState, useFormStatus } from "react-dom";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FormState } from "@/lib/actions";

export function SubmitButton({ children, pending: label = "Mengirim…" }: { children: React.ReactNode; pending?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="justify-self-start disabled:opacity-60">
      {pending ? label : children}
    </Button>
  );
}

/** Pembungkus form publik dengan umpan balik sukses/gagal. */
export function FormPublik({
  action,
  children,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  children: React.ReactNode;
}) {
  const [state, formAction] = useFormState(action, null);
  return (
    <form action={formAction} className="grid gap-4">
      {children}
      {state && (
        <p
          role={state.ok ? "status" : "alert"}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium ${
            state.ok ? "bg-primary-50 text-primary-700" : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
          }`}
        >
          {state.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {state.message}
        </p>
      )}
    </form>
  );
}
