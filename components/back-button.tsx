'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

/**
 * Tombol kembali di navbar (tampil di semua halaman kecuali beranda).
 * - Kalau pengguna berpindah halaman di dalam website → kembali ke halaman sebelumnya.
 * - Kalau halaman dibuka langsung (tautan/bookmark) → ke induk halaman (beranda / dashboard admin),
 *   supaya tidak keluar dari website.
 */
export function BackButton() {
  const pathname = usePathname();
  const router = useRouter();
  const kedalaman = useRef(0);
  const pertama = useRef(true);
  const lewatPop = useRef(false);

  useEffect(() => {
    const onPop = () => {
      lewatPop.current = true;
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (pertama.current) {
      pertama.current = false;
      return;
    }
    if (lewatPop.current) {
      kedalaman.current = Math.max(0, kedalaman.current - 1);
      lewatPop.current = false;
    } else {
      kedalaman.current += 1;
    }
  }, [pathname]);

  if (pathname === '/') return null;

  const induk = pathname.startsWith('/admin/') && pathname !== '/admin/login' ? '/admin' : '/';

  return (
    <button
      type="button"
      onClick={() => (kedalaman.current > 0 ? router.back() : router.push(induk))}
      aria-label="Kembali"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-foreground/80 transition-all hover:bg-muted active:scale-95"
    >
      <ArrowLeft size={18} />
    </button>
  );
}