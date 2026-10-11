'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Compass, LocateFixed, MapPin, Smartphone } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Perhitungan                                                       */
/* ------------------------------------------------------------------ */
const KAABA = { lat: 21.422487, lng: 39.826206 };
const RAD = Math.PI / 180;

const norm = (d: number) => ((d % 360) + 360) % 360;
/** Selisih bertanda terpendek a - b dalam rentang -180..180 */
const selisih = (a: number, b: number) => ((a - b + 540) % 360) - 180;

function bearingKeKabah(lat: number, lng: number) {
  const p1 = lat * RAD;
  const p2 = KAABA.lat * RAD;
  const dl = (KAABA.lng - lng) * RAD;
  const y = Math.sin(dl) * Math.cos(p2);
  const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
  return norm(Math.atan2(y, x) / RAD);
}

function jarakKeKabah(lat: number, lng: number) {
  const dLat = (KAABA.lat - lat) * RAD;
  const dLng = (KAABA.lng - lng) * RAD;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat * RAD) * Math.cos(KAABA.lat * RAD) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const NAMA_ARAH = ['Utara', 'Timur Laut', 'Timur', 'Tenggara', 'Selatan', 'Barat Daya', 'Barat', 'Barat Laut'];
const namaArah = (d: number) => NAMA_ARAH[Math.round(norm(d) / 45) % 8];

/**
 * Arah HP (derajat dari utara) dari sudut alpha/beta/gamma — dikompensasi kemiringan.
 * Saat HP datar dipakai arah "atas HP"; saat HP ditegakkan dipakai arah kamera belakang;
 * di antaranya digabung halus supaya jarum tidak melompat.
 */
function arahDariEuler(alpha: number, beta: number, gamma: number) {
  const a = alpha * RAD;
  const b = beta * RAD;
  const g = gamma * RAD;

  const tx = -Math.sin(a) * Math.cos(b);
  const ty = Math.cos(a) * Math.cos(b);
  const bx = -(Math.sin(g) * Math.cos(a) + Math.cos(g) * Math.sin(b) * Math.sin(a));
  const by = -(Math.sin(g) * Math.sin(a) - Math.cos(g) * Math.sin(b) * Math.cos(a));

  const tn = Math.hypot(tx, ty);
  const bn = Math.hypot(bx, by);
  const datar = Math.abs(Math.cos(b) * Math.cos(g)); // 1 = rata, 0 = tegak
  const w = Math.min(1, Math.max(0, (datar - 0.5) / 0.3));

  const x = (tn > 1e-3 ? tx / tn : 0) * w + (bn > 1e-3 ? bx / bn : 0) * (1 - w);
  const y = (tn > 1e-3 ? ty / tn : 0) * w + (bn > 1e-3 ? by / bn : 0) * (1 - w);
  if (Math.hypot(x, y) < 1e-3) return null;
  return norm(Math.atan2(x, y) / RAD);
}

/* ------------------------------------------------------------------ */
/*  Tipe                                                              */
/* ------------------------------------------------------------------ */
type Sensor = 'idle' | 'meminta' | 'aktif' | 'ditolak' | 'tidak-didukung';
type Sumber = 'masjid' | 'gps';
type GpsStatus = 'diam' | 'mencari' | 'ok' | 'gagal';
type OrientEvt = DeviceOrientationEvent & { webkitCompassHeading?: number; webkitCompassAccuracy?: number };

