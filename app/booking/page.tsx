import { CalendarRange } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { DbNotice } from "@/components/db-notice";
import { EmptyState } from "@/components/empty-state";
import { FormPublik, SubmitButton } from "@/components/pesan-form";
import { submitBookingAction } from "@/lib/actions";
import { formatTanggal, getBooking, getFasilitas, hariIniWIB } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Booking Fasilitas — DKM Masjid Jami' Al Barokah" };

export default async function BookingPage() {
  const [{ data: fasilitas, error: e1 }, { data: booking, error: e2 }] = await Promise.all([getFasilitas(), getBooking()]);
  const hariIni = hariIniWIB();
  // Publik hanya menerima baris "Disetujui" dari database (RLS) — tampilkan yang mendatang.
  const terpakai = booking.filter((b) => b.tanggal >= hariIni);

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <PageHeader
        title="Booking Fasilitas"
        description="Ajukan penggunaan fasilitas masjid untuk kegiatan, seperti akad nikah. Pengajuan akan ditinjau pengurus DKM."
      />
      <DbNotice error={e1 ?? e2} />

      <div className="grid gap-6 md:grid-cols-[1fr_1.1fr]">
        <Card className="p-5">
          <p className="mb-3 text-sm font-semibold text-foreground/80">Ajukan Booking</p>
          {fasilitas.length === 0 ? (
            <EmptyState icon={CalendarRange} title="Belum ada fasilitas yang bisa dipesan" hint="Pengurus belum menambahkan daftar fasilitas." />
          ) : (
            <FormPublik action={submitBookingAction}>
              <Select name="fasilitasId" required aria-label="Pilih fasilitas" defaultValue="">
                <option value="" disabled>Pilih fasilitas…</option>
                {fasilitas.map((f) => (
                  <option key={f.id} value={f.id}>{f.nama}</option>
                ))}
              </Select>
              <Input name="namaPemesan" placeholder="Nama pemesan" required maxLength={120} aria-label="Nama pemesan" />
              <Textarea name="keperluan" placeholder="Keperluan acara" rows={3} required maxLength={300} aria-label="Keperluan acara" />
              <Input type="date" name="tanggal" required min={hariIni} aria-label="Tanggal penggunaan" />
              <SubmitButton>Ajukan</SubmitButton>
            </FormPublik>
          )}
        </Card>

        <div>
          <p className="mb-3 text-sm font-semibold text-foreground/80">Jadwal Fasilitas Terpakai</p>
          {terpakai.length === 0 ? (
            <EmptyState icon={CalendarRange} title="Belum ada jadwal terpakai" hint="Pengajuan yang sudah disetujui akan tampil di sini." />
          ) : (
            <div className="grid gap-3">
              {terpakai.map((b) => (
                <Card key={b.id} className="p-4">
                  <p className="font-semibold">{fasilitas.find((x) => x.id === b.fasilitasId)?.nama ?? "Fasilitas"}</p>
                  <p className="mt-0.5 text-sm text-foreground/60">{formatTanggal(b.tanggal)}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
