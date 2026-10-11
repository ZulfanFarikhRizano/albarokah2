import { Mic2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PrayerCard } from "@/components/prayer-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DbNotice } from "@/components/db-notice";
import { EmptyState } from "@/components/empty-state";
import { formatTanggal, getJadwalImam, getPengaturan } from "@/lib/data";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = { title: "Jadwal Sholat — DKM Masjid Jami' Al Barokah" };

export default async function JadwalSholatPage() {
  const [{ data: p, error: e1 }, { data: imam, error: e2 }] = await Promise.all([getPengaturan(), getJadwalImam()]);

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <PageHeader
        title="Jadwal Sholat"
        description={`Waktu sholat real-time untuk wilayah ${SITE.nama}, beserta jadwal imam & khatib.`}
      />
      <DbNotice error={e1 ?? e2} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,26rem)_1fr] lg:items-start">
        <PrayerCard lokasi={p.lokasi} lat={p.lat} lng={p.lng} />

        <section aria-labelledby="h-imam">
          <h2 id="h-imam" className="mb-3 flex items-center gap-2 font-bold text-primary-900">
            <Mic2 size={18} className="text-primary-700" /> Imam &amp; Khatib
          </h2>
          {imam.length === 0 ? (
            <EmptyState icon={Mic2} title="Belum ada jadwal imam & khatib" hint="Jadwal sholat Jumat dan Tarawih mendatang akan tampil di sini." />
          ) : (
            <Card className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <caption className="sr-only">Jadwal imam dan khatib mendatang</caption>
                  <thead>
                    <tr className="border-b border-border bg-muted/60 text-left text-foreground/50">
                      <th scope="col" className="px-4 py-3 font-medium">Tanggal</th>
                      <th scope="col" className="px-4 py-3 font-medium">Sholat</th>
                      <th scope="col" className="px-4 py-3 font-medium">Imam</th>
                      <th scope="col" className="px-4 py-3 font-medium">Khatib / Materi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {imam.map((i) => (
                      <tr key={i.id} className="border-b border-border align-top last:border-0">
                        <td className="tabular whitespace-nowrap px-4 py-3">{formatTanggal(i.tanggal)}</td>
                        <td className="px-4 py-3"><Badge tone="green">{i.jenis}</Badge></td>
                        <td className="px-4 py-3 font-medium">{i.imam}</td>
                        <td className="px-4 py-3 text-foreground/70">
                          {i.khatib ?? <span className="text-foreground/30">—</span>}
                          {i.materi && <span className="mt-0.5 block text-xs text-foreground/50">{i.materi}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
