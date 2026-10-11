import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DbNotice } from "@/components/db-notice";
import { HapusButton } from "@/components/admin/hapus-button";
import { formatTanggal, getPengajian } from "@/lib/data";
import { addPengajianAction, deletePengajianAction } from "@/lib/actions";

export default async function AdminPengajianPage() {
  const { data, error } = await getPengajian({ semua: true });

  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold text-primary-900">Kelola Jadwal Pengajian</h1>
      <DbNotice error={error} />

      <Card className="mb-6 p-5">
        <p className="mb-3 text-sm font-semibold text-foreground/80">Tambah Jadwal</p>
        <form action={addPengajianAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Input name="judul" placeholder="Judul kajian" required aria-label="Judul kajian" className="lg:col-span-2" />
          <Input name="ustadz" placeholder="Ustadz / pemateri" required aria-label="Ustadz" />
          <Input type="date" name="tanggal" required aria-label="Tanggal" />
          <Input type="time" name="jam" required aria-label="Jam" />
          <Input name="tempat" placeholder="Tempat" required aria-label="Tempat" className="lg:col-span-2" />
          <Button type="submit" className="justify-self-start sm:col-span-2 lg:col-span-5">Simpan Jadwal</Button>
        </form>
      </Card>

      {data.length === 0 && <p className="text-sm text-foreground/50">Belum ada jadwal pengajian.</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {data.map((p) => (
          <Card key={p.id} className="flex items-start justify-between gap-3 p-4">
            <div>
              <p className="font-semibold">{p.judul}</p>
              <p className="text-sm text-foreground/50">{p.ustadz}</p>
              <p className="mt-1 text-sm text-foreground/60">{formatTanggal(p.tanggal)} · {p.jam} WIB · {p.tempat}</p>
            </div>
            <HapusButton action={deletePengajianAction.bind(null, p.id)} label={`Hapus jadwal ${p.judul}`} />
          </Card>
        ))}
      </div>
    </div>
  );
}
