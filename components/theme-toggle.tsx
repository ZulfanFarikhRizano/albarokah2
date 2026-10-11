'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  // null di render pertama (server & client sebelum mount) supaya markup SSR
  // dan hasil hydration cocok persis — ikon baru ditentukan setelah mount.
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    setIsDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground/70 transition-colors hover:bg-muted"
    >
      {/* Placeholder netral sebelum mount agar tidak ada mismatch hydration */}
      {isDark === null ? (
        <span className="block h-4 w-4" aria-hidden="true" />
      ) : isDark ? (
        <Sun size={16} />
      ) : (
        <Moon size={16} />
      )}
    </button>
  );
}
