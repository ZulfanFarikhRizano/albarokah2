'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Wallet, HandCoins, Beef, CalendarDays, Mic2, Users, Megaphone,
  MessageSquareHeart, CalendarRange, Landmark, LogOut, Settings, ExternalLink,
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

export function AdminSidebar() {
  const pathname = usePathname();
  const mobileNavRef = useRef<HTMLElement>(null);

  // Efek untuk menggeser otomatis tombol aktif ke tengah layar HP
  useEffect(() => {
    if (mobileNavRef.current) {
      const activeEl = mobileNavRef.current.querySelector<HTMLElement>('[aria-current="page"]');
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }
    }
  }, [pathname]);

  const link = (href: string, label: string, Icon: typeof Wallet, compact: boolean) => {
    const active = pathname === href;
    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          compact && 'whitespace-nowrap',
          active
            ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-semibold'
            : 'text-foreground/60 hover:bg-muted'
        )}
      >
        <Icon size={16} />
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
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground/60 hover:bg-muted transition-colors"
          >
            <ExternalLink size={16} /> Lihat website
          </Link>

          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <LogOut size={16} /> Keluar
            </button>
          </form>
        </nav>
      </aside>

      {/* TAMPILAN MOBILE */}
      <div className="border-b border-border bg-background md:hidden">
        {/* Header Mobile */}
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
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-md bg-red-50 dark:bg-red-950/50 px-2.5 py-1 text-xs font-bold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-100 transition-all active:scale-95"
            >
              <LogOut size={13} /> Keluar
            </button>
          </form>
        </div>

        {/* Bilah Menu Geser Horizontal */}
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