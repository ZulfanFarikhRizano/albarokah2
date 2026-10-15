import Image from "next/image";
import { History, UserCircle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { DbNotice } from "@/components/db-notice";
import { StrukturOrganisasi } from "@/components/struktur-organisasi";
import { getPengurus } from "@/lib/data";
import { sejarahKetuaDKM } from "@/lib/sejarah";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: `Sejarah & Profil Pengurus — ${SITE.namaDKM}` };

export default async function PengurusPage() {
  const { data, error } = await getPengurus();

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <PageHeader
        title="Sejarah & Profil Pengurus"
        description={`Struktur organisasi ${SITE.namaDKM}, masa khidmat ${SITE.masaKhidmat}.`}
      />
      <DbNotice error={error} />

      <StrukturOrganisasi data={data} />

      <section className="mt-16" aria-labelledby="h-sejarah">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
            <History size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h2 id="h-sejarah" className="text-xl font-extrabold text-slate-900">Sejarah Kepemimpinan DKM</h2>
            <p className="text-sm text-slate-500">Rekam jejak ketua DKM dari masa ke masa</p>
          </div>
        </div>

        <div className="relative pl-4 sm:pl-8">
          {/* Garis vertikal timeline */}
          <div className="absolute bottom-0 left-[23px] top-4 w-px bg-slate-200 sm:left-[39px]" />

          <ul className="flex flex-col gap-6 sm:gap-8">
            {sejarahKetuaDKM.map((item, i) => {
              const sekarang = i === sejarahKetuaDKM.length - 1;

              return (
                // Items-center agar titik timeline berada pas di tengah-tengah kartu
                <li key={`${item.periode}-${item.nama}`} className="relative flex items-center gap-5 sm:gap-8">
                  
                  {/* Titik indikator timeline */}
                  <div className="relative z-10 flex shrink-0 items-center justify-center">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex h-4 w-4 shrink-0 rounded-full border-4 border-white shadow-sm transition-colors",
                        sekarang ? "bg-primary-600 ring-4 ring-primary-100" : "bg-slate-300 ring-1 ring-slate-200"
                      )}
                    />
                  </div>

                  {/* Kartu Profil Diberi Padding P-4 */}
                  <Card className={cn(
                    "group flex w-full items-center overflow-hidden p-3 sm:p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-1",
                    sekarang ? "border-primary-200 bg-primary-50/40" : "bg-white"
                  )}>
                    
                    {/* Perbaikan Wadah Foto: Sudut membulat (rounded-xl), background sangat halus (bg-slate-50), dan diberi bingkai tipis */}
                    <div className="relative flex w-20 shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-100 sm:w-28 aspect-[3/4]">
                      {item.foto ? (
                        <Image
                          src={item.foto}
                          alt={`Foto ${item.nama}`}
                          fill
                          sizes="(max-width: 768px) 80px, 112px"
                          className="object-cover object-bottom transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <UserCircle className="m-auto h-10 w-10 text-slate-300" />
                      )}
                    </div>

                    {/* Informasi Teks diberi jarak (pl-4) dari foto */}
                    <div className="flex flex-col justify-center pl-4 sm:pl-6">
                      <p className="mb-1 text-xs font-bold tracking-widest text-primary-600 sm:text-sm">
                        PERIODE {item.periode}
                      </p>
                      <h3 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                        {item.nama}
                      </h3>
                      
                      {sekarang && (
                        <span className="mt-3 inline-flex w-fit items-center rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
                          <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-primary-600" />
                          Menjabat Saat Ini
                        </span>
                      )}
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}