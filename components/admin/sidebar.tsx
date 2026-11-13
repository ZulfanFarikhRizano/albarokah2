'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import {
  LayoutDashboard, Wallet, HandCoins, Beef, CalendarDays, Mic2, Users, Megaphone,
  MessageSquareHeart, CalendarRange, Landmark, LogOut, Settings, ExternalLink, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logoutAction } from '@/lib/actions';

const items = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Kas', href: '/admin/kas', icon: Wallet },
  { label: 'Pengajian', href: '/admin/pengajian', icon: CalendarDays },
  { label: 'Warta', href: '/admin/warta', icon: Megaphone },
  { label: 'Imam & Khatib', href: '/admin/imam', icon: Mic2 },
  { label: 'Pengurus', href: '/admin/pengurus', icon: Users },
  { label: 'Kotak Saran', href: '/admin/saran', icon: MessageSquareHeart },
  { label: 'Infaq', href: '/admin/infaq', icon: Landmark },
  { label: 'Booking', href: '/admin/booking', icon: CalendarRange },
  { label: 'Zakat (musiman)', href: '/admin/zakat', icon: HandCoins },
  { label: 'Kurban (musiman)', href: '/admin/kurban', icon: Beef },
  { label: 'Pengaturan', href: '/admin/pengaturan', icon: Settings },
];

/** Tombol Keluar: langsung berubah "Keluar…" + spinner saat diklik. */
function LogoutButton({ compact }: { compact: boolean }) {
  const { pending } = useFormStatus();
  const Icon = pending ? Loader2 : LogOut;
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        'transition duration-150 active:scale-95 disabled:pointer-events-none disabled:opacity-60',
        compact
          ? 'inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400'
          : 'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30'
      )}
    >
      <Icon size={compact ? 13 : 16} className={pending ? 'animate-spin' : undefined} />
      {pending ? 'Keluar…' : 'Keluar'}
    </button>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const mobileNavRef = useRef<HTMLElement>(null);
  // Menu yang baru diklik langsung tampil aktif, tanpa menunggu halaman tujuan selesai dimuat.
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  // Geser otomatis tombol aktif ke tengah layar HP
  useEffect(() => {
    const activeEl = mobileNavRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    activeEl?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [pathname, pendingHref]);

  const current = pendingHref ?? pathname;

  const link = (href: string, label: string, Icon: typeof Wallet, compact: boolean) => {
    const active = current === href;
    const loading = pendingHref === href && pathname !== href;
    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? 'page' : undefined}
        onClick={(e) => {
          // Abaikan Ctrl/Cmd/Shift-klik (buka tab baru) supaya status tidak "menggantung".
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          if (href !== pathname) setPendingHref(href);
        }}
        className={cn(
          'flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition duration-150 active:scale-[0.97]',
          compact && 'whitespace-nowrap',
          active
            ? 'bg-primary-50 font-semibold text-primary-700 dark:bg-primary-950/60 dark:text-primary-300'
            : 'text-foreground/60 hover:bg-muted'
        )}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Icon size={16} />}
        {label}
      </Link>
    );
  };

  return (
    <>
      {/* TAMPILAN DESKTOP */}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-background md:block">
        <div className="flex h-16 items-center px-5 font-extrabold text-primary-900 dark:text-primary-400">
          Panel Admin
        </div>
        <nav className="flex flex-col gap-0.5 px-3 pb-4" aria-label="Navigasi admin desktop">
          {items.map(({ label, href, icon }) => link(href, label, icon, false))}

          <div className="my-2 border-t border-border" />

          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground/60 transition duration-150 hover:bg-muted active:scale-[0.97]"
          >
            <ExternalLink size={16} /> Lihat website
          </Link>

          <form action={logoutAction}>
            <LogoutButton compact={false} />
          </form>
        </nav>
      </aside>

      {/* TAMPILAN MOBILE */}
      <div className="border-b border-border bg-background md:hidden">
        <div className="flex items-center justify-between border-b border-border/50 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary-900 dark:text-primary-400">Panel Admin</span>
            <span className="text-foreground/30">•</span>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-medium text-foreground/60 hover:text-primary-700"
            >
              <ExternalLink size={12} /> Website
            </Link>
          </div>

          <form action={logoutAction}>
            <LogoutButton compact />
          </form>
        </div>

        <nav
          ref={mobileNavRef}
          aria-label="Navigasi admin mobile"
          className="flex gap-1 overflow-x-auto px-3 py-2 scroll-smooth"
        >
          {items.map(({ label, href, icon }) => link(href, label, icon, true))}
        </nav>
      </div>
    </>
  );
}