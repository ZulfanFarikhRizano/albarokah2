'use client';

import { useState, useTransition } from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';

export function HapusButton({
  action,
  label = 'Hapus item',
}: {
  action: () => Promise<{ error?: string } | void>;
  label?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await action();
      setIsOpen(false);
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={label}
        className="rounded-lg p-2 text-foreground/40 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 active:scale-95"
      >
        <Trash2 size={16} />
      </button>

      {/* Modal Dialog Konfirmasi Custom */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
              <AlertTriangle size={24} />
            </div>

            <div className="mt-4 text-center">
              <h3 className="text-base font-bold text-foreground">Konfirmasi Hapus</h3>
              <p className="mt-2 text-xs text-foreground/60 leading-relaxed">
                Apakah Anda yakin ingin menghapus data ini? Tindakan ini <span className="font-semibold text-red-600 dark:text-red-400">tidak dapat dibatalkan</span>.
              </p>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setIsOpen(false)}
                className="flex-1 rounded-xl border border-border bg-muted/50 py-2.5 text-xs font-semibold text-foreground/80 transition-colors hover:bg-muted active:scale-95 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleDelete}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-600 dark:bg-red-700 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  'Ya, Hapus'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}