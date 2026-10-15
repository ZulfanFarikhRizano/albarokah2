import { PageHeader } from "@/components/page-header";
import { DbNotice } from "@/components/db-notice";
import { InfaqPanel } from "@/components/infaq-panel";
import { getPengaturan } from "@/lib/data";
import { Cog, HeartHandshake } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Infaq Digital — DKM Masjid Jami' Al Barokah" };

export default async function InfaqPage() {
  const { data: p, error } = await getPengaturan();
  
  const isMaintenance = p.infaqMaintenance === "true";

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <PageHeader 
        title="Infaq Digital" 
        description="Layanan donasi dan infaq online resmi DKM Masjid Jami' Al Barokah." 
      />
      <DbNotice error={error} />

      {isMaintenance ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          
          <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-amber-50">
            <Cog className="h-12 w-12 text-amber-500 animate-[spin_4s_linear_infinite]" strokeWidth={1.5} />
            <div className="absolute right-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-white">
              <span className="absolute inline-flex h-4 w-4 animate-ping rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500"></span>
            </div>
          </div>

          <h3 className="mb-3 text-2xl font-extrabold tracking-tight text-slate-900">
            Seluruh Layanan Transaksi Sedang Dipelihara
          </h3>
          <p className="max-w-md text-base leading-relaxed text-slate-500">
            Mohon maaf, seluruh layanan transaksi digital (QRIS dan Transfer Bank) saat ini dihentikan sementara karena sedang dalam pemeliharaan atau gangguan sistem dari pihak penyedia.
          </p>
          
          <div className="mt-8 flex w-full max-w-sm items-center gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <HeartHandshake size={20} />
            </div>
            <p className="text-left text-sm font-medium text-slate-600">
              Jazakumullah khairan. Niat baik Anda sudah dicatat. Anda tetap dapat berinfaq melalui kotak amal fisik di area masjid.
            </p>
          </div>

        </div>
      ) : (
        <div className="mt-8">
          <InfaqPanel bank={p.bank} rekening={p.rekening} atasNama={p.atasNama} qrisUrl={p.qrisUrl} />
        </div>
      )}
    </div>
  );
}