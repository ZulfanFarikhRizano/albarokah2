import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DbNotice } from "@/components/db-notice";
import { HapusButton } from "@/components/admin/hapus-button";
import { formatTanggal, getBooking, getFasilitas } from "@/lib/data";
import { addFasilitasAction, deleteBookingAction, deleteFasilitasAction, updateBookingStatusAction } from "@/lib/actions";

const toneFor = (s: string): "green" | "yellow" | "neutral" => (s === "Disetujui" ? "green" : s === "Ditolak" ? "neutral" : "yellow");

export default async function AdminBookingPage() {
  const [{ data: booking, error: e1 }, { data: fasilitas, error: e2 }] = await Promise.all([getBooking(), getFasilitas()]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold text-primary-900">Booking &amp; Fasilitas</h1>
      <DbNotice error={e1 ?? e2} />

      <h2 className="mb-3 font-bold text-primary-900">Daftar Fasilitas</h2>
      <Card className="mb-8 p-5">
        <form action={addFasilitasAction} className="grid gap-3 sm:grid-cols-2">
          <Input name="nama" placeholder="Nama fasilitas (mis. Aula)" required maxLength={100} aria-label="Nama fasilitas" />
          <Textarea name="deskripsi" placeholder="Keterangan singkat (opsional)" rows={1} maxLength={300} aria-label="Keterangan" />
          <Button type="submit" className="justify-self-start sm:col-span-2">Tambah Fasilitas</Button>
        </form>
        {fasilitas.length > 0 && (
          <ul className="mt-4 divide-y divide-border border-t border-border">
            {fasilitas.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3 py-2.5">
                <div>
                  <p className="font-medium">{f.nama}</p>
                  {f.deskripsi && <p className="text-sm text-foreground/55">{f.deskripsi}</p>}
                </div>
                <HapusButton action={deleteFasilitasAction.bind(null, f.id)} label={`Hapus fasilitas ${f.nama}`} konfirmasi={`Hapus fasilitas ${f.nama}? Semua booking terkait ikut terhapus.`} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <h2 className="mb-3 font-bold text-primary-900">Pengajuan Booking</h2>
      {booking.length === 0 && <p className="text-sm text-foreground/50">Belum ada pengajuan.</p>}
      <div className="grid gap-3">
        {booking.map((b) => (
          <Card key={b.id} className="p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="font-semibold">{fasilitas.find((x) => x.id === b.fasilitasId)?.nama ?? "Fasilitas"}</p>
              <Badge tone={toneFor(b.status)}>{b.status}</Badge>
            </div>
            <p className="text-sm text-foreground/60">{b.namaPemesan} · {b.keperluan}</p>
            <p className="text-sm text-foreground/40">{formatTanggal(b.tanggal)}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {b.status !== "Disetujui" && (
                <form action={updateBookingStatusAction.bind(null, b.id, "Disetujui")}>
                  <button type="submit" className="rounded-full bg-primary-600 px-3 py-1 text-xs font-semibold text-white hover:brightness-110">Setujui</button>
                </form>
              )}
              {b.status !== "Ditolak" && (
                <form action={updateBookingStatusAction.bind(null, b.id, "Ditolak")}>
                  <button type="submit" className="rounded-full border border-border px-3 py-1 text-xs font-semibold hover:bg-muted">Tolak</button>
                </form>
              )}
              <span className="ml-auto"><HapusButton action={deleteBookingAction.bind(null, b.id)} label="Hapus pengajuan" /></span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
