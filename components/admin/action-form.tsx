'use client';

import { createContext, useRef, useState } from 'react';
import { useToast } from '@/components/admin/toast';
import type { ActionResult } from '@/lib/actions';

/** Dibaca oleh SubmitButton supaya tombol otomatis disabled + spinner saat form dikirim. */
export const FormPendingContext = createContext(false);

/**
 * Pengganti <form action={serverAction}> untuk panel admin.
 * - Tombol langsung berubah jadi "Menyimpan…" saat diklik (tanpa menunggu server).
 * - Mencegah klik ganda.
 * - Menampilkan toast sukses/gagal, dan isian TIDAK hilang kalau gagal.
 */
export function ActionForm({
  action,
  children,
  className,
  successMessage,
  resetOnSuccess = false,
  onSuccess,
}: {
  action: (fd: FormData) => Promise<ActionResult>;
  children: React.ReactNode;
  className?: string;
  successMessage?: string;
  resetOnSuccess?: boolean;
  onSuccess?: () => void;
}) {
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const toast = useToast();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy.current) return;
    const form = e.currentTarget;
    const fd = new FormData(form);

    busy.current = true;
    setPending(true);
    try {
      const res = await action(fd);
      if (res.ok) {
        toast.success(successMessage ?? res.message);
        if (resetOnSuccess) form.reset();
        onSuccess?.();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Koneksi bermasalah. Periksa internet Anda lalu coba lagi.');
    } finally {
      busy.current = false;
      setPending(false);
    }
  };

  return (
    <FormPendingContext.Provider value={pending}>
      <form onSubmit={onSubmit} className={className} aria-busy={pending}>
        {children}
      </form>
    </FormPendingContext.Provider>
  );
}