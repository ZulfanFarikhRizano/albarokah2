"use client";

import { Button } from "@/components/ui/button";

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md px-5 py-16 text-center">
      <h1 className="text-lg font-extrabold text-primary-900">Terjadi kendala</h1>
      <p className="mt-2 text-sm text-foreground/60">
        Perubahan belum tersimpan. Periksa isian Anda lalu coba lagi.
      </p>
      {process.env.NODE_ENV !== "production" && (
        <pre className="mt-3 overflow-auto rounded-xl bg-muted p-3 text-left text-xs">{error.message}</pre>
      )}
      <Button onClick={reset} className="mt-5">Coba lagi</Button>
    </div>
  );
}
