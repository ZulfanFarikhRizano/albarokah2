import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DbNotice } from "@/components/db-notice";
import { HapusButton } from "@/components/admin/hapus-button";
import { formatRupiah } from "@/lib/utils";
import { formatTanggal, getKas, hariIniWIB } from "@/lib/data";
import { addKasAction, deleteKasAction } from "@/lib/actions";

export default async function AdminKasPage() {
  const { data: kas, error } = await getKas();

  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold text-primary-900">Kelola Kas</h1>
      <DbNotice error={error} />

      <Card className="mb-6 p-5">
        <p className="mb-3 text-sm font-semibold text-foreground/80">Tambah Transaksi</p>
        <form action={addKasAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Input type="date" name="tanggal" required defaultValue={hariIniWIB()} aria-label="Tanggal" />
          <Input name="keterangan" placeholder="Keterangan" required maxLength={200} aria-label="Keterangan" className="lg:col-span-2" />
          <Select name="kategori" aria-label="Kategori">
            <option value="Pemasukan">Pemasukan</option>
            <option value="Pengeluaran">Pengeluaran</option>
          </Select>
          <Input type="number" name="nominal" placeholder="Nominal (Rp)" required aria-label="Nominal" min={0} />
          <Button type="submit" className="justify-self-start sm:col-span-2 lg:col-span-5">Simpan Transaksi</Button>
        </form>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/60 text-left text-foreground/50">
                <th scope="col" className="px-4 py-3 font-medium">Tanggal</th>
                <th scope="col" className="px-4 py-3 font-medium">Keterangan</th>
                <th scope="col" className="px-4 py-3 font-medium">Kategori</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Nominal</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {kas.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-foreground/50">Belum ada transaksi.</td></tr>
              )}
              {kas.map((k) => (
                <tr key={k.id} className="border-b border-border last:border-0">
                  <td className="tabular whitespace-nowrap px-4 py-3">{formatTanggal(k.tanggal)}</td>
                  <td className="px-4 py-3">{k.keterangan}</td>
                  <td className="px-4 py-3">{k.kategori}</td>
                  <td className="tabular px-4 py-3 text-right font-semibold">{formatRupiah(k.nominal)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <HapusButton action={deleteKasAction.bind(null, k.id)} label={`Hapus transaksi ${k.keterangan}`} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
