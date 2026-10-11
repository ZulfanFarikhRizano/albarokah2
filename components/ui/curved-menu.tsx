'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface iNavItem {
  heading: string;
  href: string;
  subheading?: string;
}

interface iNavLinkProps extends iNavItem {
  setIsActive: (isActive: boolean) => void;
  index: number;
}

interface iCurvedNavbarProps {
  setIsActive: (isActive: boolean) => void;
  navItems: iNavItem[];
}

interface iHeaderProps {
  navItems?: iNavItem[];
  footer?: React.ReactNode;
}

const MENU_SLIDE_ANIMATION = {
  initial: { x: 'calc(100% + 100px)' },
  enter: { x: '0', transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } },
  exit: {
    x: 'calc(100% + 100px)',
    transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
  },
} as const;

const defaultNavItems: iNavItem[] = [
  { heading: 'Beranda', href: '/', subheading: 'Kembali ke halaman utama' },
  { heading: 'Kas', href: '/kas', subheading: 'Transparansi kas masjid' },
  { heading: 'Jadwal Sholat', href: '/jadwal-sholat', subheading: 'Real-time & notifikasi azan' },
  { heading: 'Kiblat', href: '/kiblat', subheading: 'Kompas arah kiblat' },
  { heading: 'Infaq', href: '/infaq', subheading: 'Infaq digital via QRIS' },
  { heading: 'Pengurus', href: '/pengurus', subheading: 'Profil pengurus DKM' },
  { heading: 'Saran', href: '/saran', subheading: 'Kotak saran jamaah' },
];

const CustomFooter: React.FC = () => {
  return (
    <div className="flex w-full items-center justify-between border-t border-foreground/10 px-10 py-5 text-xs text-foreground/70 md:px-24">
      <span>DKM Masjid Jami&apos; Al Barokah</span>
      <span>Masa Khidmat 2024 – 2029</span>
    </div>
  );
};

const NavLink: React.FC<iNavLinkProps> = ({ heading, href, subheading, setIsActive, index }) => {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
  };

  const handleClick = () => setIsActive(false);

  // Diperbaiki dari versi asli: keterangan "link eksternal" ditentukan dari
  // href sungguhan (bukan posisi/index tetap), supaya tidak ada tautan
  // internal yang salah dibuka di tab baru.
  const isExternalLink = /^https?:\/\//.test(href);
  const linkProps = isExternalLink ? { target: '_blank', rel: 'noopener noreferrer' } : {};

  return (
    <motion.div
      onClick={handleClick}
      initial="initial"
      whileHover="whileHover"
      className="group relative flex items-center justify-between border-b border-foreground/15 py-4 uppercase transition-colors duration-500 md:py-6"
    >
      <Link ref={ref} onMouseMove={handleMouseMove} href={href} {...linkProps}>
        <div className="relative flex items-start">
          <span className="mr-2 text-2xl font-thin text-foreground/40 transition-colors duration-500 md:text-3xl">
            {String(index).padStart(2, '0')}.
          </span>
          <div className="flex flex-col">
            <motion.span
              variants={{ initial: { x: 0 }, whileHover: { x: -12 } }}
              transition={{ type: 'spring', staggerChildren: 0.06, delayChildren: 0.2 }}
              className="relative z-10 block text-2xl font-extralight text-foreground transition-colors duration-500 md:text-3xl"
            >
              {heading.split('').map((letter, i) => (
                <motion.span
                  key={i}
                  variants={{ initial: { x: 0 }, whileHover: { x: 12 } }}
                  transition={{ type: 'spring' }}
                  className="inline-block"
                >
                  {letter === ' ' ? '\u00A0' : letter}
                </motion.span>
              ))}
            </motion.span>
            {subheading && (
              <span className="mt-1 text-xs font-normal normal-case text-foreground/45">{subheading}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const Curve: React.FC = () => {
  // Diperbaiki dari versi asli: `window` tidak tersedia saat SSR. Komponen
  // ini hanya pernah dirender di client (setelah menu dibuka), tapi guard
  // ini tetap dipasang sebagai jaring pengaman agar kode tidak pernah crash
  // walau dipakai ulang di konteks lain nanti.
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const initialPath = `M100 0 L200 0 L200 ${vh} L100 ${vh} Q-100 ${vh / 2} 100 0`;
  const targetPath = `M100 0 L200 0 L200 ${vh} L100 ${vh} Q100 ${vh / 2} 100 0`;

  const curve = {
    initial: { d: initialPath },
    enter: { d: targetPath, transition: { duration: 1, ease: [0.76, 0, 0.24, 1] } },
    exit: { d: initialPath, transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } },
  };

  return (
    <svg className="absolute -left-[99px] top-0 h-full w-[100px] stroke-none" style={{ fill: 'rgb(var(--c-background))' }}>
      <motion.path variants={curve} initial="initial" animate="enter" exit="exit" />
    </svg>
  );
};

const Scrim: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <motion.button
    type="button"
    aria-label="Tutup menu navigasi"
    onClick={onClick}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1, transition: { duration: 0.5 } }}
    exit={{ opacity: 0, transition: { duration: 0.5 } }}
    className="fixed inset-0 z-30 cursor-pointer bg-black/55"
  />
);

