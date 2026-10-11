'use client';

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
          active ? 'bg-primary-50 text-primary-700' : 'text-foreground/60 hover:bg-muted'
        )}
      >
        <Icon size={16} />
        {label}
      </Link>
    );
  };

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-background md:block">
        <div className="flex h-16 items-center px-5 font-extrabold text-primary-900">Panel Admin</div>
        <nav className="flex flex-col gap-0.5 px-3 pb-4" aria-label="Navigasi admin">
          {items.map(({ label, href, icon }) => link(href, label, icon, false))}
          <Link href="/" className="mt-3 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground/50 hover:bg-muted">
            <ExternalLink size={16} /> Lihat website
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground/50 hover:bg-muted">
              <LogOut size={16} /> Keluar
            </button>
          </form>
        </nav>
      </aside>

      {/* Mobile: bilah menu geser horizontal */}
      <nav aria-label="Navigasi admin" className="flex gap-1 overflow-x-auto border-b border-border bg-background px-3 py-2 md:hidden">
        {items.map(({ label, href, icon }) => link(href, label, icon, true))}
        <form action={logoutAction} className="shrink-0">
          <button type="submit" className="flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-foreground/50 hover:bg-muted">
            <LogOut size={16} /> Keluar
          </button>
        </form>
      </nav>
    </>
  );
}
