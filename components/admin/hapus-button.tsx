'use client';

import { useEffect, useRef, useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/admin/toast';
import type { ActionResult } from '@/lib/actions';

// Baris yang diredupkan seketika saat hapus dikonfirmasi (optimistic UI).
const ROW_SELECTOR = '[data-row], tr, li, details';

export function HapusButton({
  action,
  label = 'Hapus item',
  konfirmasi,
}: {
  action: () => Promise<ActionResult>;
  label?: string;
  konfirmasi?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const busy = useRef(false);
  const toast = useToast();

  // Tutup modal dengan tombol Esc.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const handleDelete = async () => {
    if (busy.current) return;
    busy.current = true;

    // 1) Modal langsung menutup & baris meredup SEKETIKA (tidak menunggu server).
    setIsOpen(false);
    const row = triggerRef.current?.closest<HTMLElement>(ROW_SELECTOR) ?? null;
    row?.classList.add('opacity-40', 'pointer-events-none', 'transition-opacity');
    const undo = () => row?.classList.remove('opacity-40', 'pointer-events-none');

    // 2) Server bekerja di belakang layar; hasilnya lewat toast.
    try {
      const res = await action();
      if (res.ok) {
        toast.success(res.message);
      } else {
        undo();
        toast.error(res.message);
      }
    } catch {
      undo();
      toast.error('Koneksi bermasalah. Periksa internet Anda lalu coba lagi.');
    } finally {
      busy.current = false;
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={label}
        className="rounded-lg p-2 text-foreground/40 transition duration-150 hover:bg-red-50 hover:text-red-600 active:scale-90 dark:hover:bg-red-950/40 dark:hover:text-red-400"
      >
        <Trash2 size={16} />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Konfirmasi hapus"
          // Tanpa backdrop-blur: efek blur membuat modal patah-patah di HP kelas menengah ke bawah.
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
              <AlertTriangle size={24} />
            </div>

            <div className="mt-4 text-center">
              <h3 className="text-base font-bold text-foreground">Konfirmasi Hapus</h3>
              <p className="mt-2 text-xs leading-relaxed text-foreground/60">
                {konfirmasi ? (
                  konfirmasi
                ) : (
                  <>
                    Apakah Anda yakin ingin menghapus data ini? Tindakan ini{' '}
                    <span className="font-semibold text-red-600 dark:text-red-400">tidak dapat dibatalkan</span>.
                  </>
                )}
              </p>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                autoFocus
                onClick={() => setIsOpen(false)}
                className="flex-1 rounded-xl border border-border bg-muted/50 py-2.5 text-xs font-semibold text-foreground/80 transition duration-150 hover:bg-muted active:scale-95"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white shadow-sm transition duration-150 hover:bg-red-700 active:scale-95 dark:bg-red-700"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}