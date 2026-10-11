import { Card } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DbNotice } from "@/components/db-notice";
import { HapusButton } from "@/components/admin/hapus-button";
import { formatTanggal, getJadwalImam } from "@/lib/data";
import { addJadwalImamAction, deleteJadwalImamAction } from "@/lib/actions";

export default async function AdminImamPage() {
  const { data, error } = await getJadwalImam({ semua: true });

  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold text-primary-900">Kelola Jadwal Imam &amp; Khatib</h1>
      <DbNotice error={error} />

      <Card className="mb-6 p-5">
        <p className="mb-3 text-sm font-semibold text-foreground/80">Tambah Jadwal</p>
        <form action={addJadwalImamAction} className="grid gap-3 sm:grid-cols-2">
          <Select name="jenis" aria-label="Jenis">
            <option value="Jumat">Jumat</option>
            <option value="Tarawih">Tarawih</option>
          </Select>
          <Input type="date" name="tanggal" required aria-label="Tanggal" />
          <Input name="imam" placeholder="Nama imam" required aria-label="Nama imam" />
          <Input name="khatib" placeholder="Nama khatib (opsional)" aria-label="Nama khatib" />
          <Textarea name="materi" placeholder="Materi / tema khutbah (opsional)" className="sm:col-span-2" rows={2} />
          <Button type="submit" className="justify-self-start sm:col-span-2">Simpan Jadwal</Button>
        </form>
      </Card>

      {data.length === 0 && <p className="text-sm text-foreground/50">Belum ada jadwal.</p>}
      <div className="grid gap-3">
        {data.map((i) => (
          <Card key={i.id} className="flex items-start justify-between gap-3 p-4">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <Badge tone="green">{i.jenis}</Badge>
                <span className="text-sm text-foreground/50">{formatTanggal(i.tanggal)}</span>
              </div>
              <p className="font-semibold">Imam: {i.imam}</p>
              {i.khatib && <p className="text-sm text-foreground/60">Khatib: {i.khatib}</p>}
              {i.materi && <p className="text-sm text-foreground/60">Materi: {i.materi}</p>}
            </div>
            <HapusButton action={deleteJadwalImamAction.bind(null, i.id)} label={`Hapus jadwal imam ${i.imam}`} />
          </Card>
        ))}
      </div>
    </div>
  );
}
