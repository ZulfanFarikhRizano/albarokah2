import { Card } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DbNotice } from "@/components/db-notice";
import { HapusButton } from "@/components/admin/hapus-button";
import { formatTanggal, getWarta, hariIniWIB } from "@/lib/data";
import { addWartaAction, deleteWartaAction } from "@/lib/actions";

export default async function AdminWartaPage() {
  const { data, error } = await getWarta(200);

  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold text-primary-900">Kelola Warta Masjid</h1>
      <DbNotice error={error} />

      <Card className="mb-6 p-5">
        <p className="mb-3 text-sm font-semibold text-foreground/80">Tambah Warta</p>
        <form action={addWartaAction} className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Select name="jenis" aria-label="Jenis warta">
              <option value="Pengumuman">Pengumuman</option>
              <option value="Duka Cita">Duka Cita</option>
            </Select>
            <Input type="date" name="tanggal" required defaultValue={hariIniWIB()} aria-label="Tanggal" />
          </div>
          <Input name="judul" placeholder="Judul" required aria-label="Judul" />
          <Textarea name="isi" placeholder="Isi warta" rows={3} required maxLength={2000} aria-label="Isi warta" />
          <Button type="submit" className="justify-self-start">Terbitkan</Button>
        </form>
      </Card>

      {data.length === 0 && <p className="text-sm text-foreground/50">Belum ada warta.</p>}
      <div className="grid gap-3">
        {data.map((w) => (
          <Card key={w.id} className="flex items-start justify-between gap-3 p-4">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Badge tone={w.jenis === "Duka Cita" ? "neutral" : "yellow"}>{w.jenis}</Badge>
                <span className="text-xs text-foreground/40">{formatTanggal(w.tanggal)}</span>
              </div>
              <p className="font-semibold">{w.judul}</p>
              <p className="mt-1 whitespace-pre-line text-sm text-foreground/60">{w.isi}</p>
            </div>
            <HapusButton action={deleteWartaAction.bind(null, w.id)} label={`Hapus warta ${w.judul}`} />
          </Card>
        ))}
      </div>
    </div>
  );
}
