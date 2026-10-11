import { CalendarDays, Clock, Megaphone, MapPin, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DbNotice } from "@/components/db-notice";
import { EmptyState } from "@/components/empty-state";
import { formatTanggal, getPengajian, getWarta } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Info Kegiatan — DKM Masjid Jami' Al Barokah" };

export default async function KegiatanPage() {
  const [{ data: pengajian, error: e1 }, { data: warta, error: e2 }] = await Promise.all([getPengajian(), getWarta()]);

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <PageHeader title="Info Kegiatan" description="Jadwal pengajian mendatang serta warta dan pengumuman untuk seluruh jamaah." />
      <DbNotice error={e1 ?? e2} />

      <nav aria-label="Bagian halaman" className="mb-8 inline-flex rounded-full border border-border bg-muted/60 p-1 text-sm font-semibold">
        <a href="#pengajian" className="rounded-full px-4 py-1.5 text-foreground/70 hover:bg-background hover:text-primary-700">Pengajian</a>
        <a href="#warta" className="rounded-full px-4 py-1.5 text-foreground/70 hover:bg-background hover:text-primary-700">Warta</a>
      </nav>

      <section id="pengajian" aria-labelledby="h-pengajian" className="scroll-mt-6">
        <h2 id="h-pengajian" className="mb-3 flex items-center gap-2 font-bold text-primary-900">
          <BookOpen size={18} className="text-primary-700" /> Pengajian Mendatang
        </h2>
        {pengajian.length === 0 ? (
          <EmptyState icon={CalendarDays} title="Belum ada jadwal pengajian mendatang" hint="Jadwal akan tampil di sini setelah ditambahkan pengurus." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {pengajian.map((p) => (
              <Card key={p.id} className="p-4">
                <p className="font-semibold text-foreground">{p.judul}</p>
                <p className="mt-0.5 text-sm text-foreground/50">{p.ustadz}</p>
                <div className="mt-3 flex flex-col gap-1.5 text-sm text-foreground/70">
                  <span className="flex items-center gap-2"><CalendarDays size={14} /> {formatTanggal(p.tanggal)}</span>
                  <span className="flex items-center gap-2"><Clock size={14} /> {p.jam} WIB</span>
                  <span className="flex items-center gap-2"><MapPin size={14} /> {p.tempat}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section id="warta" aria-labelledby="h-warta" className="mt-12 scroll-mt-6">
        <h2 id="h-warta" className="mb-3 flex items-center gap-2 font-bold text-primary-900">
          <Megaphone size={18} className="text-primary-700" /> Warta Masjid
        </h2>
        {warta.length === 0 ? (
          <EmptyState icon={Megaphone} title="Belum ada warta" hint="Pengumuman dan kabar duka cita akan tampil di sini." />
        ) : (
          <div className="grid gap-3">
            {warta.map((w) => (
              <Card key={w.id} className="p-4">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <Badge tone={w.jenis === "Duka Cita" ? "neutral" : "yellow"}>{w.jenis}</Badge>
                  <span className="text-xs text-foreground/40">{formatTanggal(w.tanggal)}</span>
                </div>
                <p className="font-semibold text-foreground">{w.judul}</p>
                <p className="mt-1 whitespace-pre-line text-sm text-foreground/60">{w.isi}</p>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
