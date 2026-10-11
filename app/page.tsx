import Link from "next/link";
import { ChevronRight, Clock, Compass, Landmark, MessageSquareHeart, Megaphone, Users, Wallet, type LucideIcon } from "lucide-react";
import { PrayerCard } from "@/components/prayer-card";
import { MENU_UTAMA } from "@/lib/site";

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

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-16">
      
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        
        <div className="flex flex-col justify-center">
          <div className="mb-3 flex justify-start">
            <span className="text-3xl font-medium text-primary-700" dir="rtl">
              بَيْتُ اللَّهِ
            </span>
          </div>
          
          {/* Ukuran font diperkecil untuk HP (text-3xl), membesar di PC (sm:text-5xl) */}
          <h1 className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl md:text-5xl">
            Satu tempat untuk <br className="hidden sm:block" /> seluruh layanan jamaah
          </h1>
          
          <p className="mt-4 max-w-lg text-base text-slate-600 sm:text-lg">
            Kas, arah kiblat, jadwal ibadah, hingga info kegiatan — semuanya transparan dan mudah diakses jamaah dari segala usia.
          </p>
          
          {/* Tombol dibuat memanjang (w-full) di HP, bersampingan di PC */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link 
              href="/infaq" 
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-primary-700 sm:w-auto"
            >
              <Landmark size={20} />
              Infaq Sekarang
            </Link>
            
            <Link 
              href="/kiblat" 
              className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
            >
              <Compass size={20} />
              Arah Kiblat
            </Link>
          </div>

          {/* Grid Kas dibuat 1 kolom menumpuk di HP, 3 kolom sejajar di PC */}
          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-center sm:text-left">
              <p className="text-xs font-medium text-slate-500">Saldo Kas</p>
              <p className="mt-1 text-lg font-bold text-primary-700">Rp 6.790.000</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-center sm:text-left">
              <p className="text-xs font-medium text-slate-500">Pemasukan</p>
              <p className="mt-1 text-lg font-semibold text-slate-800">Rp 8.240.000</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-center sm:text-left">
              <p className="text-xs font-medium text-slate-500">Pengeluaran</p>
              <p className="mt-1 text-lg font-semibold text-slate-800">Rp 1.450.000</p>
            </div>
          </div>
        </div>

        <div className="w-full">
          <PrayerCard 
            lokasi="Tajur Halang, Bogor" 
            lat={-6.4975} 
            lng={106.7573} 
          />
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-slate-200 sm:mt-16 sm:pt-10">
        <h2 className="mb-5 text-xl font-extrabold text-slate-900 sm:mb-6">Jelajahi Fitur Masjid</h2>
        <nav aria-label="Menu utama" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
          {MENU_UTAMA.map((m) => {
            const Icon = IKON[m.key];
            return (
              <Link
                key={m.href}
                href={m.href}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-400 hover:shadow-md"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700 transition-colors group-hover:bg-primary-600 group-hover:text-white">
                  <Icon size={22} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-slate-900">{m.label}</span>
                  <span className="mt-0.5 block text-sm text-slate-500 truncate">{m.deskripsi}</span>
                </span>
                <ChevronRight size={18} className="shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary-600" />
              </Link>
            );
          })}
        </nav>
      </div>

    </div>
  );
}