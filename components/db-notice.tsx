import { AlertTriangle } from "lucide-react";

/** Pemberitahuan jika data gagal dimuat (database belum tersambung / error). */
export function DbNotice({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <div
      role="alert"
      className="mb-6 flex items-start gap-3 rounded-2xl border border-accent-300 bg-accent-100 p-4 text-sm text-foreground"
    >
      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-accent-500" />
      <div>
        <p className="font-semibold">Data belum bisa ditampilkan</p>
        <p className="mt-0.5 text-foreground/70">{error}</p>
      </div>
    </div>
  );
}
