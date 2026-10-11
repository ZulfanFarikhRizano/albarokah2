"use client";

import { Trash2 } from "lucide-react";

/** Tombol hapus dengan konfirmasi. `action` = server action yang sudah di-bind ke id. */
export function HapusButton({ action, label, konfirmasi = "Hapus data ini? Tindakan ini tidak bisa dibatalkan." }: {
  action: () => Promise<void>;
  label: string;
  konfirmasi?: string;
}) {
  return (
    <form action={action}>
      <button
        type="submit"
        aria-label={label}
        title={label}
        onClick={(e) => {
          if (!window.confirm(konfirmasi)) e.preventDefault();
        }}
        className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
      >
        <Trash2 size={15} />
      </button>
    </form>
  );
}
