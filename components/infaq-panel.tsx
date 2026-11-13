'use client';

import { Card } from '@/components/ui/card';
import { AlertCircle, Sparkles, Download } from 'lucide-react';
import Image from 'next/image';

export function InfaqPanel() {
  return (
    <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm">
      
      {/* Banner / Pemberitahuan Informasi */}
      <div className="bg-emerald-50/80 px-5 py-4 border-b border-emerald-100 flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <AlertCircle size={18} />
        </div>
        <div>
          <p className="text-sm font-bold text-emerald-900">Informasi Saluran Infaq</p>
          <p className="mt-0.5 text-xs leading-relaxed text-emerald-700">
            Silakan pindai (scan) QRIS di bawah ini menggunakan aplikasi m-Banking atau e-Wallet Anda. Dana akan masuk sepenuhnya ke rekening kas DKM Masjid Jami&apos; Al Barokah.
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">QRIS Resmi Masjid</h3>
            <p className="text-xs text-slate-500">Scan atau unduh gambar QRIS untuk berinfaq.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <Sparkles size={13} /> Aman & Terverifikasi
          </span>
        </div>

        {/* Tampilan Gambar QRIS & Tombol Download */}
        <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 transition-all hover:border-slate-300">
          
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-center p-3 w-full max-w-xs relative aspect-square">
            <Image 
              src="/images/qris.jpeg" 
              alt="QRIS Masjid Jami' Al Barokah" 
              fill
              className="object-contain rounded-lg p-2"
              sizes="(max-width: 768px) 100vw, 320px"
              priority
            />
          </div>

          <a
            href="/images/qris.jpeg"
            download="QRIS_Masjid_Al_Barokah.jpeg"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95"
          >
            <Download size={18} />
            Download QRIS
          </a>
        </div>

        {/* Catatan Kaki yang Diperbarui */}
        <div className="mt-6 flex flex-col gap-2 rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-500 border border-slate-200">
          <p>
            💡 <strong>Catatan Transparansi:</strong> Dana yang masuk via QRIS akan direkap dan diperbarui secara kolektif di website setiap hari Jumat.
          </p>
          <p className="text-slate-400">
            <em>Pastikan nama merchant penerima pada aplikasi Anda adalah nama resmi Masjid &apos; Al Barokah.</em>
          </p>
        </div>

      </div>
    </Card>
  );
}