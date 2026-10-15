import Link from "next/link";
import { ChevronRight, Clock, Compass, Landmark, MessageSquareHeart, Megaphone, Users, Wallet, Phone, Mail, type LucideIcon } from "lucide-react";
import { PrayerCard } from "@/components/prayer-card";
import { MENU_UTAMA } from "@/lib/site";
import { getKas, ringkasKas } from "@/lib/data";
import { formatRupiah } from "@/lib/utils";

export const dynamic = "force-dynamic";

const IKON: Record<(typeof MENU_UTAMA)[number]["key"], LucideIcon> = {
  kas: Wallet,
  kiblat: Compass,
  jadwal: Clock,
  infaq: Landmark,
  kegiatan: Megaphone,
  pengurus: Users,
  saran: MessageSquareHeart,
};

export default async function HomePage() {
  const { data: kas } = await getKas();
  const { masuk, keluar, saldo } = ringkasKas(kas);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-16 overflow-x-hidden sm:overflow-visible">
      
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        
        {/* KOLOM KIRI: HERO & SALDO KAS */}
        <div className="flex flex-col justify-center">
          <div className="mb-4 flex justify-start">
            <span className="text-2xl font-medium text-primary-700 dark:text-primary-400 sm:text-3xl" dir="rtl">
              بَيْتُ اللَّهِ
            </span>
          </div>
          
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-4xl md:text-5xl">
            Satu tempat untuk <br className="hidden sm:block" /> seluruh layanan jamaah
          </h1>
          
          <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
            Kas, arah kiblat, jadwal ibadah, hingga info kegiatan — semuanya transparan dan mudah diakses jamaah dari segala usia.
          </p>
          
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link 
              href="/infaq" 
              className="group flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3.5 font-semibold text-white shadow-md transition-all duration-200 hover:bg-primary-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
            >
              <Landmark size={20} className="transition-transform group-hover:scale-110" />
              Infaq Sekarang
            </Link>
            
            <Link 
              href="/kiblat" 
              className="group flex w-full items-center justify-center gap-2 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-3.5 font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2 sm:w-auto"
            >
              <Compass size={20} className="text-slate-500 dark:text-slate-400 transition-transform group-hover:rotate-12" />
              Arah Kiblat
            </Link>
          </div>

          {/* KARTU KAS DINAMIS DARI DATABASE */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="col-span-2 flex flex-col justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-primary-50/30 dark:from-slate-900 dark:to-primary-950/20 p-4 shadow-sm sm:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Saldo Kas</p>
              <p className="mt-1 text-2xl font-extrabold text-primary-700 dark:text-primary-400 sm:text-xl">{formatRupiah(saldo)}</p>
            </div>
            <div className="flex flex-col justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pemasukan</p>
              <p className="mt-1 text-lg font-bold text-slate-800 dark:text-slate-100">{formatRupiah(masuk)}</p>
            </div>
            <div className="flex flex-col justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pengeluaran</p>
              <p className="mt-1 text-lg font-bold text-slate-800 dark:text-slate-100">{formatRupiah(keluar)}</p>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: WAKTU SHOLAT & KONTAK RESMI */}
        <div className="w-full space-y-3">
          <PrayerCard 
            lokasi="Tajur Halang, Bogor" 
            lat={-6.4975} 
            lng={106.7573} 
          />

          {/* INFORMASI KONTAK RESMI DIBAWAH WAKTU SHOLAT */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold pt-1">
            <a 
              href="https://wa.me/6285221393635" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 transition-colors hover:bg-emerald-100"
            >
              <Phone size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>WhatsApp: 0852-2139-3635</span>
            </a>
            <a 
              href="mailto:albarokah.blokd@gmail.com" 
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Mail size={14} className="text-primary-600 dark:text-primary-400" />
              <span>albarokah.blokd@gmail.com</span>
            </a>
          </div>
        </div>
      </div>

      {/* JELAJAHI FITUR MASJID */}
      <div className="mt-14 pt-8 border-t border-slate-200 dark:border-slate-800 sm:mt-16 sm:pt-10">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Jelajahi Fitur Masjid</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 sm:mt-0">Akses cepat layanan yang Anda butuhkan</p>
        </div>
        
        <nav aria-label="Menu utama" className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
          {MENU_UTAMA.map((m) => {
            const Icon = IKON[m.key];
            return (
              <Link
                key={m.href}
                href={m.href}
                className="group relative flex flex-col items-start gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 transition-colors duration-200 group-hover:bg-primary-600 group-hover:text-white sm:h-12 sm:w-12">
                  <Icon size={24} strokeWidth={2} />
                </div>
                
                <div className="flex w-full flex-col mt-1">
                  <span className="text-sm font-bold leading-tight text-slate-900 dark:text-white transition-colors group-hover:text-primary-700 dark:group-hover:text-primary-400 sm:text-base">
                    {m.label}
                  </span>
                  <span className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400 sm:text-sm">
                    {m.deskripsi}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

    </div>
  );
}