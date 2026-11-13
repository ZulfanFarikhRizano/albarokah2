import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DbNotice } from "@/components/db-notice";
import { HapusButton } from "@/components/admin/hapus-button";
import { ActionButton } from "@/components/admin/action-button";
import { ActionForm } from "@/components/admin/action-form";
import { SubmitButton } from "@/components/submit-button";
import { getKurban, getPengaturan } from "@/lib/data";
import { addKurbanAction, deleteKurbanAction, setKurbanStatusAction } from "@/lib/actions";

const langkah = ["Terdaftar", "Sudah Disembelih", "Sudah Didistribusikan"] as const;

export default async function AdminKurbanPage() {
  const [{ data, error }, { data: p }] = await Promise.all([getKurban(), getPengaturan()]);

  return (
    <div>
      <h1 className="mb-1 text-xl font-extrabold text-primary-900">Kelola Kurban</h1>
      <p className="mb-6 text-sm text-foreground/55">
        Fitur musiman — saat ini <strong>{p.kurbanAktif ? "TAMPIL" : "DISEMBUNYIKAN"}</strong> di website. Ubah di menu Pengaturan.
      </p>
      <DbNotice error={error} />

      <Card className="mb-6 p-5">
        <p className="mb-3 text-sm font-semibold text-foreground/80">Tambah Pendaftar</p>
        <ActionForm action={addKurbanAction} resetOnSuccess className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input name="namaPengurban" placeholder="Nama pengurban" required aria-label="Nama pengurban" />
          <Select name="jenisHewan" aria-label="Jenis hewan">
            <option value="Kambing">Kambing</option>
            <option value="Domba">Domba</option>
            <option value="Sapi">Sapi</option>
          </Select>
          <Input type="number" name="jumlahHewan" placeholder="Jumlah ekor" defaultValue={1} min={1} aria-label="Jumlah ekor" />
          <Input name="atasNama" placeholder="Atas nama" required aria-label="Atas nama" />
          <SubmitButton label="Simpan Pendaftar" className="lg:col-span-4" />
        </ActionForm>
      </Card>

      {data.length === 0 && <p className="text-sm text-foreground/50">Belum ada pendaftar kurban.</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {data.map((k) => (
          <Card key={k.id} data-row className="p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="font-semibold">{k.jenisHewan} · {k.jumlahHewan} ekor</p>
              <Badge tone={k.statusDistribusi === "Sudah Didistribusikan" ? "green" : "yellow"}>{k.statusDistribusi}</Badge>
            </div>
            <p className="text-sm text-foreground/60">Pengurban: {k.namaPengurban}</p>
            <p className="text-sm text-foreground/60">Atas nama: {k.atasNama}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {langkah.filter((s) => s !== k.statusDistribusi).map((s) => (
                <ActionButton
                  key={s}
                  action={setKurbanStatusAction.bind(null, k.id, s)}
                  className="rounded-full border border-border px-2.5 py-1 text-xs font-semibold hover:bg-muted"
                >
                  {s}
                </ActionButton>
              ))}
              <span className="ml-auto"><HapusButton action={deleteKurbanAction.bind(null, k.id)} label={`Hapus pendaftar ${k.namaPengurban}`} /></span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}