const CurvedNavbar: React.FC<iCurvedNavbarProps & { footer?: React.ReactNode }> = ({
  setIsActive,
  navItems,
  footer,
}) => {
  return (
    <motion.div
      variants={MENU_SLIDE_ANIMATION}
      initial="initial"
      animate="enter"
      exit="exit"
      // Diperbaiki dari versi asli: `w-screen max-w-screen-sm` jadi 100vw di
      // layar HP (< 640px), sehingga panel menutupi seluruh layar tanpa
      // sisa ruang untuk di-tap agar tertutup. Sekarang lebar dipatok
      // proporsional (78vw) dengan batas atas 380px di layar lebar, plus
      // border kiri supaya batas panel tetap kelihatan walau warnanya mirip.
      className="fixed right-0 top-0 z-40 h-[100dvh] w-[78vw] border-l border-border bg-background shadow-2xl sm:w-[380px]"
    >
      <div className="flex h-full flex-col justify-between overflow-y-auto pt-11">
        <div className="mt-0 flex flex-col gap-3 px-8 text-5xl md:px-20">
          <div className="mb-1 border-b border-foreground/15 pb-2 text-sm uppercase text-foreground/50">
            <p>Navigasi</p>
          </div>
          <section className="mt-0 bg-transparent">
            <div className="mx-auto max-w-7xl">
              {navItems.map((item, index) => (
                <NavLink key={item.href} {...item} setIsActive={setIsActive} index={index + 1} />
              ))}
            </div>
          </section>
        </div>
        {footer}
      </div>
      <Curve />
    </motion.div>
  );
};

const Header: React.FC<iHeaderProps> = ({ navItems = defaultNavItems, footer = <CustomFooter /> }) => {
  const [isActive, setIsActive] = useState(false);

  React.useEffect(() => {
    if (!isActive) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsActive(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isActive]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsActive((v) => !v)}
        aria-expanded={isActive}
        aria-label={isActive ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
        className="relative z-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-background"
      >
        <span className="relative flex h-4 w-5 flex-col items-center justify-between">
          <span
            className={`block h-[2px] w-5 bg-foreground transition-transform duration-300 ${isActive ? 'translate-y-[7px] rotate-45' : ''}`}
          />
          <span className={`block h-[2px] w-5 bg-foreground transition-opacity duration-300 ${isActive ? 'opacity-0' : ''}`} />
          <span
            className={`block h-[2px] w-5 bg-foreground transition-transform duration-300 ${isActive ? '-translate-y-[7px] -rotate-45' : ''}`}
          />
        </span>
      </button>

      <AnimatePresence>
        {isActive && (
          <>
            <Scrim key="scrim" onClick={() => setIsActive(false)} />
            <CurvedNavbar key="curved-navbar" setIsActive={setIsActive} navItems={navItems} footer={footer} />
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
export { Header, defaultNavItems };
export type { iNavItem };
