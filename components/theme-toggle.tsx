'use client';

import { useEffect, useState, useTransition } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next = !document.documentElement.classList.contains('dark');
    
    const doc = document as unknown as {
      startViewTransition?: (callback: () => void) => { ready: Promise<void> };
    };

    const applyTheme = () => {
      startTransition(() => {
        document.documentElement.classList.toggle('dark', next);
        localStorage.setItem('theme', next ? 'dark' : 'light');
        setIsDark(next);
      });
    };

    if (typeof document !== 'undefined' && doc.startViewTransition) {
      const buttonRect = e.currentTarget.getBoundingClientRect();
      const x = buttonRect.left + buttonRect.width / 2;
      const y = buttonRect.top + buttonRect.height / 2;

      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const transition = doc.startViewTransition(() => {
        applyTheme();
      });

      transition.ready.then(() => {
        // Lingkaran SELALU mekar membesar dari 0px ke radius maksimal
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ];

        // SELALU animasikan view-transition-new (tema yang baru masuk)
        document.documentElement.animate(
          {
            clipPath: clipPath,
          },
          {
            duration: 500,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)',
          }
        );
      });
    } else {
      applyTheme();
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
      className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground/70 transition-all duration-300 hover:bg-muted hover:scale-105 active:scale-95"
    >
      {isDark === null ? (
        <span className="block h-4 w-4" aria-hidden="true" />
      ) : isDark ? (
        <Sun size={16} className="transition-transform duration-500 rotate-0 hover:rotate-90 text-amber-400" />
      ) : (
        <Moon size={16} className="transition-transform duration-500 -rotate-12 hover:rotate-0 text-slate-700" />
      )}
    </button>
  );
}