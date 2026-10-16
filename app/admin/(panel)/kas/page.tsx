import { Card } from "@/components/ui/card";
import { DbNotice } from "@/components/db-notice";
import { HapusButton } from "@/components/admin/hapus-button";
import { FormTambahKas } from "@/components/admin/form-tambah-kas";
import { formatRupiah } from "@/lib/utils";
import { formatTanggal, getKas } from "@/lib/data";
import { deleteKasAction } from "@/lib/actions";

export default async function AdminKasPage() {
  const { data: kas, error } = await getKas();

  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold text-primary-900 dark:text-primary-400">
        Kelola Kas
      </h1>
      <DbNotice error={error} />

      {/* Kartu Form Tambah Kas dengan state loading & notifikasi */}
      <Card className="mb-6 p-5 border border-slate-200 dark:border-slate-800">
        <p className="mb-3 text-sm font-semibold text-foreground/80">
          Tambah Transaksi
        </p>
        <FormTambahKas />
      </Card>

      {/* Tabel Data Kas */}
      <Card className="overflow-hidden p-0 border border-slate-200 dark:border-slate-800">
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
              {(!kas || kas.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-foreground/50">
                    Belum ada transaksi.
                  </td>
                </tr>
              )}
              {kas?.map((k) => (
                <tr key={k.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="tabular whitespace-nowrap px-4 py-3">
                    {formatTanggal(k.tanggal)}
                  </td>
                  <td className="px-4 py-3">{k.keterangan}</td>
                  <td className="px-4 py-3">{k.kategori}</td>
                  <td className="tabular px-4 py-3 text-right font-semibold">
                    {formatRupiah(k.nominal)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      {/* Menggunakan HapusButton dengan modal konfirmasi kustom */}
                      <HapusButton
                        action={deleteKasAction.bind(null, k.id)}
                        label={`Hapus transaksi ${k.keterangan}`}
                      />
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