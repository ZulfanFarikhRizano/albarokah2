'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';

type WaktuSholat = { nama: string; jam: string };

function menitKeDetik(jam: string) {
  const [h, m] = jam.split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(h, m, 0, 0);
  return Math.floor((target.getTime() - now.getTime()) / 1000);
}

function cariSholatBerikutnya(waktu: WaktuSholat[]) {
  for (const w of waktu) {
    const sisa = menitKeDetik(w.jam);
    if (sisa > 0) return { nama: w.nama, sisaDetik: sisa };
  }
  return { nama: waktu[0].nama, sisaDetik: menitKeDetik(waktu[0].jam) + 24 * 3600 };
}

function formatCountdown(totalDetik: number) {
  const jam = Math.floor(totalDetik / 3600);
  const menit = Math.floor((totalDetik % 3600) / 60);
  const detik = totalDetik % 60;
  return [jam, menit, detik].map((v) => String(v).padStart(2, '0')).join(':');
}

function formatTanggalHariIni() {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date());
}

// Jadwal sholat ASLI hari ini dari Aladhan API (metode Kemenag RI = 20)
async function fetchJadwalSholat(lat: number, lng: number): Promise<WaktuSholat[]> {
  const now = new Date();
  const tanggalUrl = [
    String(now.getDate()).padStart(2, '0'),
    String(now.getMonth() + 1).padStart(2, '0'),
    now.getFullYear(),
  ].join('-');

  const url = `https://api.aladhan.com/v1/timings/${tanggalUrl}?latitude=${lat}&longitude=${lng}&method=20`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Gagal mengambil jadwal sholat');
  const json = await res.json();
  const t = json?.data?.timings;
  if (!t) throw new Error('Format respons API tidak sesuai');

  const bersihkan = (s: string) => s.slice(0, 5);
  return [
    { nama: 'Subuh', jam: bersihkan(t.Fajr) },
    { nama: 'Dzuhur', jam: bersihkan(t.Dhuhr) },
    { nama: 'Ashar', jam: bersihkan(t.Asr) },
    { nama: 'Maghrib', jam: bersihkan(t.Maghrib) },
    { nama: 'Isya', jam: bersihkan(t.Isha) },
  ];
}

export function PrayerCard({ lokasi, lat, lng }: { lokasi: string; lat: number | null; lng: number | null }) {
  const [waktu, setWaktu] = useState<WaktuSholat[] | null>(null);
  const [gagal, setGagal] = useState(false);
  const [sisa, setSisa] = useState<{ nama: string; sisaDetik: number } | null>(null);
  const [tanggalHariIni, setTanggalHariIni] = useState<string | null>(null);

  const muat = useCallback(() => {
    if (lat === null || lng === null) return () => {};
    let batal = false;
    setGagal(false);
    setWaktu(null);
    fetchJadwalSholat(lat, lng)
      .then((hasil) => {
        if (!batal) setWaktu(hasil);
      })
      .catch(() => {
        if (!batal) setGagal(true);
      });
    return () => {
      batal = true;
    };
  }, [lat, lng]);

  useEffect(() => muat(), [muat]);

  useEffect(() => {
    if (!waktu) return;
    setSisa(cariSholatBerikutnya(waktu));
    setTanggalHariIni(formatTanggalHariIni());

    const interval = setInterval(() => {
      setSisa((prev) => {
        if (!prev || prev.sisaDetik <= 1) return cariSholatBerikutnya(waktu);
        return { ...prev, sisaDetik: prev.sisaDetik - 1 };
      });
      setTanggalHariIni(formatTanggalHariIni());
    }, 1000);

    return () => clearInterval(interval);
  }, [waktu]);

  return (
    <Card className="w-full overflow-hidden p-4 sm:p-5">
      {/* Header Card Responsif & Anti-Overflow */}
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-bold text-primary-900 dark:text-primary-400 text-base sm:text-lg">
          Waktu Sholat Hari Ini
        </h2>
        <span className="text-xs text-foreground/50 truncate max-w-full sm:max-w-[220px]">
          {[lokasi, tanggalHariIni].filter(Boolean).join(' · ') || '...'}
        </span>
      </div>

      {lat === null || lng === null ? (
        <p role="alert" className="rounded-xl bg-muted p-4 text-sm text-foreground/70">
          Koordinat masjid belum diatur. Pengurus dapat mengisinya di Panel Admin &rarr; Pengaturan.
        </p>
      ) : gagal ? (
        <div role="alert" className="rounded-xl bg-muted p-4 text-sm text-foreground/70">
          <p>Jadwal sholat belum bisa dimuat. Periksa koneksi internet Anda.</p>
          <button
            type="button"
            onClick={muat}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-background"
          >
            <RefreshCw size={13} /> Coba lagi
          </button>
        </div>
      ) : !waktu ? (
        <div className="space-y-2">
          <div className="h-16 animate-pulse rounded-2xl bg-muted" />
          <div className="h-40 animate-pulse rounded-xl bg-muted" />
        </div>
      ) : (
        <>
          {/* Banner Hijau Sholat Berikutnya (Anti Terpotong di Mobile) */}
          <div className="mb-4 flex items-center justify-between gap-2.5 rounded-2xl bg-primary-600 dark:bg-primary-700 px-3.5 py-3 sm:px-4 sm:py-3.5 text-white shadow-xs overflow-hidden">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] sm:text-xs text-white/80">Sholat berikutnya</p>
              <p className="text-base sm:text-lg font-bold truncate text-white">
                {sisa?.nama ?? '—'}
              </p>
            </div>
            <div
              className="tabular shrink-0 text-right text-lg sm:text-2xl font-extrabold tracking-tight text-white leading-none"
              role="timer"
            >
              {sisa ? formatCountdown(sisa.sisaDetik) : '--:--:--'}
            </div>
          </div>

          {/* List Waktu Sholat */}
          <ul className="divide-y divide-dashed divide-border">
            {waktu.map((w) => (
              <li key={w.nama} className="flex min-h-11 items-center justify-between py-2.5 text-sm sm:text-base">
                <span className={w.nama === sisa?.nama ? 'font-bold text-primary-700 dark:text-primary-400' : 'text-foreground/70'}>
                  {w.nama}
                </span>
                <time className="tabular font-semibold text-foreground/90">{w.jam}</time>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}