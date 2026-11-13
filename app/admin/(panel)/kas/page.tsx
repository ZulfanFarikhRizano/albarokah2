import { Card } from "@/components/ui/card";
import { DbNotice } from "@/components/db-notice";
import { FormTambahKas } from "@/components/admin/form-tambah-kas";
import { KasTableClient } from "@/components/admin/kas-table-client";
import { getKas } from "@/lib/data";

export default async function AdminKasPage() {
  const { data: kas, error } = await getKas();

  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold text-primary-900 dark:text-primary-400">
        Kelola Kas
      </h1>
      <DbNotice error={error} />

      {/* Kartu Form Tambah Kas */}
      <Card className="p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <p className="mb-3 text-sm font-bold text-slate-700">
          Catat Transaksi Baru
        </p>
        <FormTambahKas />
      </Card>

      {/* Memanggil Tabel Client Component yang berisi Filter & Download CSV */}
      <KasTableClient initialData={kas || []} />
    </div>
  );
}