/* ------------------------------------------------------------------ */
/*  Piringan kompas                                                   */
/* ------------------------------------------------------------------ */
function Dial({ putar, qibla, sejajar }: { putar: number; qibla: number; sejajar: boolean }) {
  const ticks = Array.from({ length: 72 }, (_, i) => i * 5);
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[22rem] select-none">
      {/* Piringan berputar mengikuti arah HP */}
      <div className="absolute inset-0" style={{ transform: `rotate(${-putar}deg)`, willChange: 'transform' }}>
        <svg viewBox="-160 -160 320 320" className="h-full w-full" aria-hidden="true">
          <circle r="150" className="fill-muted stroke-border" strokeWidth="2" />
          <circle r="112" className="fill-background stroke-border" strokeWidth="1" />
          {ticks.map((a) => {
            const besar = a % 90 === 0;
            const sedang = a % 30 === 0;
            const len = besar ? 14 : sedang ? 10 : 5;
            return (
              <line
                key={a}
                x1="0"
                y1="-148"
                x2="0"
                y2={-148 + len}
                transform={`rotate(${a})`}
                className={sedang ? 'stroke-foreground/60' : 'stroke-foreground/25'}
                strokeWidth={besar ? 2.5 : 1.5}
              />
            );
          })}
          {[
            { t: 'U', a: 0, c: 'fill-red-600' },
            { t: 'T', a: 90, c: 'fill-foreground/70' },
            { t: 'S', a: 180, c: 'fill-foreground/70' },
            { t: 'B', a: 270, c: 'fill-foreground/70' },
          ].map(({ t, a, c }) => (
            <text
              key={t}
              transform={`rotate(${a}) translate(0 -124)`}
              textAnchor="middle"
              dominantBaseline="central"
              className={cn('text-[15px] font-extrabold', c)}
            >
              {t}
            </text>
          ))}

          {/* Penanda kiblat */}
          <g transform={`rotate(${qibla})`}>
            <line x1="0" y1="-8" x2="0" y2="-96" className="stroke-primary-600" strokeWidth="4" strokeLinecap="round" />
            <polygon points="0,-104 -9,-88 9,-88" className="fill-primary-600" />
            <g transform="translate(0 -134)">
              <rect x="-11" y="-11" width="22" height="22" rx="3" fill="#1b1b1b" />
              <rect x="-11" y="-5" width="22" height="4" fill="#d4a017" />
            </g>
          </g>
        </svg>
      </div>

      {/* Lapisan tetap: penunjuk arah atas HP */}
      <svg viewBox="-160 -160 320 320" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        {sejajar && <circle r="156" fill="none" className="stroke-primary-500" strokeWidth="5" opacity="0.7" />}
        <polygon points="0,-156 -10,-140 10,-140" className={sejajar ? 'fill-primary-600' : 'fill-accent-500'} />
        <line x1="0" y1="-140" x2="0" y2="-20" className="stroke-accent-500/60" strokeWidth="2" strokeDasharray="4 5" />
        <circle r="7" className="fill-background stroke-foreground/50" strokeWidth="2" />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Komponen utama                                                    */
/* ------------------------------------------------------------------ */
export function KiblatCompass({ lat, lng }: { lat: number; lng: number }) {
  const [sensor, setSensor] = useState<Sensor>('idle');
  const [putar, setPutar] = useState<number | null>(null); // arah HP, nilai kumulatif (tanpa lompatan 360°)
  const [akurasiIos, setAkurasiIos] = useState<number | null>(null);
  const [sumber, setSumber] = useState<Sumber>('masjid');
  const [gps, setGps] = useState<{ lat: number; lng: number; akurasi: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('diam');
  const [sejajar, setSejajar] = useState(false);

  const smRef = useRef<number | null>(null);
  const kumRef = useRef(0);
  const rafRef = useRef(0);
  const lepasRef = useRef<(() => void) | null>(null);
  const sejajarRef = useRef(false);

  const titik = sumber === 'gps' && gps ? gps : { lat, lng };
  const qibla = useMemo(() => bearingKeKabah(titik.lat, titik.lng), [titik.lat, titik.lng]);
  const jarak = useMemo(() => jarakKeKabah(titik.lat, titik.lng), [titik.lat, titik.lng]);

  const arahHP = putar === null ? null : norm(putar);
  const delta = arahHP === null ? null : selisih(qibla, arahHP); // + = putar ke kanan

  /* ---- haluskan pembacaan sensor (rata-rata sirkular) ---- */
  const proses = useCallback((h: number) => {
    if (smRef.current === null) {
      smRef.current = h;
      kumRef.current = h;
    } else {
      const d = selisih(h, smRef.current);
      const k = Math.abs(d) > 40 ? 0.5 : 0.18;
      smRef.current = norm(smRef.current + d * k);
      kumRef.current += d * k;
    }
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        setPutar(kumRef.current);
      });
    }
  }, []);

  /* ---- pasang pendengar sensor ---- */
  const pasang = useCallback(() => {
    lepasRef.current?.();
    let dapat = false;
    let absolut = false;
    let timer = 0;

    const terima = (h: number) => {
      if (!dapat) {
        dapat = true;
        window.clearTimeout(timer);
        setSensor('aktif');
      }
      proses(h);
    };

    // Android/Chrome: sudut yang mengacu ke utara magnetik
    const onAbs = (e: Event) => {
      const ev = e as OrientEvt;
      if (ev.alpha === null || ev.beta === null || ev.gamma === null) return;
      absolut = true;
      const h = arahDariEuler(ev.alpha, ev.beta, ev.gamma);
      if (h !== null) terima(h);
    };

    // iOS: webkitCompassHeading (sudah kompensasi kemiringan). Lainnya: hanya jika absolut.
    const onRel = (e: Event) => {
      const ev = e as OrientEvt;
      if (typeof ev.webkitCompassHeading === 'number') {
        const acc = ev.webkitCompassAccuracy;
        if (typeof acc === 'number') {
          if (acc < 0) return; // belum valid
          setAkurasiIos(acc);
        }
        terima(ev.webkitCompassHeading);
        return;
      }
      if (absolut || !ev.absolute) return;
      if (ev.alpha === null || ev.beta === null || ev.gamma === null) return;
      const h = arahDariEuler(ev.alpha, ev.beta, ev.gamma);
      if (h !== null) terima(h);
    };

    timer = window.setTimeout(() => {
      if (!dapat) setSensor('tidak-didukung');
    }, 3000);

    window.addEventListener('deviceorientationabsolute', onAbs, true);
    window.addEventListener('deviceorientation', onRel, true);
    lepasRef.current = () => {
      window.clearTimeout(timer);
      window.removeEventListener('deviceorientationabsolute', onAbs, true);
      window.removeEventListener('deviceorientation', onRel, true);
    };
  }, [proses]);

  /* ---- lokasi GPS ---- */
  const ambilGps = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsStatus('gagal');
      return;
    }
    setGpsStatus('mencari');
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setGps({ lat: p.coords.latitude, lng: p.coords.longitude, akurasi: p.coords.accuracy });
        setGpsStatus('ok');
        setSumber('gps');
      },
      () => {
        setGpsStatus('gagal');
        setSumber('masjid');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  /* ---- tombol "Aktifkan Kompas" (wajib dari tap pengguna di iOS) ---- */
  const mulai = useCallback(async () => {
    ambilGps();
    const DOE = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } })
      .DeviceOrientationEvent;
    if (!DOE) {
      setSensor('tidak-didukung');
      return;
    }
    setSensor('meminta');
    if (typeof DOE.requestPermission === 'function') {
      try {
        if ((await DOE.requestPermission()) !== 'granted') {
          setSensor('ditolak');
          return;
        }
      } catch {
        setSensor('ditolak');
        return;
      }
    }
    pasang();
  }, [ambilGps, pasang]);

  /* ---- Android/desktop: langsung aktif; iOS: tunggu tombol ---- */
  useEffect(() => {
    const DOE = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } })
      .DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission !== 'function') {
      setSensor('meminta');
      pasang();
    }
    return () => {
      lepasRef.current?.();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [pasang]);

  /* ---- layar tetap menyala selama kompas dipakai ---- */
  useEffect(() => {
    if (sensor !== 'aktif') return;
    type Lock = { release: () => Promise<void> };
    let lock: Lock | null = null;
    const minta = async () => {
      try {
        const wl = (navigator as unknown as { wakeLock?: { request: (t: 'screen') => Promise<Lock> } }).wakeLock;
        lock = (await wl?.request('screen')) ?? null;
      } catch {
        /* tidak didukung — abaikan */
      }
    };
    minta();
    const vis = () => document.visibilityState === 'visible' && minta();
    document.addEventListener('visibilitychange', vis);
    return () => {
      document.removeEventListener('visibilitychange', vis);
      lock?.release().catch(() => {});
    };
  }, [sensor]);

  /* ---- deteksi menghadap kiblat (dengan histeresis) + getar ---- */
  useEffect(() => {
    if (delta === null) return;
    const a = Math.abs(delta);
    if (!sejajarRef.current && a <= 3) {
      sejajarRef.current = true;
      setSejajar(true);
      if ('vibrate' in navigator) navigator.vibrate(40);
    } else if (sejajarRef.current && a > 6) {
      sejajarRef.current = false;
      setSejajar(false);
    }
  }, [delta]);

  const aktif = sensor === 'aktif' && delta !== null;
  const perluKalibrasi = akurasiIos !== null && akurasiIos > 25;

  return (
    <div className="mx-auto w-full max-w-md px-4 pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-6 sm:pt-10">
      <PageHeader title="Arah Kiblat" description="Pegang HP dalam posisi mendatar, lalu putar badan sampai penanda hijau lurus ke atas." />

      {/* Sumber lokasi */}
      <div role="group" aria-label="Sumber lokasi" className="mb-4 grid grid-cols-2 gap-1 rounded-full border border-border bg-muted/60 p-1 text-sm font-semibold">
        <button
          type="button"
          aria-pressed={sumber === 'masjid'}
          onClick={() => setSumber('masjid')}
          className={cn(
            'flex min-h-11 items-center justify-center gap-1.5 rounded-full px-3 transition-colors',
            sumber === 'masjid' ? 'bg-primary-600 text-white' : 'text-foreground/60'
          )}
        >
          <MapPin size={15} /> Lokasi Masjid
        </button>
        <button
          type="button"
          aria-pressed={sumber === 'gps'}
          onClick={() => (gps ? setSumber('gps') : ambilGps())}
          className={cn(
            'flex min-h-11 items-center justify-center gap-1.5 rounded-full px-3 transition-colors',
            sumber === 'gps' ? 'bg-primary-600 text-white' : 'text-foreground/60'
          )}
        >
          <LocateFixed size={15} /> {gpsStatus === 'mencari' ? 'Mencari…' : 'Lokasi Saya'}
        </button>
      </div>
      {gpsStatus === 'gagal' && (
        <p role="status" className="-mt-2 mb-4 text-center text-xs text-foreground/55">
          Lokasi HP tidak bisa diambil (izin ditolak / GPS mati) — memakai lokasi masjid.
        </p>
      )}
      {sumber === 'gps' && gps && (
        <p className="-mt-2 mb-4 text-center text-xs text-foreground/55">Akurasi GPS ±{Math.round(gps.akurasi)} m</p>
      )}

      {/* Petunjuk utama */}
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'mb-5 rounded-2xl px-4 py-4 text-center transition-colors',
          sejajar ? 'bg-primary-600 text-white' : 'border border-border bg-muted/60 text-foreground'
        )}
      >
        {aktif ? (
          sejajar ? (
            <>
              <p className="text-xl font-extrabold">✓ Anda menghadap kiblat</p>
              <p className="mt-0.5 text-sm opacity-85">Pertahankan posisi ini</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-extrabold">
                Putar ke {delta! > 0 ? 'kanan' : 'kiri'} <span className="tabular">{Math.round(Math.abs(delta!))}°</span>
              </p>
              <p className="mt-0.5 text-sm text-foreground/60">Arahkan penanda hijau ke atas</p>
            </>
          )
        ) : (
          <>
            <p className="text-lg font-extrabold">
              Kiblat: <span className="tabular">{Math.round(qibla)}°</span> {namaArah(qibla)}
            </p>
            <p className="mt-0.5 text-sm text-foreground/60">
              {sensor === 'meminta' ? 'Menunggu sensor kompas…' : 'Aktifkan kompas agar arah HP terbaca'}
            </p>
          </>
        )}
      </div>

      <Dial putar={putar ?? 0} qibla={qibla} sejajar={sejajar} />

      {/* Angka */}
      <div className="mt-6 grid grid-cols-3 gap-2">
        {[
          { l: 'Arah Kiblat', v: `${Math.round(qibla)}°`, s: namaArah(qibla) },
          { l: 'Arah HP', v: arahHP === null ? '—' : `${Math.round(arahHP)}°`, s: arahHP === null ? 'belum aktif' : namaArah(arahHP) },
          { l: "Jarak ke Ka'bah", v: Math.round(jarak).toLocaleString('id-ID'), s: 'km' },
        ].map((s) => (
          <Card key={s.l} className="p-3 text-center">
            <p className="text-[11px] text-foreground/50">{s.l}</p>
            <p className="tabular mt-0.5 text-lg font-extrabold text-primary-700">{s.v}</p>
            <p className="text-[11px] text-foreground/50">{s.s}</p>
          </Card>
        ))}
      </div>

      {/* Tombol & peringatan */}
      {(sensor === 'idle' || sensor === 'ditolak') && (
        <Button onClick={mulai} className="mt-5 min-h-12 w-full text-base">
          <Compass size={18} /> Aktifkan Kompas
        </Button>
      )}

      {sensor === 'ditolak' && (
        <p role="alert" className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          Izin sensor gerak ditolak. Muat ulang halaman, tekan &quot;Aktifkan Kompas&quot;, lalu pilih Izinkan.
        </p>
      )}

      {sensor === 'tidak-didukung' && (
        <p role="alert" className="mt-5 flex items-start gap-2 rounded-xl bg-accent-100 p-3 text-sm text-foreground">
          <Smartphone size={16} className="mt-0.5 shrink-0 text-accent-500" />
          <span>
            Sensor kompas tidak terbaca. Buka lewat HP (Chrome/Safari) dengan alamat <b>https</b>. Arah kiblat dari
            utara tetap ditampilkan di atas.
          </span>
        </p>
      )}

      {perluKalibrasi && (
        <p role="alert" className="mt-5 flex items-start gap-2 rounded-xl bg-accent-100 p-3 text-sm text-foreground">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-accent-500" />
          Kompas perlu dikalibrasi: gerakkan HP membentuk angka 8 beberapa kali.
        </p>
      )}

      <details className="mt-6 rounded-2xl border border-border bg-background p-4 text-sm text-foreground/70">
        <summary className="cursor-pointer font-semibold text-foreground">Tips agar akurat</summary>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          <li>Gerakkan HP membentuk angka 8 untuk kalibrasi sebelum dipakai.</li>
          <li>Jauhi magnet, casing magnetik, speaker, laptop, dan benda besi/beton bertulang.</li>
          <li>Pegang mendatar dan diam sebentar; jarum akan stabil dalam 2–3 detik.</li>
          <li>Gunakan mode layar potret (kunci rotasi layar).</li>
          <li>Di dalam gedung, bandingkan dengan arah saf yang sudah ada.</li>
        </ul>
      </details>
    </div>
  );
}