import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DbNotice } from "@/components/db-notice";
import { HapusButton } from "@/components/admin/hapus-button";
import { formatTanggal, getSaran } from "@/lib/data";
import { deleteSaranAction, updateSaranStatusAction } from "@/lib/actions";

const toneFor = (s: string): "green" | "yellow" | "neutral" => (s === "Ditindaklanjuti" ? "green" : s === "Dibaca" ? "yellow" : "neutral");
const langkah = ["Baru", "Dibaca", "Ditindaklanjuti"] as const;

export default async function AdminSaranPage() {
  const { data, error } = await getSaran();

  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold text-primary-900">Kotak Saran Jamaah</h1>
      <DbNotice error={error} />
      <div className="grid gap-3">
        {data.length === 0 && <p className="text-sm text-foreground/50">Belum ada saran masuk.</p>}
        {data.map((s) => (
          <Card key={s.id} className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <Badge tone={toneFor(s.status)}>{s.status}</Badge>
              <span className="text-xs text-foreground/40">{formatTanggal(s.tanggal)}</span>
            </div>
            <p className="whitespace-pre-line text-sm text-foreground/80">{s.isi}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {langkah.filter((l) => l !== s.status).map((l) => (
                <form key={l} action={updateSaranStatusAction.bind(null, s.id, l)}>
                  <button type="submit" className="rounded-full border border-border px-2.5 py-1 text-xs font-semibold hover:bg-muted">
                    Tandai {l}
                  </button>
                </form>
              ))}
              <span className="ml-auto">
                <HapusButton action={deleteSaranAction.bind(null, s.id)} label="Hapus saran" />
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
