import { History } from "lucide-react";
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

      <section className="mt-12" aria-labelledby="h-sejarah">
        <div className="mb-4 flex items-center gap-2">
          <History className="h-5 w-5 text-primary-700" />
          <div>
            <h2 id="h-sejarah" className="font-bold text-primary-900">Sejarah Kepemimpinan DKM</h2>
            <p className="text-xs text-foreground/50">Masjid Al Barokah Komp. Inkopad Blok D</p>
          </div>
        </div>
        <Card className="p-5">
          <ol className="relative ml-2 border-l-2 border-primary-100">
            {sejarahKetuaDKM.map((item, i) => {
              const sekarang = i === sejarahKetuaDKM.length - 1;
              return (
                <li key={`${item.periode}-${item.nama}`} className="relative pb-5 pl-6 last:pb-0">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute -left-[7px] top-1.5 h-3 w-3 rounded-full border-2 border-background",
                      sekarang ? "bg-primary-600 ring-4 ring-primary-100" : "bg-primary-400"
                    )}
                  />
                  <p className="tabular text-xs font-semibold text-primary-700">{item.periode}</p>
                  <p className={cn("text-sm", sekarang ? "font-bold text-foreground" : "font-medium text-foreground/80")}>
                    {item.nama}
                    {sekarang && <span className="ml-2 rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-700">Menjabat</span>}
                  </p>
                </li>
              );
            })}
          </ol>
        </Card>
      </section>
    </div>
  );
}
