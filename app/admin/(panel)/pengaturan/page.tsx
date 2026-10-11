import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DbNotice } from "@/components/db-notice";
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
          <div key={f.key} className="flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="font-semibold">{f.nama}</p>
              <p className="text-sm text-foreground/55">{f.aktif ? "Tampil di website" : "Disembunyikan"}</p>
            </div>
            <form action={setFiturMusimanAction.bind(null, f.key, !f.aktif)}>
              <Button type="submit" variant={f.aktif ? "outline" : "primary"}>
                {f.aktif ? "Sembunyikan" : "Tampilkan"}
              </Button>
            </form>
          </div>
        ))}
      </Card>

      <h2 className="mb-1 font-bold text-primary-900">Lokasi Masjid</h2>
      <p className="mb-3 text-sm text-foreground/55">
        Dipakai untuk menghitung jadwal sholat dan arah kiblat. Salin koordinat dari Google Maps (klik kanan pada titik masjid).
      </p>
      <Card className="max-w-2xl p-5">
        <form action={saveLokasiAction} className="grid gap-4 sm:grid-cols-2">
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
          <Button type="submit" className="justify-self-start sm:col-span-2">Simpan Lokasi</Button>
        </form>
      </Card>
    </div>
  );
}
