import { Beef } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DbNotice } from "@/components/db-notice";
import { EmptyState } from "@/components/empty-state";
import { MusimanNonaktif } from "@/components/musiman-nonaktif";
import { getKurban, getPengaturan } from "@/lib/data";

export const dynamic = "force-dynamic";

const toneFor = (s: string): "green" | "yellow" | "neutral" =>
  s === "Sudah Didistribusikan" ? "green" : s === "Sudah Disembelih" ? "yellow" : "neutral";

export default async function KurbanPage() {
  const { data: p } = await getPengaturan();
  if (!p.kurbanAktif) return <MusimanNonaktif nama="Data Kurban" />;

  const { data, error } = await getKurban();
  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <PageHeader title="Data Kurban" description="Pendaftaran, jenis hewan, dan status distribusi kurban Idul Adha." />
      <DbNotice error={error} />
      {data.length === 0 ? (
        <EmptyState icon={Beef} title="Belum ada pendaftar kurban" hint="Data akan tampil setelah panitia mencatatnya." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.map((k) => (
            <Card key={k.id} className="p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="font-semibold">{k.jenisHewan} · {k.jumlahHewan} ekor</p>
                <Badge tone={toneFor(k.statusDistribusi)}>{k.statusDistribusi}</Badge>
              </div>
              <p className="text-sm text-foreground/60">Pengurban: {k.namaPengurban}</p>
              <p className="text-sm text-foreground/60">Atas nama: {k.atasNama}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
