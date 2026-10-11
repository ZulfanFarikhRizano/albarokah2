import { DbNotice } from "@/components/db-notice";
import { KiblatCompass } from "@/components/kiblat-compass";
import { getPengaturan } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Arah Kiblat — DKM Masjid Jami' Al Barokah" };

export default async function KiblatPage() {
  const { data: p, error } = await getPengaturan();
  // Koordinat masjid dipakai sebagai titik acuan bila GPS pengguna tidak tersedia.
  // Tanpa koordinat, kompas tetap bekerja lewat GPS HP (lihat komponen).
  return (
    <>
      {error && (
        <div className="mx-auto max-w-md px-4 pt-6">
          <DbNotice error={error} />
        </div>
      )}
      <KiblatCompass lat={p.lat ?? -6.595038} lng={p.lng ?? 106.816635} />
    </>
  );
}
