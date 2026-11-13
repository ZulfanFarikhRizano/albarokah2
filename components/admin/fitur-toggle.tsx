'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/admin/toast';
import type { ActionResult } from '@/lib/actions';

/**
 * Saklar fitur musiman dengan optimistic UI: label & status berubah SEKETIKA
 * saat diklik; kalau server gagal, otomatis dikembalikan + toast error.
 */
export function FiturToggle({
  nama,
  aktif,
  action,
}: {
  nama: string;
  aktif: boolean;
  action: (aktif: boolean) => Promise<ActionResult>;
}) {
  const [on, setOn] = useState(aktif);
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const toast = useToast();

  // Sinkron dengan data server setelah halaman disegarkan.
  useEffect(() => setOn(aktif), [aktif]);

  const toggle = async () => {
    if (busy.current) return;
    const next = !on;
    busy.current = true;
    setOn(next);
    setPending(true);
    try {
      const res = await action(next);
      if (res.ok) {
        toast.success(next ? `${nama} ditampilkan di website.` : `${nama} disembunyikan dari website.`);
      } else {
        setOn(!next);
        toast.error(res.message);
      }
    } catch {
      setOn(!next);
      toast.error('Koneksi bermasalah. Periksa internet Anda lalu coba lagi.');
    } finally {
      busy.current = false;
      setPending(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div>
        <p className="font-semibold">{nama}</p>
        <p className="text-sm text-foreground/55">{on ? 'Tampil di website' : 'Disembunyikan'}</p>
      </div>
      <Button type="button" variant={on ? 'outline' : 'primary'} loading={pending} onClick={toggle}>
        {on ? 'Sembunyikan' : 'Tampilkan'}
      </Button>
    </div>
  );
}