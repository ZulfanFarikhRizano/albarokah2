import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DbNotice } from "@/components/db-notice";
import { ActionForm } from "@/components/admin/action-form";
import { FiturToggle } from "@/components/admin/fitur-toggle";
import { SubmitButton } from "@/components/submit-button";
import { getPengaturan } from "@/lib/data";
import { saveLokasiAction, setFiturMusimanAction } from "@/lib/actions";

export default async function AdminPengaturanPage() {
  const { data: p, error } = await getPengaturan();
  const label = "mb-1.5 block text-sm font-semibold text-foreground/80";

  const fitur = [
    { key: "zakat" as const, nama: "Zakat & BAZNAS", aktif: p.zakatAktif },
    { key: "kurban" as const, nama: "Data Kurban", aktif: p.kurbanAktif },
  ];

  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold text-primary-900">Pengaturan</h1>
      <DbNotice error={error} />

      <h2 className="mb-1 font-bold text-primary-900">Fitur Musiman</h2>
      <p className="mb-3 text-sm text-foreground/55">
        Disembunyikan dari beranda dan footer sampai Anda menyalakannya (mis. menjelang Ramadhan atau Idul Adha).
      </p>
      <Card className="mb-8 divide-y divide-border p-0">
        {fitur.map((f) => (
          <FiturToggle key={f.key} nama={f.nama} aktif={f.aktif} action={setFiturMusimanAction.bind(null, f.key)} />
        ))}
      </Card>

      <h2 className="mb-1 font-bold text-primary-900">Lokasi Masjid</h2>
      <p className="mb-3 text-sm text-foreground/55">
        Dipakai untuk menghitung jadwal sholat dan arah kiblat. Salin koordinat dari Google Maps (klik kanan pada titik masjid).
      </p>
      <Card className="max-w-2xl p-5">
        <ActionForm action={saveLokasiAction} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="lokasi" className={label}>Nama lokasi (tampil di kartu jadwal sholat)</label>
            <Input id="lokasi" name="lokasi" defaultValue={p.lokasi} maxLength={120} />
          </div>
          <div>
            <label htmlFor="lat" className={label}>Latitude</label>
            <Input id="lat" name="lat" defaultValue={p.lat ?? ""} inputMode="decimal" required />
          </div>
          <div>
            <label htmlFor="lng" className={label}>Longitude</label>
            <Input id="lng" name="lng" defaultValue={p.lng ?? ""} inputMode="decimal" required />
          </div>
          <SubmitButton label="Simpan Lokasi" className="sm:col-span-2" />
        </ActionForm>
      </Card>
    </div>
  );
}