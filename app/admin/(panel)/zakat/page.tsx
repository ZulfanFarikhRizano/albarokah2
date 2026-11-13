import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DbNotice } from "@/components/db-notice";
import { HapusButton } from "@/components/admin/hapus-button";
import { ActionButton } from "@/components/admin/action-button";
import { ActionForm } from "@/components/admin/action-form";
import { SubmitButton } from "@/components/submit-button";
import { formatRupiah } from "@/lib/utils";
import { formatTanggal, getPengaturan, getZakat, hariIniWIB } from "@/lib/data";
import { addZakatAction, deleteZakatAction, setZakatStatusAction } from "@/lib/actions";

export default async function AdminZakatPage() {
  const [{ data, error }, { data: p }] = await Promise.all([getZakat(), getPengaturan()]);

  return (
    <div>
      <h1 className="mb-1 text-xl font-extrabold text-primary-900">Kelola Zakat</h1>
      <p className="mb-6 text-sm text-foreground/55">
        Fitur musiman — saat ini <strong>{p.zakatAktif ? "TAMPIL" : "DISEMBUNYIKAN"}</strong> di website. Ubah di menu Pengaturan.
      </p>
      <DbNotice error={error} />

      <Card className="mb-6 p-5">
        <p className="mb-3 text-sm font-semibold text-foreground/80">Tambah Data Zakat</p>
        <ActionForm action={addZakatAction} resetOnSuccess className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Input name="nama" placeholder="Nama muzakki" required aria-label="Nama muzakki" />
          <Select name="jenis" aria-label="Jenis zakat">
            <option value="Zakat Fitrah">Zakat Fitrah</option>
            <option value="Zakat Maal">Zakat Maal</option>
            <option value="Infaq BAZNAS">Infaq BAZNAS</option>
          </Select>
          <Input type="number" name="jumlahJiwa" placeholder="Jumlah jiwa (opsional)" aria-label="Jumlah jiwa" min={0} />
          <Input type="number" name="nominal" placeholder="Nominal (Rp)" required aria-label="Nominal" min={0} />
          <Input type="date" name="tanggal" required defaultValue={hariIniWIB()} aria-label="Tanggal" />
          <SubmitButton label="Simpan Data" className="lg:col-span-3" />
        </ActionForm>
      </Card>

      {data.length === 0 && <p className="text-sm text-foreground/50">Belum ada data zakat.</p>}
      <div className="grid gap-3">
        {data.map((z) => (
          <Card key={z.id} data-row className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-semibold">{z.nama}</p>
              <p className="text-sm text-foreground/50">
                {z.jenis}{z.jumlahJiwa ? ` · ${z.jumlahJiwa} jiwa` : ""} · {formatTanggal(z.tanggal)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="tabular font-bold text-primary-700">{formatRupiah(z.nominal)}</p>
              <Badge tone={z.statusSetor === "Sudah Disetor ke BAZNAS" ? "green" : "yellow"}>{z.statusSetor}</Badge>
              {z.statusSetor === "Belum Disetor" && (
                <ActionButton
                  action={setZakatStatusAction.bind(null, z.id, "Sudah Disetor ke BAZNAS")}
                  className="text-xs font-semibold text-primary-700 hover:underline"
                >
                  Tandai disetor
                </ActionButton>
              )}
              <HapusButton action={deleteZakatAction.bind(null, z.id)} label={`Hapus data zakat ${z.nama}`} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}