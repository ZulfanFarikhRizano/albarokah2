"use client";

import { useEffect, useRef, useState } from "react";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Logo DKM dari /public/images/logo.png.
 * Jika file belum ada, tampil ikon masjid sederhana sebagai pengganti
 * (supaya tidak muncul gambar rusak).
 */
export function Logo({ size = 36, className, priority }: { size?: number; className?: string; priority?: boolean }) {
  const [gagal, setGagal] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // Error bisa terjadi sebelum React hydrate, jadi cek ulang setelah mount.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setGagal(true);
  }, []);

  if (gagal) {
    return (
      <span
        className={cn("inline-flex items-center justify-center rounded-full bg-primary-600 text-white", className)}
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3l7 6v11a1 1 0 0 1-1 1h-4v-7H10v7H6a1 1 0 0 1-1-1V9l7-6z" />
        </svg>
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={SITE.logo}
      alt={`Logo ${SITE.namaDKM}`}
      width={size}
      height={size}
      loading={priority ? "eager" : "lazy"}
      onError={() => setGagal(true)}
      className={cn("object-contain", className)}
      style={{ width: size, height: size }}
    />
  );
}
