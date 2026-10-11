import { Wallet } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { DbNotice } from "@/components/db-notice";
import { EmptyState } from "@/components/empty-state";
import { formatRupiah } from "@/lib/utils";
import { formatTanggal, getKas, ringkasKas } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Transparansi Kas — DKM Masjid Jami' Al Barokah" };

export default async function KasPage() {
  const { data: kas, error } = await getKas();
  const { masuk, keluar, saldo } = ringkasKas(kas);

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <PageHeader
        title="Transparansi Kas Masjid"
        description="Seluruh transaksi tercatat dan diperbarui langsung oleh bendahara."
      />
      <DbNotice error={error} />

      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-foreground/50">Saldo</p>
          <p className="tabular mt-1 truncate text-lg font-bold text-primary-700">{formatRupiah(saldo)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-foreground/50">Total Pemasukan</p>
          <p className="tabular mt-1 truncate text-lg font-bold">{formatRupiah(masuk)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-foreground/50">Total Pengeluaran</p>
          <p className="tabular mt-1 truncate text-lg font-bold">{formatRupiah(keluar)}</p>
        </Card>
      </div>

      <div className="mt-6">
        {kas.length === 0 ? (
          <EmptyState icon={Wallet} title="Belum ada transaksi tercatat" hint="Transaksi akan tampil di sini setelah bendahara mencatatnya." />
        ) : (
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <caption className="sr-only">Riwayat transaksi kas masjid</caption>
                <thead>
                  <tr className="border-b border-border bg-muted/60 text-left text-foreground/50">
                    <th scope="col" className="px-4 py-3 font-medium">Tanggal</th>
                    <th scope="col" className="px-4 py-3 font-medium">Keterangan</th>
                    <th scope="col" className="px-4 py-3 font-medium">Kategori</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  {kas.map((k) => (
                    <tr key={k.id} className="border-b border-border last:border-0">
                      <td className="tabular whitespace-nowrap px-4 py-3">{formatTanggal(k.tanggal)}</td>
                      <td className="px-4 py-3">{k.keterangan}</td>
                      <td className="px-4 py-3">{k.kategori}</td>
                      <td
                        className={`tabular whitespace-nowrap px-4 py-3 text-right font-semibold ${
                          k.kategori === "Pemasukan" ? "text-primary-700" : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {k.kategori === "Pemasukan" ? "+" : "-"}
                        {formatRupiah(k.nominal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
