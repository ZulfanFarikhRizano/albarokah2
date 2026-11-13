'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

type Tone = 'success' | 'error';
type Item = { id: number; tone: Tone; message: string };
type Api = { success: (message: string) => void; error: (message: string) => void };

const ToastContext = createContext<Api>({ success: () => {}, error: () => {} });

/** Pakai di komponen client admin: const toast = useToast(); toast.success('...') */
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const seq = useRef(0);

  const push = useCallback((tone: Tone, message: string) => {
    const id = ++seq.current;
    // Maksimal 3 toast tampil sekaligus.
    setItems((list) => [...list.slice(-2), { id, tone, message }]);
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), tone === 'error' ? 5000 : 2500);
  }, []);

  const api = useMemo<Api>(
    () => ({ success: (m) => push('success', m), error: (m) => push('error', m) }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[60] flex flex-col items-center gap-2 px-4"
      >
        {items.map((t) => (
          <div
            key={t.id}
            role={t.tone === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-background shadow-lg"
          >
            {t.tone === 'success' ? (
              <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
            ) : (
              <AlertCircle size={18} className="shrink-0 text-red-500" />
            )}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}