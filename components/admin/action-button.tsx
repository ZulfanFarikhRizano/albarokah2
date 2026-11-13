'use client';

import { useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/admin/toast';
import type { ActionResult } from '@/lib/actions';

/**
 * Tombol sekali-klik untuk aksi server (Setujui, Tolak, Tandai dibaca, dst).
 * Langsung menampilkan spinner + disabled saat diklik, lalu toast hasilnya.
 */
export function ActionButton({
  action,
  children,
  className,
  successMessage,
}: {
  action: () => Promise<ActionResult>;
  children: React.ReactNode;
  className?: string;
  successMessage?: string;
}) {
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const toast = useToast();

  const onClick = async () => {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    try {
      const res = await action();
      if (res.ok) toast.success(successMessage ?? res.message);
      else toast.error(res.message);
    } catch {
      toast.error('Koneksi bermasalah. Periksa internet Anda lalu coba lagi.');
    } finally {
      busy.current = false;
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-busy={pending}
      className={cn(
        'inline-flex items-center gap-1.5 transition duration-150 active:scale-95 disabled:pointer-events-none disabled:opacity-60',
        className
      )}
    >
      {pending && <Loader2 size={12} className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
}