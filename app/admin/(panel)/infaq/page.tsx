import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DbNotice } from "@/components/db-notice";
import { getPengaturan } from "@/lib/data";
import { saveInfaqAction } from "@/lib/actions";
import { AlertTriangle } from "lucide-react";
import { SubmitButton } from "@/components/submit-button";

export default async function AdminInfaqPage() {
  const { data: p, error } = await getPengaturan();
  const label = "mb-1.5 block text-sm font-semibold text-foreground/80";

  return (
    <div>
      <h1 className="mb-1 text-xl font-extrabold text-primary-900">Kelola Infaq Digital</h1>
      <p className="mb-6 text-sm text-foreground/55">Data ini tampil di halaman Infaq Digital untuk jamaah.</p>
      <DbNotice error={error} />

      <Card className="max-w-2xl p-5">
        <form action={saveInfaqAction} className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="bank" className={label}>Nama bank</label>
              <Input id="bank" name="bank" defaultValue={p.bank} placeholder="mis. BSI" maxLength={40} />
            </div>
            <div>
              <label htmlFor="rekening" className={label}>Nomor rekening</label>
              <Input id="rekening" name="rekening" defaultValue={p.rekening} inputMode="numeric" maxLength={40} />
            </div>
          </div>
          <div>
            <label htmlFor="atasNama" className={label}>Atas nama</label>
            <Input id="atasNama" name="atasNama" defaultValue={p.atasNama} placeholder="Sesuai buku rekening" maxLength={80} />
          </div>

          <div>
            <label htmlFor="qris" className={label}>Gambar QRIS</label>
            {p.qrisUrl && (
              <div className="mb-3 flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.qrisUrl} alt="QRIS saat ini" className="h-28 w-28 rounded-xl border border-border bg-white object-contain p-1" />
                <label className="flex items-center gap-2 text-sm text-foreground/70 cursor-pointer hover:text-red-600 transition">
                  <input type="checkbox" name="hapusQris" className="rounded border-slate-300" /> Hapus QRIS ini
                </label>
              </div>
            )}
            <input
              id="qris"
              name="qris"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="block w-full text-sm text-foreground/70 file:mr-3 file:rounded-full file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-700 hover:file:bg-primary-100 transition-colors"
            />
            <p className="mt-1.5 text-xs text-foreground/45">PNG, JPG, atau WebP, maksimal 2 MB.</p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 transition-all hover:border-amber-300">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="maintenance"
                defaultChecked={p.infaqMaintenance === "true"}
                className="mt-1 h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-600 bg-white"
              />
              <div className="flex-1">
                <p className="flex items-center gap-2 text-sm font-bold text-amber-900">
                  <AlertTriangle size={16} /> Mode Pemeliharaan (Maintenance)
                </p>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  Centang ini untuk menonaktifkan seluruh layanan transaksi digital (QRIS & Transfer Bank) di halaman jamaah secara bersamaan saat terjadi gangguan sistem.
                </p>
              </div>
            </label>
          </div>

          <SubmitButton label="Simpan Perubahan" />
        </form>
      </Card>
    </div>
  );
}