'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Copy, Check, AlertCircle, Sparkles, Building2, Wallet } from 'lucide-react';

type InfaqPanelProps = {
  bank: string;
  rekening: string;
  atasNama: string;
  qrisUrl?: string;
};

export function InfaqPanel({ bank, rekening, atasNama }: InfaqPanelProps) {
  // State untuk melacak teks mana yang berhasil disalin (untuk feedback visual)
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500); // Reset status setelah 2.5 detik
  };

  // Data Virtual Account & Transfer Manual yang direkomendasikan
  const daftarAkun = [
    {
      kategori: "Transfer Bank Utama",
      nama: bank || "SeaBank",
      nomor: rekening || "901756419264",
      pemilik: atasNama || "DKM Al Barokah",
      tipe: "bank",
    },
    {
      kategori: "E-Wallet / Dompet Digital",
      nama: "DANA",
      nomor: "0852-2139-3635",
      pemilik: "Masjid Jami' Al Barokah",
      tipe: "wallet",
    },
    {
      kategori: "Virtual Account (Konfirmasi Otomatis)",
      nama: "BCA Virtual Account",
      nomor: "3901-085221393635",
      pemilik: "DKM Al Barokah",
      tipe: "va",
    },
    {
      kategori: "Virtual Account",
      nama: "Mandiri Virtual Account",
      nomor: "89508-085221393635",
      pemilik: "DKM Al Barokah",
      tipe: "va",
    },
    {
      kategori: "Virtual Account",
      nama: "BNI Virtual Account",
      nomor: "8810-085221393635",
      pemilik: "DKM Al Barokah",
      tipe: "va",
    },
  ];

  return (
    <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm">
      
      {/* Banner / Pemberitahuan Hibrid (Proses Pemeliharaan QRIS Otomatis) */}
      <div className="bg-amber-50/80 px-5 py-4 border-b border-amber-100 flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <AlertCircle size={18} />
        </div>
        <div>
          <p className="text-sm font-bold text-amber-900">Informasi Saluran Infaq</p>
          <p className="mt-0.5 text-xs leading-relaxed text-amber-700">
            Fitur QRIS otomatis (Midtrans) sedang dalam pemeliharaan/proses aktivasi. Silakan gunakan metode transfer manual atau Virtual Account di bawah ini.
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Rekening Resmi DKM</h3>
            <p className="text-xs text-slate-500">Klik tombol salin untuk menyalin nomor rekening dengan mudah.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <Sparkles size={13} /> Aman & Terverifikasi
          </span>
        </div>

        {/* Daftar Rekening & VA */}
        <div className="grid gap-3.5">
          {daftarAkun.map((item, idx) => {
            const isCopied = copiedKey === item.nomor;

            return (
              <div 
                key={idx} 
                className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 transition-all hover:border-primary-300 hover:bg-white hover:shadow-sm"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.tipe === 'wallet' ? 'bg-sky-100 text-sky-600' : 'bg-primary-50 text-primary-700'}`}>
                    {item.tipe === 'wallet' ? <Wallet size={22} /> : <Building2 size={22} />}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{item.kategori}</span>
                    <p className="text-base font-extrabold text-slate-900">{item.nama}</p>
                    <p className="font-mono text-base font-bold text-primary-700 tracking-wide mt-0.5">{item.nomor}</p>
                    <p className="text-xs text-slate-500 mt-0.5">a.n. {item.pemilik}</p>
                  </div>
                </div>

                {/* Tombol Salin */}
                <button
                  type="button"
                  onClick={() => handleCopy(item.nomor.replace(/-/g, ''), item.nomor)}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all active:scale-95 ${
                    isCopied 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check size={15} /> Berhasil Disalin!
                    </>
                  ) : (
                    <>
                      <Copy size={15} className="text-slate-400 group-hover:text-primary-600" /> Salin Nomor
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Catatan Kaki Transisi Nanti */}
        <div className="mt-6 rounded-xl bg-slate-50 p-3 text-center text-xs text-slate-400 border border-slate-100">
          💡 <em>Catatan Pengurus: Apabila QRIS Midtrans sudah aktif kembali, sistem akan otomatis beralih menampilkan QRIS di halaman ini.</em>
        </div>

      </div>
    </Card>
  );
}